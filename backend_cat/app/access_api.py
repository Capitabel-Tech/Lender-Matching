"""The admin-only Manage Admins + Activity Log views — separate from
admin_api.py's own routes just to keep this file focused on account
management rather than lender data, but gated by the same require_admin
dependency. There's no higher tier above "admin" that's needed to promote,
demote, or revoke someone — every admin can manage every other admin,
deliberately flat rather than hierarchical.

Access itself lives entirely on the Firebase account as a custom claim
(role: "business" | "admin" | unset) — not a database row, so there's
nothing here for anyone to hand-edit outside this flow. See app/auth.py
for how the claim is read back out on every request.

Every account starts at "business" the moment it signs up (see
app/business_api.py) — no approval step, no pending state. An admin
promotes someone to admin (or demotes them) straight from the Manage
Admins list below, whenever they choose to — and every such change is
attributed in the activity log below, so it's always clear who granted
access to whom. Revoking someone doesn't erase them from that list either
— they stay visible as "revoked" so access can be granted again in one
click instead of them needing to sign up from scratch.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from firebase_admin import auth as firebase_auth
from sqlalchemy.ext.asyncio import AsyncSession

from app.activity_log import list_activity, log_activity
from app.admin_schemas import ActivityLogEntryOut, AdminAccountOut
from app.auth import ADMIN_ROLE, ALL_ROLES, BUSINESS_ROLE, PROTECTED_EMAILS, LoggedInUser, _firebase_app, require_admin_user
from app.database import get_db

access_router = APIRouter(prefix="/api/v1/admin", tags=["admin-access"])


@access_router.get("/admins")
async def list_admins(caller: Annotated[LoggedInUser, Depends(require_admin_user)]) -> list[AdminAccountOut]:
    """Everyone who currently has an account, plus anyone previously revoked
    — revoking cuts off access but deliberately doesn't erase the person
    from this list, so they can be granted access again with one click
    instead of needing to sign up from scratch. Sorted: whoever's viewing
    this first, then the protected accounts, then every other admin, then
    business, then revoked last."""

    def sort_tier(a: AdminAccountOut) -> int:
        if a.email == caller.email:
            return 0
        if a.protected:
            return 1
        if a.revoked:
            return 4
        if a.role == ADMIN_ROLE:
            return 2
        return 3

    admins: list[AdminAccountOut] = []
    for user_record in firebase_auth.list_users(app=_firebase_app).iterate_all():
        claims = user_record.custom_claims or {}
        role = claims.get("role")
        revoked = bool(claims.get("revoked", False))
        if role in ALL_ROLES or revoked:
            admins.append(
                AdminAccountOut(
                    uid=user_record.uid,
                    email=user_record.email or user_record.uid,
                    role=role or "",
                    display_name=claims.get("display_name"),
                    org_role=claims.get("org_role"),
                    admin_requested=bool(claims.get("admin_requested", False)),
                    revoked=revoked,
                    protected=user_record.email in PROTECTED_EMAILS,
                )
            )
    admins.sort(key=lambda a: (sort_tier(a), a.email))
    return admins


@access_router.post("/admins/{uid}/set-role")
async def set_account_role(
    uid: str,
    new_role: str,
    request: Request,
    caller: Annotated[LoggedInUser, Depends(require_admin_user)],
) -> dict[str, str]:
    """Promotes or demotes an already-assigned account between business and
    admin — e.g. turning a just-signed-up business account into a full
    admin, or stepping someone back down to business. Also how a
    previously revoked account gets access back: the fresh claims payload
    below never includes the "revoked" marker, so setting a role here
    clears it automatically. Logged with who did it, so it's always clear
    who granted access to whom."""
    if new_role not in ALL_ROLES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"role must be one of {sorted(ALL_ROLES)}.")
    if uid == caller.uid:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You can't change your own role.")
    try:
        target = firebase_auth.get_user(uid, app=_firebase_app)
        existing_claims = target.custom_claims or {}
        # Preserve display_name/org_role (set once at signup) across a role
        # change — set_custom_user_claims replaces the whole claims dict, it
        # doesn't merge. admin_requested is deliberately dropped: any
        # explicit role change here resolves a pending request either way,
        # whether that's approving it (promoted to admin) or dismissing it
        # (left at business, or demoted from a role they already had).
        # admin_grant_unseen flags a fresh promotion so /admin shows a
        # one-time "you've been granted access" screen before the real
        # dashboard — cleared by app/business_api.py's acknowledge-admin-grant.
        new_claims = {
            "role": new_role,
            "display_name": existing_claims.get("display_name"),
            "org_role": existing_claims.get("org_role"),
        }
        if new_role == ADMIN_ROLE:
            new_claims["admin_grant_unseen"] = True
        firebase_auth.set_custom_user_claims(uid, new_claims, app=_firebase_app)
        # Deliberately NOT revoking refresh tokens here (unlike
        # revoke_admin_access below) — this person should stay logged in and
        # just pick up the new role on their next poll (getIdTokenResult
        # with forceRefresh reads the updated claim using their existing,
        # still-valid session). Revoking would sign them out entirely
        # instead of smoothly transitioning them, breaking the "bell
        # notification, access just updates" flow this is built for.
    except firebase_auth.UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No such account.") from exc
    await log_activity(request, caller.email, f"Set {target.email or uid}'s role to {new_role}")
    return {"status": "updated", "role": new_role}


@access_router.post("/admins/{uid}/dismiss-request")
async def dismiss_admin_request(
    uid: str, request: Request, caller: Annotated[LoggedInUser, Depends(require_admin_user)]
) -> dict[str, str]:
    """Clears a pending admin-access request without changing the account's
    role — for when an admin wants to say no rather than promote."""
    try:
        target = firebase_auth.get_user(uid, app=_firebase_app)
        existing_claims = target.custom_claims or {}
        if not existing_claims.get("admin_requested"):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "No pending request for this account.")
        firebase_auth.set_custom_user_claims(
            uid, {k: v for k, v in existing_claims.items() if k != "admin_requested"}, app=_firebase_app
        )
    except firebase_auth.UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No such account.") from exc
    await log_activity(request, caller.email, f"Dismissed {target.email or uid}'s admin access request")
    return {"status": "dismissed"}


@access_router.post("/admins/{uid}/revoke")
async def revoke_admin_access(
    uid: str, request: Request, caller: Annotated[LoggedInUser, Depends(require_admin_user)]
) -> dict[str, str]:
    """Cuts off admin access immediately — drops the account back to
    business (Explore-only, not a full lockout) and invalidates any session
    they're currently using, so it takes effect right away rather than the
    next time their login token would naturally expire. Keeps their
    name/org role and a "revoked" marker instead of wiping the claims
    blank, so Manage Admins still shows them (as Revoked, sorted last) and
    the /explore Admin button tells them specifically that access was
    removed rather than that they never had it. set_account_role's fresh
    claims payload drops that marker the moment they're granted access
    again."""
    if uid == caller.uid:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You can't revoke your own access.")
    try:
        target = firebase_auth.get_user(uid, app=_firebase_app)
        if target.email in PROTECTED_EMAILS:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "This account's access can't be revoked.")
        existing_claims = target.custom_claims or {}
        firebase_auth.set_custom_user_claims(
            uid,
            {
                "role": BUSINESS_ROLE,
                "revoked": True,
                "display_name": existing_claims.get("display_name"),
                "org_role": existing_claims.get("org_role"),
            },
            app=_firebase_app,
        )
        firebase_auth.revoke_refresh_tokens(uid, app=_firebase_app)
    except firebase_auth.UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No such account.") from exc
    await log_activity(request, caller.email, f"Revoked admin access for {target.email or uid}")
    return {"status": "revoked"}


@access_router.delete("/admins/{uid}")
async def delete_account(
    uid: str, request: Request, caller: Annotated[LoggedInUser, Depends(require_admin_user)]
) -> dict[str, str]:
    """Permanently deletes a revoked account's Firebase login — distinct
    from revoke (which just cuts admin power and keeps the account around,
    listed as Revoked, so it can be granted access again with one click).
    This is for cleaning up revoked accounts once there are enough of them
    sitting around that they're not coming back; only ever allowed on an
    already-revoked account, never one with active access — revoke it
    first. There's no undo: the person would need to sign up completely
    fresh afterward."""
    if uid == caller.uid:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You can't delete your own account.")
    try:
        target = firebase_auth.get_user(uid, app=_firebase_app)
        if target.email in PROTECTED_EMAILS:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "This account can't be deleted.")
        if not (target.custom_claims or {}).get("revoked"):
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, "Only a revoked account can be deleted — revoke it first."
            )
        firebase_auth.delete_user(uid, app=_firebase_app)
    except firebase_auth.UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No such account.") from exc
    await log_activity(request, caller.email, f"Deleted account for {target.email or uid}")
    return {"status": "deleted"}


@access_router.get("/activity-log")
async def get_activity_log(
    session: Annotated[AsyncSession, Depends(get_db)], _: Annotated[LoggedInUser, Depends(require_admin_user)]
) -> list[ActivityLogEntryOut]:
    """The log itself only ever stored the actor's email (see
    app/activity_log.py) — no name, since there's no persistent link to
    account data. Names shown here are resolved live against Firebase by
    email, so an entry from an account that's since been deleted just
    shows no name rather than a stale or wrong one."""
    entries = await list_activity(session)
    names_by_email = {
        u.email: (u.custom_claims or {}).get("display_name")
        for u in firebase_auth.list_users(app=_firebase_app).iterate_all()
        if u.email
    }
    return [
        ActivityLogEntryOut(
            actor_email=e.actor_email,
            actor_name=names_by_email.get(e.actor_email),
            action=e.action,
            ip_address=e.ip_address,
            created_at=e.created_at.isoformat(),
        )
        for e in entries
    ]

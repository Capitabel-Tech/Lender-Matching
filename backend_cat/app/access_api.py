"""Login-status check, access-request approval, and the super-admin-only
Manage Admins + Activity Log views — separate from admin_api.py because
these routes need different gates per-route (require_login only for
/status, require_super_admin for everything else here) rather than the one
blanket gate admin_router applies to every lender-data route.

Approval state lives entirely on the Firebase account itself, as a custom
claim (role: "admin" | "super_admin" | unset) — not a database row, so
there's no separate table to keep in sync and nothing an admin could edit by
hand outside this flow. See app/auth.py for how the claim is read back out
on every request.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from firebase_admin import auth as firebase_auth
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.activity_log import list_activity, log_activity
from app.admin_schemas import (
    AccessRequestOut,
    ActivityLogEntryOut,
    AdminAccountOut,
    AdminStatusOut,
    ProfileIn,
)
from app.auth import ALL_ROLES, LoggedInUser, _firebase_app, require_login, require_super_admin
from app.database import AccessRequestProfileModel, get_db

access_router = APIRouter(prefix="/api/v1/admin", tags=["admin-access"])


@access_router.get("/status")
async def status_check(
    user: Annotated[LoggedInUser, Depends(require_login)], session: Annotated[AsyncSession, Depends(get_db)]
) -> AdminStatusOut:
    """Polled by the "waiting for approval" screen — works for a logged-in
    account regardless of whether it's been approved yet, unlike /me."""
    profile = await session.get(AccessRequestProfileModel, user.uid)
    return AdminStatusOut(email=user.email, role=user.role, has_profile=profile is not None)


@access_router.post("/profile")
async def submit_profile(
    data: ProfileIn, user: Annotated[LoggedInUser, Depends(require_login)], session: Annotated[AsyncSession, Depends(get_db)]
) -> dict[str, str]:
    """Filled in once, right after a brand new account's first Google
    sign-in — the name/phone a super admin sees next to the bare email
    when deciding whether to approve. Keyed by the caller's own uid (from
    their verified token, never trusted from the request body), so nobody
    can submit a profile claiming to be someone else."""
    stmt = (
        insert(AccessRequestProfileModel)
        .values(uid=user.uid, name=data.name, phone=data.phone, email=user.email)
        .on_conflict_do_update(index_elements=["uid"], set_={"name": data.name, "phone": data.phone})
    )
    await session.execute(stmt)
    await session.commit()
    return {"status": "saved"}


@access_router.get("/access-requests")
async def list_access_requests(
    _: Annotated[LoggedInUser, Depends(require_super_admin)], session: Annotated[AsyncSession, Depends(get_db)]
) -> list[AccessRequestOut]:
    """Every enabled Firebase account that doesn't already have an approved
    role — i.e. everyone waiting on a decision. Excludes business accounts
    too (ALL_ROLES, not just ADMIN_ROLES) — they already have a role, just
    not an admin one, so they're not "pending" anything."""
    profiles = {
        row.uid: row for row in (await session.execute(select(AccessRequestProfileModel))).scalars().all()
    }
    pending: list[AccessRequestOut] = []
    for user_record in firebase_auth.list_users(app=_firebase_app).iterate_all():
        if user_record.disabled:
            continue
        if (user_record.custom_claims or {}).get("role") in ALL_ROLES:
            continue
        created_at = user_record.user_metadata.creation_timestamp if user_record.user_metadata else None
        profile = profiles.get(user_record.uid)
        pending.append(
            AccessRequestOut(
                uid=user_record.uid,
                email=user_record.email or user_record.uid,
                name=profile.name if profile else None,
                phone=profile.phone if profile else None,
                requested_at=str(created_at) if created_at is not None else None,
            )
        )
    return pending


@access_router.post("/access-requests/{uid}/approve")
async def approve_access_request(
    uid: str, request: Request, caller: Annotated[LoggedInUser, Depends(require_super_admin)]
) -> dict[str, str]:
    try:
        target = firebase_auth.get_user(uid, app=_firebase_app)
        firebase_auth.set_custom_user_claims(uid, {"role": "admin"}, app=_firebase_app)
    except firebase_auth.UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No such account.") from exc
    await log_activity(request, caller.email, f"Approved access for {target.email or uid}")
    return {"status": "approved"}


@access_router.post("/access-requests/{uid}/deny")
async def deny_access_request(
    uid: str, request: Request, caller: Annotated[LoggedInUser, Depends(require_super_admin)]
) -> dict[str, str]:
    """Disables the Firebase account outright rather than leaving it pending
    forever — a denied request shouldn't just sit there re-appearing."""
    try:
        target = firebase_auth.get_user(uid, app=_firebase_app)
        firebase_auth.update_user(uid, disabled=True, app=_firebase_app)
    except firebase_auth.UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No such account.") from exc
    await log_activity(request, caller.email, f"Denied access for {target.email or uid}")
    return {"status": "denied"}


@access_router.get("/admins")
async def list_admins(_: Annotated[LoggedInUser, Depends(require_super_admin)]) -> list[AdminAccountOut]:
    """Everyone who currently has real access — admin, super_admin, AND
    business accounts (self-service Explore signups) — not pending admin
    requests, which /access-requests covers separately. This is what the
    Manage Admins screen shows, including the promote/demote controls for
    business accounts."""
    admins: list[AdminAccountOut] = []
    for user_record in firebase_auth.list_users(app=_firebase_app).iterate_all():
        role = (user_record.custom_claims or {}).get("role")
        if role in ALL_ROLES:
            admins.append(AdminAccountOut(uid=user_record.uid, email=user_record.email or user_record.uid, role=role))
    return admins


@access_router.post("/admins/{uid}/set-role")
async def set_account_role(
    uid: str,
    new_role: str,
    request: Request,
    caller: Annotated[LoggedInUser, Depends(require_super_admin)],
) -> dict[str, str]:
    """Promotes or demotes an already-assigned account between business,
    admin, and super_admin — e.g. turning a business (Explore-only) user
    into a full admin, or stepping a super admin back down to business.
    Distinct from approve_access_request above, which only ever grants
    "admin" to a brand new, still-pending request."""
    if new_role not in ALL_ROLES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"role must be one of {sorted(ALL_ROLES)}.")
    if uid == caller.uid:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You can't change your own role.")
    try:
        target = firebase_auth.get_user(uid, app=_firebase_app)
        firebase_auth.set_custom_user_claims(uid, {"role": new_role}, app=_firebase_app)
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


@access_router.post("/admins/{uid}/revoke")
async def revoke_admin_access(
    uid: str, request: Request, caller: Annotated[LoggedInUser, Depends(require_super_admin)]
) -> dict[str, str]:
    """Cuts off an already-approved admin immediately — removes their role
    AND invalidates any session they're currently using, so it takes effect
    right away rather than the next time their login token would naturally
    expire."""
    if uid == caller.uid:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You can't revoke your own access.")
    try:
        target = firebase_auth.get_user(uid, app=_firebase_app)
        firebase_auth.set_custom_user_claims(uid, {}, app=_firebase_app)
        firebase_auth.revoke_refresh_tokens(uid, app=_firebase_app)
    except firebase_auth.UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No such account.") from exc
    await log_activity(request, caller.email, f"Revoked access for {target.email or uid}")
    return {"status": "revoked"}


@access_router.get("/activity-log")
async def get_activity_log(
    session: Annotated[AsyncSession, Depends(get_db)], _: Annotated[LoggedInUser, Depends(require_super_admin)]
) -> list[ActivityLogEntryOut]:
    entries = await list_activity(session)
    return [
        ActivityLogEntryOut(
            actor_email=e.actor_email, action=e.action, ip_address=e.ip_address, created_at=e.created_at.isoformat()
        )
        for e in entries
    ]

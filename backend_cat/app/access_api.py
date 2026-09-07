"""The super-admin-only Manage Admins + Activity Log views — separate from
admin_api.py because these routes need require_super_admin rather than the
require_admin gate admin_router applies to every lender-data route.

Access itself lives entirely on the Firebase account as a custom claim
(role: "business" | "admin" | "super_admin" | unset) — not a database row,
so there's nothing here for anyone to hand-edit outside this flow. See
app/auth.py for how the claim is read back out on every request.

Every account starts at "business" the moment it signs up (see
app/business_api.py) — no approval step, no pending state. A super admin
promotes someone to admin/super_admin (or demotes them) straight from the
Manage Admins list below, whenever they choose to.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from firebase_admin import auth as firebase_auth
from sqlalchemy.ext.asyncio import AsyncSession

from app.activity_log import list_activity, log_activity
from app.admin_schemas import ActivityLogEntryOut, AdminAccountOut
from app.auth import ALL_ROLES, LoggedInUser, _firebase_app, require_super_admin
from app.database import get_db

access_router = APIRouter(prefix="/api/v1/admin", tags=["admin-access"])


@access_router.get("/admins")
async def list_admins(_: Annotated[LoggedInUser, Depends(require_super_admin)]) -> list[AdminAccountOut]:
    """Everyone who currently has an account — business, admin, and
    super_admin alike. This is what the Manage Admins screen shows,
    including the promote/demote controls."""
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
    admin, and super_admin — e.g. turning a just-signed-up business account
    into a full admin, or stepping someone back down to business."""
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
    """Cuts off an account's access entirely and immediately — removes their
    role AND invalidates any session they're currently using, so it takes
    effect right away rather than the next time their login token would
    naturally expire."""
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

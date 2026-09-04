"""Login-status check + access-request approval — separate from admin_api.py
because these routes need different gates per-route (require_login only for
/status, require_super_admin for approve/deny) rather than the one blanket
gate admin_router applies to every lender-data route.

Approval state lives entirely on the Firebase account itself, as a custom
claim (role: "admin" | "super_admin" | unset) — not a database row, so
there's no separate table to keep in sync and nothing an admin could edit by
hand outside this flow. See app/auth.py for how the claim is read back out
on every request.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from firebase_admin import auth as firebase_auth

from app.admin_schemas import AccessRequestOut, AdminStatusOut
from app.auth import ADMIN_ROLES, LoggedInUser, _firebase_app, require_login, require_super_admin

access_router = APIRouter(prefix="/api/v1/admin", tags=["admin-access"])


@access_router.get("/status")
async def status_check(user: Annotated[LoggedInUser, Depends(require_login)]) -> AdminStatusOut:
    """Polled by the "waiting for approval" screen — works for a logged-in
    account regardless of whether it's been approved yet, unlike /me."""
    return AdminStatusOut(email=user.email, role=user.role)


@access_router.get("/access-requests")
async def list_access_requests(_: Annotated[LoggedInUser, Depends(require_super_admin)]) -> list[AccessRequestOut]:
    """Every enabled Firebase account that doesn't already have an approved
    role — i.e. everyone waiting on a decision."""
    pending: list[AccessRequestOut] = []
    for user_record in firebase_auth.list_users(app=_firebase_app).iterate_all():
        if user_record.disabled:
            continue
        if (user_record.custom_claims or {}).get("role") in ADMIN_ROLES:
            continue
        created_at = user_record.user_metadata.creation_timestamp if user_record.user_metadata else None
        pending.append(
            AccessRequestOut(
                uid=user_record.uid,
                email=user_record.email or user_record.uid,
                requested_at=str(created_at) if created_at is not None else None,
            )
        )
    return pending


@access_router.post("/access-requests/{uid}/approve")
async def approve_access_request(uid: str, _: Annotated[LoggedInUser, Depends(require_super_admin)]) -> dict[str, str]:
    try:
        firebase_auth.set_custom_user_claims(uid, {"role": "admin"}, app=_firebase_app)
    except firebase_auth.UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No such account.") from exc
    return {"status": "approved"}


@access_router.post("/access-requests/{uid}/deny")
async def deny_access_request(uid: str, _: Annotated[LoggedInUser, Depends(require_super_admin)]) -> dict[str, str]:
    """Disables the Firebase account outright rather than leaving it pending
    forever — a denied request shouldn't just sit there re-appearing."""
    try:
        firebase_auth.update_user(uid, disabled=True, app=_firebase_app)
    except firebase_auth.UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No such account.") from exc
    return {"status": "denied"}

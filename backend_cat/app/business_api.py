"""Signup completion for every account, staff included — a brand new
Firebase account (created client-side via createUserWithEmailAndPassword)
has no role claim until this runs once, right after. No domain
restriction and no approval step: everyone starts at the same "business"
(Explore-only) tier the moment they sign up.

Only a super admin manually promoting someone (app/access_api.py's
set_account_role) grants anything beyond that — see app/auth.py's
require_any_role for what "business" alone gets you. A business account
can ask for that promotion itself via /request-admin below; it's still the
super admin's call whether to grant it.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from firebase_admin import auth as firebase_auth
from pydantic import BaseModel, Field

from app.activity_log import log_activity
from app.auth import BUSINESS_ROLE, LoggedInUser, _firebase_app, _verify_token

business_router = APIRouter(prefix="/api/v1/business", tags=["business"])


class BusinessSignupIn(BaseModel):
    display_name: str = Field(min_length=1, max_length=120)
    org_role: str = Field(min_length=1, max_length=120)


@business_router.post("/signup-complete")
async def complete_business_signup(
    payload: BusinessSignupIn, user: Annotated[LoggedInUser, Depends(_verify_token)]
) -> dict[str, str]:
    """Idempotent-safe: refuses to run if this account already has any role
    (business, admin, or super_admin) — a self-service call can only ever
    grant the one, lowest tier, never overwrite an existing assignment."""
    if user.role is not None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This account already has access set up.")
    firebase_auth.set_custom_user_claims(
        user.uid,
        {"role": BUSINESS_ROLE, "display_name": payload.display_name, "org_role": payload.org_role},
        app=_firebase_app,
    )
    return {"status": "activated"}


@business_router.post("/request-admin")
async def request_admin_access(
    request: Request, user: Annotated[LoggedInUser, Depends(_verify_token)]
) -> dict[str, str]:
    """Flags this business account as wanting admin access — shows up on the
    super admin's Manage Admins screen so they can approve (promote to
    admin) or dismiss it. Doesn't grant anything by itself."""
    if user.role != BUSINESS_ROLE:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Only a business account can request admin access.")
    firebase_auth.set_custom_user_claims(
        user.uid,
        {
            "role": user.role,
            "display_name": user.display_name,
            "org_role": user.org_role,
            "admin_requested": True,
        },
        app=_firebase_app,
    )
    await log_activity(request, user.email, "Requested admin access")
    return {"status": "requested"}

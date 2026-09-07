"""Business-user signup completion — a brand new Firebase account (created
client-side via createUserWithEmailAndPassword) has no role claim until this
runs once, right after. Deliberately open to any email domain, unlike admin
signup: business accounts are external partner companies, not company staff.

Approval-free by design — the whole point of this tier is self-service
browsing access to Explore Lenders (see app/auth.py's require_any_role).
Only a super admin manually promoting someone (app/access_api.py's
set_role) grants anything beyond that.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from firebase_admin import auth as firebase_auth

from app.auth import BUSINESS_ROLE, LoggedInUser, _firebase_app, _verify_token

business_router = APIRouter(prefix="/api/v1/business", tags=["business"])


@business_router.post("/signup-complete")
async def complete_business_signup(user: Annotated[LoggedInUser, Depends(_verify_token)]) -> dict[str, str]:
    """Idempotent-safe: refuses to run if this account already has any role
    (business, admin, or super_admin) — a self-service call can only ever
    grant the one, lowest tier, never overwrite an existing assignment."""
    if user.role is not None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This account already has access set up.")
    firebase_auth.set_custom_user_claims(user.uid, {"role": BUSINESS_ROLE}, app=_firebase_app)
    return {"status": "activated"}

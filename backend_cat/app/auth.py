"""Checks that a request is really from someone who's logged in via Firebase
AND has the right role for what they're trying to do. The login itself
(email/password) is handled entirely by Firebase on the frontend; this file
verifies the proof-of-login (a signed token) Firebase hands the frontend
after a successful login, using the private service account key so that
proof can't be faked, and checks the role stored on that Firebase account (a
"custom claim") — not a database row, so there's nothing here for anyone to
hand-edit outside this flow.

Every account gets the "business" role the moment it signs up (see
app/business_api.py) — no approval step. A super admin can promote an
account to admin/super_admin, or demote it back down, from the Manage
Admins screen (app/access_api.py's set_account_role) whenever they choose.

Three tiers:
  - require_any_role: any real, assigned account (business, admin, or
    super_admin). Gates the borrower-facing Explore routes.
  - require_admin: role is "admin" or "super_admin". Everything that reads
    or writes lender data.
  - require_super_admin: role is "super_admin" only. Promoting/demoting/
    revoking other accounts — a regular admin can't do this.
"""

from dataclasses import dataclass
from pathlib import Path
from typing import Annotated

import firebase_admin
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials

from app.config import settings

_bearer_scheme = HTTPBearer(auto_error=False)

_service_account_path = Path(settings.firebase_service_account_path)
if not _service_account_path.is_absolute():
    # Resolve relative to the backend project root (where this file's parent's
    # parent is), not whatever directory the process happened to be launched
    # from — the .env value is meant to be a simple filename like
    # "firebase-service-account.json" sitting next to .env.
    _service_account_path = Path(__file__).resolve().parent.parent / _service_account_path

_firebase_app: firebase_admin.App | None = None
if _service_account_path.exists():
    _firebase_app = firebase_admin.initialize_app(credentials.Certificate(str(_service_account_path)))

ADMIN_ROLES = frozenset({"admin", "super_admin"})
# The role every account starts at right after signup — Explore-only access,
# no admin dashboard. See app/business_api.py.
BUSINESS_ROLE = "business"
ALL_ROLES = ADMIN_ROLES | {BUSINESS_ROLE}


@dataclass(frozen=True)
class LoggedInUser:
    uid: str
    email: str
    role: str | None  # None = a real account with no role assigned (shouldn't normally happen post-signup)


async def _verify_token(
    credentials_header: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer_scheme)],
) -> LoggedInUser:
    """Verifies the token is a real, current Firebase login — makes no
    judgment about role. Shared by every dependency below, and by
    app/business_api.py's signup endpoint."""
    if _firebase_app is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Login isn't configured on this server yet (missing Firebase service account file).",
        )
    if credentials_header is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing login token.")
    try:
        # check_revoked=True costs an extra Firebase lookup per request, but
        # without it, revoke_refresh_tokens (see app/access_api.py's
        # revoke_admin_access) wouldn't actually invalidate a token that was
        # already issued and hasn't naturally expired yet — someone whose
        # access was just revoked could keep using the admin panel for up to
        # an hour. This is exactly the "instant" part of "revoke access."
        decoded = firebase_auth.verify_id_token(credentials_header.credentials, app=_firebase_app, check_revoked=True)
    except firebase_auth.RevokedIdTokenError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Your access was revoked.") from exc
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired login.") from exc

    email = decoded.get("email", decoded["uid"])
    role = decoded.get("role")
    return LoggedInUser(uid=decoded["uid"], email=email, role=role)


async def require_any_role(user: Annotated[LoggedInUser, Depends(_verify_token)]) -> LoggedInUser:
    """Gates the borrower-facing Explore routes — any real, assigned role
    (business, admin, or super_admin) is enough."""
    if user.role not in ALL_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sign in to use this.")
    return user


async def require_admin(user: Annotated[LoggedInUser, Depends(_verify_token)]) -> str:
    """FastAPI dependency — add to any admin-only route. Returns the logged-in
    admin's email on success; raises 403 for a real account that just isn't
    an admin (distinct from 401 "not logged in at all")."""
    if user.role not in ADMIN_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You don't have admin access.")
    return user.email


async def require_super_admin(user: Annotated[LoggedInUser, Depends(_verify_token)]) -> LoggedInUser:
    """Stricter than require_admin — only the super admin(s) can promote,
    demote, or revoke other accounts."""
    if user.role != "super_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Super admin access required.")
    return user

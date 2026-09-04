"""Checks that an admin request is really from someone who's logged in via
Firebase AND has been approved — the "lock on the door" for anything that
changes lender data. The login itself (username/password) is handled
entirely by Firebase on the frontend; this file verifies the proof-of-login
(a signed token) Firebase hands the frontend after a successful login, using
the private service account key so that proof can't be faked, and checks the
approval role stored on that Firebase account (a "custom claim") — not a
database row, so there's nothing here for an admin to hand-edit.

Three tiers:
  - require_login: any real Firebase account, approved or not. Used only by
    the /status endpoint the pending-approval screen polls, and by the
    access-request endpoints below (which read the caller's own claims to
    decide if *they're* allowed to approve/deny someone else).
  - require_admin: role is "admin" or "super_admin". Everything that reads
    or writes lender data.
  - require_super_admin: role is "super_admin" only. Approving/denying other
    people's access requests — a regular admin can't do this.

A brand new Firebase account has no role claim at all (None) until a super
admin approves it — see app/access_api.py.
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


@dataclass(frozen=True)
class LoggedInUser:
    uid: str
    email: str
    role: str | None  # None = a real account that hasn't been approved yet


async def require_login(
    credentials_header: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer_scheme)],
) -> LoggedInUser:
    """Verifies the token is a real, current Firebase login — makes no
    judgment about whether that person has been approved for anything.
    """
    if _firebase_app is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin login isn't configured on this server yet (missing Firebase service account file).",
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

    # Only gates brand new accounts on their way in — an account a super
    # admin already approved keeps working regardless of domain (e.g. a
    # developer's own personal Gmail, approved before this check existed).
    # Without that carve-out, turning this on would lock out every admin
    # who isn't on the company domain, including whoever just enabled it.
    if role is None and not email.endswith(f"@{settings.allowed_email_domain}"):
        try:
            firebase_auth.update_user(decoded["uid"], disabled=True, app=_firebase_app)
        except Exception:
            pass
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Only @{settings.allowed_email_domain} accounts can request access.",
        )

    return LoggedInUser(uid=decoded["uid"], email=email, role=role)


async def require_admin(user: Annotated[LoggedInUser, Depends(require_login)]) -> str:
    """FastAPI dependency — add to any admin-only route. Returns the logged-in
    admin's email on success; raises 403 if they're a real, logged-in account
    that just hasn't been approved yet (distinct from 401 "not logged in at
    all", so the frontend can send each case somewhere different).
    """
    if user.role not in ADMIN_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your access request hasn't been approved yet.",
        )
    return user.email


async def require_super_admin(user: Annotated[LoggedInUser, Depends(require_login)]) -> LoggedInUser:
    """Stricter than require_admin — only the super admin(s) can approve or
    deny other people's access requests."""
    if user.role != "super_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Super admin access required.")
    return user

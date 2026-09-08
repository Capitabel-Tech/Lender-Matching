"""One-time script: grants the admin role to one Firebase account by email.
Needed because an admin can't be approved by anyone through the normal
flow — nobody with that role exists yet the very first time.

The account has to already exist (sign up for it first at /login, same as
anyone else) — this script only grants the role, it doesn't create the
account.

Run with: python -m app.bootstrap_admin you@example.com
"""

import sys

from firebase_admin import auth as firebase_auth

from app.auth import _firebase_app


def main() -> None:
    if len(sys.argv) != 2:
        print("Usage: python -m app.bootstrap_admin <email>")
        sys.exit(1)
    email = sys.argv[1]
    if _firebase_app is None:
        print("Firebase isn't configured on this machine (missing service account file).")
        sys.exit(1)
    try:
        user = firebase_auth.get_user_by_email(email, app=_firebase_app)
    except firebase_auth.UserNotFoundError:
        print(f"No Firebase account for {email} yet — sign up at /login first, then re-run this.")
        sys.exit(1)
    existing_claims = user.custom_claims or {}
    firebase_auth.set_custom_user_claims(
        user.uid,
        {
            "role": "admin",
            "display_name": existing_claims.get("display_name"),
            "org_role": existing_claims.get("org_role"),
        },
        app=_firebase_app,
    )
    print(f"{email} is now an admin.")


if __name__ == "__main__":
    main()

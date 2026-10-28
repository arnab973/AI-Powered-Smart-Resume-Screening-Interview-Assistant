
from datetime import datetime, timezone

from google.auth.transport import requests
from google.oauth2 import id_token
from pymongo.errors import DuplicateKeyError

from app.config import settings
from app.database.mongodb import get_database
from app.utils.security import create_access_token


USERS_COLLECTION = "users"


def google_login_user(credential: str) -> dict:
    if not settings.GOOGLE_CLIENT_ID:
        raise RuntimeError(
            "Google Sign In is not configured."
        )

    try:
        google_user = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError:
        raise ValueError(
            "Invalid or expired Google authentication token."
        )

    google_id = google_user.get("sub")
    email = str(
        google_user.get("email") or ""
    ).strip().lower()
    name = str(
        google_user.get("name") or "Google User"
    ).strip()
    email_verified = google_user.get(
        "email_verified"
    ) is True

    if not google_id or not email or not email_verified:
        raise ValueError(
            "Google account verification failed."
        )

    db = get_database()

    if db is None:
        raise RuntimeError(
            "Database connection is not available."
        )

    users_collection = db[USERS_COLLECTION]

    user = users_collection.find_one(
        {"google_id": google_id}
    )

    if not user:
        existing_email_user = users_collection.find_one(
            {"email": email}
        )

        if existing_email_user:
            raise ValueError(
                "An account with this email already exists. "
                "Sign in using your existing method first. "
                "Google account linking is not enabled yet."
            )

        now = datetime.now(timezone.utc)

        new_user = {
            "name": name,
            "email": email,
            "password_hash": None,
            "google_id": google_id,
            "auth_provider": "google",
            "role": "candidate",
            "profile_image": google_user.get("picture"),
            "created_at": now,
            "updated_at": now,
        }

        try:
            result = users_collection.insert_one(
                new_user
            )
        except DuplicateKeyError:
            raise ValueError(
                "An account with this identity already exists. "
                "Please try signing in again."
            )

        new_user["_id"] = result.inserted_id
        user = new_user

    token = create_access_token(
        {
            "sub": str(user["_id"]),
            "email": user["email"],
            "role": user["role"],
        }
    )

    return {
        "access_token": token,
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "profile_image": user.get("profile_image"),
        },
    }

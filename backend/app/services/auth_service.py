
from datetime import datetime, timezone

from pymongo.errors import DuplicateKeyError

from app.database.mongodb import get_database
from app.schemas.auth_schema import RegisterRequest
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
)


USERS_COLLECTION = "users"


# =========================================================
# HELPER: FORMAT USER RESPONSE
# =========================================================

def format_user_response(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "profile_image": user.get("profile_image"),
    }


# =========================================================
# REGISTER USER
# =========================================================

def register_user(user_data: RegisterRequest) -> dict:
    db = get_database()

    if db is None:
        raise RuntimeError(
            "Database connection is not available."
        )

    users_collection = db[USERS_COLLECTION]

    email = str(user_data.email).strip().lower()

    # Public registration must not grant HR privileges.
    role = "candidate"

    existing_user = users_collection.find_one(
        {"email": email}
    )

    if existing_user:
        raise ValueError(
            "Email is already registered."
        )

    now = datetime.now(timezone.utc)

    user_document = {
        "name": user_data.name.strip(),
        "email": email,
        "password_hash": hash_password(
            user_data.password
        ),
        "role": role,
        "profile_image": None,
        "auth_provider": "local",
        "google_id": None,
        "created_at": now,
        "updated_at": now,
    }

    try:
        result = users_collection.insert_one(
            user_document
        )

    except DuplicateKeyError:
        raise ValueError(
            "Email is already registered."
        )

    user_document["_id"] = result.inserted_id

    return format_user_response(
        user_document
    )


# =========================================================
# EMAIL / PASSWORD LOGIN
# =========================================================

def login_user(email: str, password: str) -> dict:
    db = get_database()

    if db is None:
        raise RuntimeError(
            "Database connection is not available."
        )

    users_collection = db[USERS_COLLECTION]

    normalized_email = email.strip().lower()

    user = users_collection.find_one(
        {"email": normalized_email}
    )

    if not user:
        raise ValueError(
            "Invalid email or password."
        )

    # Google-only accounts may not have a password.
    password_hash = user.get("password_hash")

    if (
        not password_hash
        or not verify_password(
            password,
            password_hash,
        )
    ):
        raise ValueError(
            "Invalid email or password."
        )

    token = create_access_token(
        {
            "sub": str(user["_id"]),
            "email": user["email"],
            "role": user["role"],
        }
    )

    return {
        "access_token": token,
        "user": format_user_response(user),
    }

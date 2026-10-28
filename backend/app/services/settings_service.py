from typing import Any

import bcrypt
from bson import ObjectId

from app.database.mongodb import get_database


PROFILE_FIELDS = {
    "name",
    "phone",
    "location",
    "education",
    "headline",
    "bio",
    "email_notifications",
    "interview_reminders",
    "job_alerts",
    "application_updates",
    "security_alerts",
    "profile_visibility",
    "show_email_to_recruiters",
    "show_phone_to_recruiters",
    "language",
    "theme",
    "interview_difficulty",
}


def _validate_user_id(user_id: str) -> ObjectId:
    if not user_id or not ObjectId.is_valid(user_id):
        raise ValueError("Invalid user_id.")

    return ObjectId(user_id)


def _serialize_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", "candidate"),
        "profile_image": user.get("profile_image"),
        "phone": user.get("phone", ""),
        "location": user.get("location", ""),
        "education": user.get("education", ""),
        "headline": user.get("headline", ""),
        "bio": user.get("bio", ""),
        "email_notifications": user.get(
            "email_notifications",
            True,
        ),
        "interview_reminders": user.get(
            "interview_reminders",
            True,
        ),
        "job_alerts": user.get(
            "job_alerts",
            True,
        ),
        "application_updates": user.get(
            "application_updates",
            True,
        ),
        "security_alerts": user.get(
            "security_alerts",
            True,
        ),
        "profile_visibility": user.get(
            "profile_visibility",
            True,
        ),
        "show_email_to_recruiters": user.get(
            "show_email_to_recruiters",
            False,
        ),
        "show_phone_to_recruiters": user.get(
            "show_phone_to_recruiters",
            False,
        ),
        "language": user.get(
            "language",
            "English",
        ),
        "theme": user.get(
            "theme",
            "Dark",
        ),
        "interview_difficulty": user.get(
            "interview_difficulty",
            "Adaptive",
        ),
    }


def get_user_settings(user_id: str) -> dict[str, Any]:
    user_object_id = _validate_user_id(user_id)

    db = get_database()

    if db is None:
        raise RuntimeError(
            "Database connection is not available."
        )

    user = db["users"].find_one(
        {
            "_id": user_object_id,
        }
    )

    if not user:
        raise ValueError(
            "User not found."
        )

    return _serialize_user(user)


def update_user_settings(
    user_id: str,
    settings: dict[str, Any],
) -> dict[str, Any]:

    user_object_id = _validate_user_id(user_id)

    db = get_database()

    if db is None:
        raise RuntimeError(
            "Database connection is not available."
        )

    update_data = {}

    for key, value in settings.items():

        if key not in PROFILE_FIELDS:
            continue

        if value is None:
            continue

        if isinstance(value, str):
            value = value.strip()

        update_data[key] = value

    if not update_data:
        return get_user_settings(user_id)

    if "name" in update_data:
        if len(update_data["name"]) < 2:
            raise ValueError(
                "Name must contain at least 2 characters."
            )

        if len(update_data["name"]) > 100:
            raise ValueError(
                "Name is too long."
            )

    if "phone" in update_data:
        if len(update_data["phone"]) > 30:
            raise ValueError(
                "Phone number is too long."
            )

    if "location" in update_data:
        if len(update_data["location"]) > 150:
            raise ValueError(
                "Location is too long."
            )

    if "education" in update_data:
        if len(update_data["education"]) > 200:
            raise ValueError(
                "Education information is too long."
            )

    if "headline" in update_data:
        if len(update_data["headline"]) > 200:
            raise ValueError(
                "Professional headline is too long."
            )

    if "bio" in update_data:
        if len(update_data["bio"]) > 2000:
            raise ValueError(
                "Professional bio is too long."
            )

    db["users"].update_one(
        {
            "_id": user_object_id,
        },
        {
            "$set": update_data,
        },
    )

    updated_user = db["users"].find_one(
        {
            "_id": user_object_id,
        }
    )

    if not updated_user:
        raise RuntimeError(
            "Failed to retrieve updated user."
        )

    return _serialize_user(updated_user)


def change_user_password(
    user_id: str,
    current_password: str,
    new_password: str,
) -> dict[str, str]:

    user_object_id = _validate_user_id(user_id)

    db = get_database()

    if db is None:
        raise RuntimeError(
            "Database connection is not available."
        )

    user = db["users"].find_one(
        {
            "_id": user_object_id,
        }
    )

    if not user:
        raise ValueError(
            "User not found."
        )

    stored_password = user.get("password")

    if not stored_password:
        raise ValueError(
            "Password is not available for this account."
        )

    if not current_password:
        raise ValueError(
            "Current password is required."
        )

    if not new_password:
        raise ValueError(
            "New password is required."
        )

    if len(new_password) < 6:
        raise ValueError(
            "New password must contain at least 6 characters."
        )

    if len(new_password.encode("utf-8")) > 72:
        raise ValueError(
            "New password must be 72 bytes or fewer."
        )

    try:
        password_matches = bcrypt.checkpw(
            current_password.encode("utf-8"),
            stored_password.encode("utf-8"),
        )
    except Exception:
        password_matches = False

    if not password_matches:
        raise ValueError(
            "Current password is incorrect."
        )

    hashed_password = bcrypt.hashpw(
        new_password.encode("utf-8"),
        bcrypt.gensalt(),
    ).decode("utf-8")

    db["users"].update_one(
        {
            "_id": user_object_id,
        },
        {
            "$set": {
                "password": hashed_password,
            }
        },
    )

    return {
        "message": "Password changed successfully."
    }
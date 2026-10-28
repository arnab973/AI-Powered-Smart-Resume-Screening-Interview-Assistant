
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import HTTPException, status

from app.database.mongodb import get_database
from app.utils.security import hash_password, verify_password

from app.schemas.hr_settings_schema import (
    HRProfileUpdateSchema,
    HRNotificationSettingsSchema,
    HRAppearanceSettingsSchema,
    HRPasswordChangeSchema,
)


def get_db():
    db = get_database()

    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database connection unavailable.",
        )

    return db


def utc_now():
    return datetime.now(timezone.utc)


def get_hr_settings(user: dict):
    db = get_db()
    user_id = str(user["_id"])

    saved = db["hr_settings"].find_one(
        {"user_id": user_id}
    ) or {}

    return {
        "user_id": user_id,
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "company": user.get(
            "company",
            saved.get("company", ""),
        ),
        "phone": user.get(
            "phone",
            saved.get("phone", ""),
        ),
        "designation": user.get(
            "designation",
            saved.get("designation", ""),
        ),
        "notifications": saved.get(
            "notifications",
            HRNotificationSettingsSchema().model_dump(),
        ),
        "appearance": saved.get(
            "appearance",
            HRAppearanceSettingsSchema().model_dump(),
        ),
    }


def update_hr_profile(
    user: dict,
    payload: HRProfileUpdateSchema,
):
    db = get_db()
    user_id = str(user["_id"])

    updates = payload.model_dump()

    # Profile fields are stored on the user account.
    result = db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": updates},
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    updated_user = db["users"].find_one(
        {"_id": user["_id"]},
        {"password_hash": 0},
    )

    return get_hr_settings(updated_user)


def update_hr_notifications(
    user: dict,
    payload: HRNotificationSettingsSchema,
):
    db = get_db()
    user_id = str(user["_id"])

    db["hr_settings"].update_one(
        {"user_id": user_id},
        {
            "$set": {
                "notifications": payload.model_dump(),
                "updated_at": utc_now(),
            },
            "$setOnInsert": {
                "created_at": utc_now(),
            },
        },
        upsert=True,
    )

    return get_hr_settings(user)


def update_hr_appearance(
    user: dict,
    payload: HRAppearanceSettingsSchema,
):
    db = get_db()
    user_id = str(user["_id"])

    db["hr_settings"].update_one(
        {"user_id": user_id},
        {
            "$set": {
                "appearance": payload.model_dump(),
                "updated_at": utc_now(),
            },
            "$setOnInsert": {
                "created_at": utc_now(),
            },
        },
        upsert=True,
    )

    return get_hr_settings(user)


def change_hr_password(
    user: dict,
    payload: HRPasswordChangeSchema,
):
    db = get_db()

    if payload.new_password != payload.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="New passwords do not match.",
        )

    # bcrypt supports at most 72 bytes.
    if len(payload.new_password.encode("utf-8")) > 72:
        raise HTTPException(
            status_code=400,
            detail="Password must not exceed 72 UTF-8 bytes.",
        )

    stored_user = db["users"].find_one(
        {"_id": user["_id"]}
    )

    if not stored_user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    stored_hash = stored_user.get("password_hash")

    if not stored_hash:
        raise HTTPException(
            status_code=400,
            detail="Password authentication is unavailable for this account.",
        )

    if len(payload.current_password.encode("utf-8")) > 72:
        raise HTTPException(
            status_code=400,
            detail="Current password is invalid.",
        )

    if not verify_password(
        payload.current_password,
        stored_hash,
    ):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect.",
        )

    if verify_password(
        payload.new_password,
        stored_hash,
    ):
        raise HTTPException(
            status_code=400,
            detail="New password must differ from current password.",
        )

    new_hash = hash_password(payload.new_password)

    result = db["users"].update_one(
        {
            "_id": user["_id"],
            "password_hash": stored_hash,
        },
        {
            "$set": {
                "password_hash": new_hash,
                "password_changed_at": utc_now(),
            }
        },
    )

    if result.modified_count != 1:
        raise HTTPException(
            status_code=409,
            detail="Password changed concurrently. Please retry.",
        )

    return {
        "message": "Password updated successfully."
    }


import os
from datetime import datetime, timezone
from pathlib import Path

from bson import ObjectId
from pymongo import ReturnDocument

from app.database.mongodb import get_database
from app.utils.resume_structured_parser import (
    extract_resume_structure,
)


# =========================================================
# CONFIGURATION
# =========================================================

RESUMES_COLLECTION = "resumes"

ALLOWED_RESUME_EXTENSIONS = {
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
}


# =========================================================
# DATABASE HELPERS
# =========================================================

def _get_db():
    """
    Return the active MongoDB database.
    """

    db = get_database()

    if db is None:
        raise RuntimeError(
            "Database connection is not available."
        )

    return db


def _validate_object_id(
    value: str,
    field_name: str,
) -> ObjectId:
    """
    Validate and normalize a MongoDB ObjectId.
    """

    if not value or not ObjectId.is_valid(
        str(value)
    ):
        raise ValueError(
            f"Invalid {field_name}."
        )

    return ObjectId(str(value))


def _user_id_variants(
    user_id: str,
) -> list:
    """
    Support existing MongoDB records where
    user_id may be stored as either a string
    or an ObjectId.
    """

    object_id = _validate_object_id(
        user_id,
        "user ID",
    )

    return [
        object_id,
        str(object_id),
    ]


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _verify_candidate(
    db,
    user_id: str,
) -> ObjectId:
    """
    Verify that the user exists and has
    the Candidate role.

    Authorization must also be enforced
    by the API middleware.
    """

    user_object_id = _validate_object_id(
        user_id,
        "user ID",
    )

    user = db["users"].find_one({
        "_id": user_object_id,
    })

    if not user:
        raise ValueError(
            "User not found."
        )

    role = str(
        user.get("role") or ""
    ).strip().lower()

    if role != "candidate":
        raise PermissionError(
            "Only candidates can manage resumes."
        )

    return user_object_id


# =========================================================
# RESPONSE SERIALIZATION
# =========================================================

def _serialize_resume(
    resume: dict,
    *,
    include_text: bool = False,
) -> dict:
    """
    Convert MongoDB resume documents into
    API-compatible responses.

    Internal file paths are never exposed.
    """

    response = {
        "id": str(resume["_id"]),
        "user_id": str(
            resume.get("user_id") or ""
        ),
        "original_filename": str(
            resume.get("original_filename")
            or ""
        ),
        "stored_filename": str(
            resume.get("stored_filename")
            or ""
        ),
        "file_type": str(
            resume.get("file_type")
            or ""
        ),
        "file_size": resume.get(
            "file_size",
            0,
        ),
        "parsed": bool(
            resume.get("parsed", False)
        ),
        "extracted_text": None,
        "structured_data": (
            resume.get("structured_data")
            or {}
        ),
        "uploaded_at": resume.get(
            "uploaded_at"
        ),
        "updated_at": resume.get(
            "updated_at"
        ),
    }

    if include_text:
        response["extracted_text"] = (
            resume.get("extracted_text")
        )

    return response


# =========================================================
# FILE METADATA VALIDATION
# =========================================================

def _validate_file_metadata(
    original_filename: str,
    stored_filename: str,
    file_path: str,
    file_type: str,
    file_size: int,
) -> None:
    """
    Validate resume metadata before saving
    a MongoDB record.

    Actual file content and maximum upload
    size must be validated in file_handler.py.
    """

    if not original_filename:
        raise ValueError(
            "Original filename is required."
        )

    if not stored_filename:
        raise ValueError(
            "Stored filename is required."
        )

    if not file_path:
        raise ValueError(
            "Resume file path is required."
        )

    original_extension = Path(
        original_filename
    ).suffix.lower()

    stored_extension = Path(
        stored_filename
    ).suffix.lower()

    normalized_file_type = str(
        file_type or ""
    ).lower()

    if original_extension not in ALLOWED_RESUME_EXTENSIONS:
        raise ValueError(
            "Unsupported resume file type."
        )

    if stored_extension != original_extension:
        raise ValueError(
            "Stored resume extension does not match "
            "the uploaded file."
        )

    if normalized_file_type != original_extension:
        raise ValueError(
            "Resume file type does not match "
            "the uploaded file."
        )

    if os.path.basename(
        stored_filename
    ) != stored_filename:
        raise ValueError(
            "Invalid stored filename."
        )

    if (
        not isinstance(file_size, int)
        or isinstance(file_size, bool)
        or file_size <= 0
    ):
        raise ValueError(
            "Resume file size must be greater than zero."
        )

    if not os.path.isfile(file_path):
        raise ValueError(
            "Resume file does not exist."
        )

    actual_size = os.path.getsize(
        file_path
    )

    if actual_size != file_size:
        raise ValueError(
            "Resume file size does not match "
            "the stored file."
        )


# =========================================================
# CREATE RESUME RECORD
# =========================================================

def create_resume_record(
    user_id: str,
    original_filename: str,
    stored_filename: str,
    file_path: str,
    file_type: str,
    file_size: int,
) -> dict:
    """
    Create a resume record for a verified
    Candidate.

    The authenticated user ID must come
    from the API authentication middleware.
    """

    db = _get_db()

    user_object_id = _verify_candidate(
        db=db,
        user_id=user_id,
    )

    _validate_file_metadata(
        original_filename=original_filename,
        stored_filename=stored_filename,
        file_path=file_path,
        file_type=file_type,
        file_size=file_size,
    )

    now = _now()

    resume_document = {
        "user_id": str(user_object_id),
        "original_filename": (
            original_filename.strip()
        ),
        "stored_filename": stored_filename,
        "file_path": file_path,
        "file_type": file_type.lower(),
        "file_size": file_size,
        "parsed": False,
        "extracted_text": None,
        "structured_data": None,
        "uploaded_at": now,
        "created_at": now,
        "updated_at": now,
    }

    result = db[
        RESUMES_COLLECTION
    ].insert_one(
        resume_document
    )

    resume_document["_id"] = (
        result.inserted_id
    )

    return _serialize_resume(
        resume_document,
        include_text=False,
    )


# =========================================================
# PARSE RESUME
# =========================================================

def parse_resume(
    resume_id: str,
    user_id: str,
    extracted_text: str,
) -> dict:
    """
    Parse a resume and save its structured data.

    Security:
        - Candidate role verified.
        - Resume ownership verified.
        - Database update is ownership-scoped.
        - Internal file paths are not returned.
    """

    db = _get_db()

    resume_object_id = _validate_object_id(
        resume_id,
        "resume ID",
    )

    _verify_candidate(
        db=db,
        user_id=user_id,
    )

    user_ids = _user_id_variants(
        user_id
    )

    if not isinstance(
        extracted_text,
        str,
    ):
        raise ValueError(
            "Extracted resume text must be a string."
        )

    extracted_text = extracted_text.strip()

    if not extracted_text:
        raise ValueError(
            "No text could be extracted from the resume."
        )

    ownership_filter = {
        "_id": resume_object_id,
        "user_id": {
            "$in": user_ids,
        },
    }

    resume = db[
        RESUMES_COLLECTION
    ].find_one(
        ownership_filter
    )

    if not resume:
        raise ValueError(
            "Resume not found."
        )

    # -----------------------------------------------------
    # STRUCTURED PARSING
    # -----------------------------------------------------

    structured_data = extract_resume_structure(
        extracted_text
    )

    if not isinstance(
        structured_data,
        dict,
    ):
        raise RuntimeError(
            "Resume parser returned invalid structured data."
        )

    # -----------------------------------------------------
    # OWNERSHIP-SCOPED UPDATE
    # -----------------------------------------------------

    now = _now()

    updated_resume = db[
        RESUMES_COLLECTION
    ].find_one_and_update(
        ownership_filter,
        {
            "$set": {
                "extracted_text": extracted_text,
                "structured_data": structured_data,
                "parsed": True,
                "updated_at": now,
            },
        },
        return_document=ReturnDocument.AFTER,
    )

    if not updated_resume:
        raise ValueError(
            "Resume not found or access was revoked."
        )

    return _serialize_resume(
        updated_resume,
        include_text=True,
    )

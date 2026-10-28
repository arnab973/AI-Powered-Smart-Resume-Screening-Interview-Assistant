
import math

from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from pymongo import ReturnDocument

from app.database.mongodb import get_database


# =========================================================
# CONFIGURATION
# =========================================================

APPLICATION_STATUSES = {
    "Applied",
    "Under Review",
    "Shortlisted",
    "Interview",
    "Rejected",
    "Hired",
    "Withdrawn",
}

TERMINAL_STATUSES = {
    "Rejected",
    "Hired",
    "Withdrawn",
}


# =========================================================
# HELPERS
# =========================================================

def _get_db():
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
    if not value or not ObjectId.is_valid(str(value)):
        raise ValueError(
            f"Invalid {field_name}."
        )

    return ObjectId(str(value))


def _id_variants(
    value: str,
    field_name: str,
) -> list:
    object_id = _validate_object_id(
        value,
        field_name,
    )

    return [
        object_id,
        str(object_id),
    ]


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _serialize_datetime(value: Any) -> str | None:
    if value is None:
        return None

    if hasattr(value, "isoformat"):
        return value.isoformat()

    return str(value)


def _safe_float(
    value: Any,
    default: float = 0.0,
) -> float:
    try:
        number = float(value)

        if not math.isfinite(number):
            return default

        return round(
            min(max(number, 0.0), 100.0),
            2,
        )

    except (TypeError, ValueError, OverflowError):
        return default


def _normalize_skills(skills: Any) -> list[str]:
    if not isinstance(skills, list):
        return []

    result = []
    seen = set()

    for skill in skills:
        if skill is None:
            continue

        normalized = str(skill).strip()
        key = normalized.casefold()

        if normalized and key not in seen:
            result.append(normalized)
            seen.add(key)

    return result


def _get_job_snapshot(job: dict) -> dict:
    title = (
        job.get("title")
        or job.get("job_title")
        or job.get("designation")
        or "Untitled Job"
    )

    company = (
        job.get("company")
        or job.get("company_name")
        or job.get("organization")
        or "Unknown Company"
    )

    location = (
        job.get("location")
        or job.get("job_location")
        or "Not specified"
    )

    job_type = (
        job.get("type")
        or job.get("job_type")
        or job.get("employment_type")
        or "Full Time"
    )

    salary = (
        job.get("salary")
        or job.get("salary_range")
        or job.get("ctc")
        or "Not disclosed"
    )

    skills = _normalize_skills(
        job.get("skills")
        or job.get("required_skills")
        or job.get("technical_skills")
        or []
    )

    return {
        "title": str(title),
        "company": str(company),
        "location": str(location),
        "type": str(job_type),
        "salary": str(salary),
        "skills": skills,
    }


def _serialize_application(
    application: dict,
) -> dict:
    created_at = application.get("created_at")
    updated_at = application.get("updated_at")

    applied_date = (
        application.get("applied_date")
        or created_at
    )

    return {
        "id": str(application["_id"]),
        "user_id": str(
            application.get("user_id", "")
        ),
        "job_id": str(
            application.get("job_id", "")
        ),
        "resume_id": (
            str(application["resume_id"])
            if application.get("resume_id")
            else None
        ),
        "title": str(
            application.get("title")
            or "Untitled Job"
        ),
        "company": str(
            application.get("company")
            or "Unknown Company"
        ),
        "location": str(
            application.get("location")
            or "Not specified"
        ),
        "type": str(
            application.get("type")
            or "Full Time"
        ),
        "salary": str(
            application.get("salary")
            or "Not disclosed"
        ),
        "status": application.get(
            "status",
            "Applied",
        ),
        "match": _safe_float(
            application.get("match", 0)
        ),
        "skills": _normalize_skills(
            application.get("skills", [])
        ),
        "appliedDate": (
            _serialize_datetime(applied_date)
            or ""
        ),
        "cover_letter": str(
            application.get("cover_letter")
            or ""
        ),
        "recruiter_note": str(
            application.get("recruiter_note")
            or ""
        ),
        "created_at": _serialize_datetime(
            created_at
        ),
        "updated_at": _serialize_datetime(
            updated_at
        ),
    }


def _get_owned_job(
    db,
    job_id: str,
    hr_user_id: str,
) -> dict:
    """
    Verify HR/Recruiter ownership.
    """

    job_object_id = _validate_object_id(
        job_id,
        "job_id",
    )

    owner_ids = _id_variants(
        hr_user_id,
        "hr_user_id",
    )

    job = db["jobs"].find_one({
        "_id": job_object_id,
        "user_id": {
            "$in": owner_ids,
        },
    })

    if not job:
        raise ValueError(
            "Job not found."
        )

    return job


# =========================================================
# CREATE APPLICATION - CANDIDATE
# =========================================================

def create_application(
    user_id: str,
    job_id: str,
    resume_id: str | None = None,
    cover_letter: str = "",
) -> dict:
    """
    Candidate applies for a job.

    If no resume_id is supplied, use the
    Candidate's latest uploaded resume.

    Resume-less applications remain supported.
    """

    db = _get_db()

    user_object_id = _validate_object_id(
        user_id,
        "user_id",
    )

    job_object_id = _validate_object_id(
        job_id,
        "job_id",
    )

    user = db["users"].find_one({
        "_id": user_object_id,
    })

    if not user:
        raise ValueError(
            "User not found."
        )

    if (
        str(user.get("role") or "")
        .strip()
        .lower()
        != "candidate"
    ):
        raise PermissionError(
            "Only candidates can submit applications."
        )

    job = db["jobs"].find_one({
        "_id": job_object_id,
    })

    if not job:
        raise ValueError(
            "Job not found."
        )

    user_ids = _id_variants(
        user_id,
        "user_id",
    )

    job_ids = _id_variants(
        job_id,
        "job_id",
    )

    existing_application = db[
        "applications"
    ].find_one({
        "user_id": {
            "$in": user_ids,
        },
        "job_id": {
            "$in": job_ids,
        },
        "status": {
            "$ne": "Withdrawn",
        },
    })

    if existing_application:
        raise ValueError(
            "You have already applied for this job."
        )

    selected_resume_id = None

    if resume_id:
        resume_object_id = _validate_object_id(
            resume_id,
            "resume_id",
        )

        resume = db["resumes"].find_one({
            "_id": resume_object_id,
            "user_id": {
                "$in": user_ids,
            },
        })

        if not resume:
            raise ValueError(
                "Resume not found or does not belong "
                "to this user."
            )

        selected_resume_id = resume_object_id

    else:
        latest_resume = db["resumes"].find_one(
            {
                "user_id": {
                    "$in": user_ids,
                },
            },
            sort=[
                ("created_at", -1),
            ],
        )

        if latest_resume:
            selected_resume_id = (
                latest_resume["_id"]
            )

    now = _now()

    application_document = {
        "user_id": user_object_id,
        "job_id": job_object_id,
        "resume_id": selected_resume_id,
        **_get_job_snapshot(job),
        "status": "Applied",
        "match": 0.0,
        "cover_letter": (
            cover_letter.strip()
            if cover_letter
            else ""
        ),
        "recruiter_note": "",
        "applied_date": now,
        "created_at": now,
        "updated_at": now,
    }

    result = db[
        "applications"
    ].insert_one(
        application_document
    )

    application_document["_id"] = (
        result.inserted_id
    )

    return _serialize_application(
        application_document
    )


# =========================================================
# GET MY APPLICATIONS - CANDIDATE
# =========================================================

def get_my_applications(
    user_id: str,
) -> list[dict]:
    db = _get_db()

    user_ids = _id_variants(
        user_id,
        "user_id",
    )

    applications = (
        db["applications"]
        .find({
            "user_id": {
                "$in": user_ids,
            },
        })
        .sort(
            "created_at",
            -1,
        )
    )

    return [
        _serialize_application(application)
        for application in applications
    ]


# =========================================================
# GET APPLICATION BY ID - CANDIDATE
# =========================================================

def get_application_by_id(
    user_id: str,
    application_id: str,
) -> dict:
    db = _get_db()

    application_object_id = _validate_object_id(
        application_id,
        "application_id",
    )

    user_ids = _id_variants(
        user_id,
        "user_id",
    )

    application = db[
        "applications"
    ].find_one({
        "_id": application_object_id,
        "user_id": {
            "$in": user_ids,
        },
    })

    if not application:
        raise ValueError(
            "Application not found."
        )

    return _serialize_application(
        application
    )


# =========================================================
# WITHDRAW APPLICATION - CANDIDATE
# =========================================================

def withdraw_application(
    user_id: str,
    application_id: str,
) -> dict:
    db = _get_db()

    application_object_id = _validate_object_id(
        application_id,
        "application_id",
    )

    user_ids = _id_variants(
        user_id,
        "user_id",
    )

    ownership_filter = {
        "_id": application_object_id,
        "user_id": {
            "$in": user_ids,
        },
    }

    application = db[
        "applications"
    ].find_one(
        ownership_filter
    )

    if not application:
        raise ValueError(
            "Application not found."
        )

    current_status = application.get(
        "status",
        "Applied",
    )

    if current_status == "Withdrawn":
        raise ValueError(
            "Application is already withdrawn."
        )

    if current_status == "Hired":
        raise ValueError(
            "A hired application cannot be withdrawn."
        )

    if current_status == "Rejected":
        raise ValueError(
            "A rejected application cannot be withdrawn."
        )

    now = _now()

    updated_application = db[
        "applications"
    ].find_one_and_update(
        {
            **ownership_filter,
            "status": {
                "$nin": [
                    "Withdrawn",
                    "Hired",
                    "Rejected",
                ],
            },
        },
        {
            "$set": {
                "status": "Withdrawn",
                "updated_at": now,
            },
        },
        return_document=ReturnDocument.AFTER,
    )

    if not updated_application:
        raise ValueError(
            "Application status has changed. "
            "Please refresh."
        )

    return _serialize_application(
        updated_application
    )


# =========================================================
# UPDATE APPLICATION STATUS - HR / RECRUITER
# =========================================================

def update_application_status(
    application_id: str,
    status: str,
    recruiter_note: str = "",
    *,
    hr_user_id: str,
) -> dict:
    """
    HR/Recruiter can update applications
    belonging to their own jobs.

    Terminal statuses cannot be changed.
    """

    db = _get_db()

    application_object_id = _validate_object_id(
        application_id,
        "application_id",
    )

    if status not in APPLICATION_STATUSES:
        raise ValueError(
            "Invalid application status."
        )

    if status == "Withdrawn":
        raise ValueError(
            "Only candidates can withdraw applications."
        )

    application = db[
        "applications"
    ].find_one({
        "_id": application_object_id,
    })

    if not application:
        raise ValueError(
            "Application not found."
        )

    job_id = str(
        application.get("job_id") or ""
    )

    _get_owned_job(
        db=db,
        job_id=job_id,
        hr_user_id=hr_user_id,
    )

    current_status = application.get(
        "status",
        "Applied",
    )

    if current_status in TERMINAL_STATUSES:
        raise ValueError(
            "A completed or withdrawn application "
            "cannot be updated."
        )

    now = _now()

    updated_application = db[
        "applications"
    ].find_one_and_update(
        {
            "_id": application_object_id,
            "status": current_status,
        },
        {
            "$set": {
                "status": status,
                "recruiter_note": (
                    recruiter_note.strip()
                    if recruiter_note
                    else ""
                ),
                "updated_at": now,
            },
        },
        return_document=ReturnDocument.AFTER,
    )

    if not updated_application:
        raise ValueError(
            "Application status has changed. "
            "Please refresh."
        )

    return _serialize_application(
        updated_application
    )


# =========================================================
# GET JOB APPLICATIONS - HR / RECRUITER
# =========================================================

def get_job_applications(
    job_id: str,
    *,
    hr_user_id: str,
) -> list[dict]:
    """
    HR/Recruiter can retrieve applications
    only for their own jobs.
    """

    db = _get_db()

    job = _get_owned_job(
        db=db,
        job_id=job_id,
        hr_user_id=hr_user_id,
    )

    job_ids = [
        job["_id"],
        str(job["_id"]),
    ]

    applications = (
        db["applications"]
        .find({
            "job_id": {
                "$in": job_ids,
            },
        })
        .sort(
            "created_at",
            -1,
        )
    )

    return [
        _serialize_application(application)
        for application in applications
    ]

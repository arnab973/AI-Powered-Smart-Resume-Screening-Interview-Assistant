
import re
from datetime import datetime, timezone
from typing import Any

from bson import ObjectId

from app.database.mongodb import get_database


# =========================================================
# CONFIGURATION
# =========================================================

JOBS_COLLECTION = "jobs"


# =========================================================
# DATABASE HELPER
# =========================================================

def _get_db():
    db = get_database()

    if db is None:
        raise RuntimeError(
            "Database connection is not available."
        )

    return db


# =========================================================
# VALIDATION HELPERS
# =========================================================

def _validate_job_id(job_id: str) -> ObjectId:
    if not job_id or not ObjectId.is_valid(str(job_id)):
        raise ValueError("Invalid job ID.")

    return ObjectId(str(job_id))


def _validate_user_id(user_id: str) -> str:
    if not user_id or not ObjectId.is_valid(str(user_id)):
        raise ValueError("Invalid user ID.")

    return str(ObjectId(str(user_id)))


def _owner_filter(user_id: str) -> dict:
    normalized_id = _validate_user_id(user_id)

    return {
        "user_id": {
            "$in": [
                normalized_id,
                ObjectId(normalized_id),
            ]
        }
    }


# =========================================================
# SKILL NORMALIZATION
# =========================================================

def normalize_job_skills(value: Any) -> list[str]:
    """
    Normalize job skills.

    Supports:
    - ["Python", "FastAPI"]
    - ["Python, FastAPI"]
    - 'Python, FastAPI'
    - ['"Python", "FastAPI"']
    - Nested lists

    Removes duplicate and empty skills.
    """

    if value is None:
        return []

    if isinstance(value, str):
        value = [value]

    if not isinstance(value, (list, tuple)):
        raise ValueError(
            "Skills must be a list or string."
        )

    normalized_skills = []
    seen = set()

    def process_item(item):
        if isinstance(item, (list, tuple)):
            for nested_item in item:
                process_item(nested_item)
            return

        if not isinstance(item, str):
            raise ValueError(
                "Each skill must be a string."
            )

        parts = re.split(
            r"[,;\n]+",
            item,
        )

        for part in parts:
            skill = part.strip()

            skill = skill.strip(
                " \t\r\n\"'[]"
            )

            skill = re.sub(
                r"\s+",
                " ",
                skill,
            )

            if not skill:
                continue

            if len(skill) > 100:
                raise ValueError(
                    "Individual skill cannot exceed "
                    "100 characters."
                )

            key = skill.casefold()

            if key not in seen:
                seen.add(key)
                normalized_skills.append(skill)

    for item in value:
        process_item(item)

    return normalized_skills


# =========================================================
# SERIALIZATION
# =========================================================

def _serialize_job(job: dict) -> dict:
    return {
        "id": str(job["_id"]),
        "user_id": str(job.get("user_id", "")),
        "title": job.get("title", ""),
        "company": job.get("company"),
        "description": job.get("description", ""),
        "required_skills": normalize_job_skills(
            job.get("required_skills", [])
        ),
        "preferred_skills": normalize_job_skills(
            job.get("preferred_skills", [])
        ),
        "created_at": job.get("created_at"),
        "updated_at": job.get("updated_at"),
    }


# =========================================================
# CREATE JOB - HR / RECRUITER
# =========================================================

def create_job(
    user_id: str,
    title: str,
    company: str | None,
    description: str,
    required_skills: list[str],
    preferred_skills: list[str],
) -> dict:

    normalized_user_id = _validate_user_id(
        user_id
    )

    normalized_required_skills = normalize_job_skills(
        required_skills
    )

    normalized_preferred_skills = normalize_job_skills(
        preferred_skills
    )

    if not title or not title.strip():
        raise ValueError(
            "Job title cannot be empty."
        )

    if not description or not description.strip():
        raise ValueError(
            "Job description cannot be empty."
        )

    if not normalized_required_skills:
        raise ValueError(
            "At least one required skill is needed."
        )

    db = _get_db()

    now = datetime.now(timezone.utc)

    job_document = {
        "user_id": normalized_user_id,
        "title": title.strip(),
        "company": (
            company.strip()
            if isinstance(company, str)
            else None
        ),
        "description": description.strip(),
        "required_skills": normalized_required_skills,
        "preferred_skills": normalized_preferred_skills,
        "created_at": now,
        "updated_at": now,
    }

    result = db[JOBS_COLLECTION].insert_one(
        job_document
    )

    saved_job = db[JOBS_COLLECTION].find_one({
        "_id": result.inserted_id,
        **_owner_filter(normalized_user_id),
    })

    if not saved_job:
        raise RuntimeError(
            "Failed to retrieve the created job."
        )

    return _serialize_job(saved_job)


# =========================================================
# GET OWN JOB BY ID - HR / RECRUITER
# =========================================================

def get_job_by_id(
    job_id: str,
    user_id: str,
) -> dict:

    object_id = _validate_job_id(job_id)

    db = _get_db()

    job = db[JOBS_COLLECTION].find_one({
        "_id": object_id,
        **_owner_filter(user_id),
    })

    if not job:
        raise ValueError(
            "Job not found."
        )

    return _serialize_job(job)


# =========================================================
# GET AVAILABLE JOB BY ID - CANDIDATE
# =========================================================

def get_available_job_by_id(
    job_id: str,
) -> dict:

    object_id = _validate_job_id(job_id)

    db = _get_db()

    job = db[JOBS_COLLECTION].find_one({
        "_id": object_id,
    })

    if not job:
        raise ValueError(
            "Job not found."
        )

    return _serialize_job(job)


# =========================================================
# GET HR JOBS
# =========================================================

def get_user_jobs(
    user_id: str,
) -> list[dict]:

    db = _get_db()

    jobs = (
        db[JOBS_COLLECTION]
        .find(_owner_filter(user_id))
        .sort("created_at", -1)
    )

    return [
        _serialize_job(job)
        for job in jobs
    ]


# =========================================================
# UPDATE OWN JOB - HR / RECRUITER
# =========================================================

def update_job(
    job_id: str,
    user_id: str,
    title: str,
    company: str | None,
    description: str,
    required_skills: list[str],
    preferred_skills: list[str],
) -> dict:

    object_id = _validate_job_id(job_id)

    normalized_required_skills = normalize_job_skills(
        required_skills
    )

    normalized_preferred_skills = normalize_job_skills(
        preferred_skills
    )

    if not title or not title.strip():
        raise ValueError(
            "Job title cannot be empty."
        )

    if not description or not description.strip():
        raise ValueError(
            "Job description cannot be empty."
        )

    if not normalized_required_skills:
        raise ValueError(
            "At least one required skill is needed."
        )

    db = _get_db()

    now = datetime.now(timezone.utc)

    result = db[JOBS_COLLECTION].update_one(
        {
            "_id": object_id,
            **_owner_filter(user_id),
        },
        {
            "$set": {
                "title": title.strip(),
                "company": (
                    company.strip()
                    if isinstance(company, str)
                    else None
                ),
                "description": description.strip(),
                "required_skills": normalized_required_skills,
                "preferred_skills": normalized_preferred_skills,
                "updated_at": now,
            }
        },
    )

    if result.matched_count == 0:
        raise ValueError(
            "Job not found."
        )

    return get_job_by_id(
        job_id=job_id,
        user_id=user_id,
    )


# =========================================================
# DELETE OWN JOB - HR / RECRUITER
# =========================================================

def delete_job(
    job_id: str,
    user_id: str,
) -> bool:

    object_id = _validate_job_id(job_id)

    db = _get_db()

    result = db[JOBS_COLLECTION].delete_one({
        "_id": object_id,
        **_owner_filter(user_id),
    })

    if result.deleted_count == 0:
        raise ValueError(
            "Job not found."
        )

    return True

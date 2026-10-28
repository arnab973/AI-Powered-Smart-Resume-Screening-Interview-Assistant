
import logging
import sys

from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from bson import ObjectId

from app.database.mongodb import get_database


# =========================================================
# AI ENGINE IMPORT
# =========================================================

PROJECT_ROOT = Path(__file__).resolve().parents[3]
AI_ENGINE_PATH = PROJECT_ROOT / "ai-engine"

if str(AI_ENGINE_PATH) not in sys.path:
    sys.path.insert(0, str(AI_ENGINE_PATH))

from screening.screening_pipeline import run_screening_pipeline


# =========================================================
# CONFIGURATION
# =========================================================

logger = logging.getLogger(__name__)

SCREENINGS_COLLECTION = "screenings"
RESUMES_COLLECTION = "resumes"
JOBS_COLLECTION = "jobs"
APPLICATIONS_COLLECTION = "applications"
USERS_COLLECTION = "users"


# =========================================================
# DATABASE HELPERS
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


def _id_values(value: str) -> list:
    object_id = _validate_object_id(
        value,
        "ID",
    )

    return [
        str(object_id),
        object_id,
    ]


def _owner_filter(
    field: str,
    user_id: str,
) -> dict:
    return {
        field: {
            "$in": _id_values(user_id),
        }
    }


def _normalize_role(user_role: str) -> str:
    role = str(user_role or "").strip().lower()

    if role not in {
        "candidate",
        "hr",
        "recruiter",
    }:
        raise PermissionError(
            "You are not authorized to access screening."
        )

    return role


def _get_verified_role(
    db,
    user_id: str,
    user_role: str,
) -> str:
    """
    Verify the role against MongoDB instead
    of trusting a caller-provided role.
    """

    user_object_id = _validate_object_id(
        user_id,
        "user ID",
    )

    user = db[USERS_COLLECTION].find_one({
        "_id": user_object_id,
    })

    if not user:
        raise PermissionError(
            "Authenticated user not found."
        )

    database_role = _normalize_role(
        user.get("role")
    )

    requested_role = _normalize_role(
        user_role
    )

    if database_role != requested_role:
        raise PermissionError(
            "User role does not match authenticated account."
        )

    return database_role


def _get_active_application(
    db,
    job_id: str,
    resume_id: str,
    candidate_user_id: str,
):
    """
    Verify that a Candidate has an active
    application for the exact job/resume pair.
    """

    return db[APPLICATIONS_COLLECTION].find_one({
        "job_id": {
            "$in": _id_values(job_id),
        },
        "resume_id": {
            "$in": _id_values(resume_id),
        },
        "user_id": {
            "$in": _id_values(candidate_user_id),
        },
        "status": {
            "$ne": "Withdrawn",
        },
    })


def _get_authorized_hr_application(
    db,
    hr_user_id: str,
    job_id: str,
    resume_id: str,
    candidate_user_id: str,
):
    """
    HR must own the job, and the resume
    must belong to an active applicant.
    """

    job = db[JOBS_COLLECTION].find_one({
        "_id": _validate_object_id(
            job_id,
            "job ID",
        ),
        **_owner_filter(
            "user_id",
            hr_user_id,
        ),
    })

    if not job:
        return None

    return _get_active_application(
        db=db,
        job_id=job_id,
        resume_id=resume_id,
        candidate_user_id=candidate_user_id,
    )


# =========================================================
# RESUME AND JOB AUTHORIZATION
# =========================================================

def get_resume_and_job(
    resume_id: str,
    job_id: str,
    user_id: str,
    user_role: str = "candidate",
):
    """
    Candidate:
        May screen their own resume against
        an existing job.

    HR/Recruiter:
        Must own the job.
        Candidate must have an active application
        linking the exact resume and job.
    """

    db = _get_db()

    resume_object_id = _validate_object_id(
        resume_id,
        "resume ID",
    )

    job_object_id = _validate_object_id(
        job_id,
        "job ID",
    )

    normalized_user_id = str(
        _validate_object_id(
            user_id,
            "user ID",
        )
    )

    role = _get_verified_role(
        db=db,
        user_id=normalized_user_id,
        user_role=user_role,
    )

    # -----------------------------------------------------
    # CANDIDATE
    # -----------------------------------------------------

    if role == "candidate":
        resume = db[RESUMES_COLLECTION].find_one({
            "_id": resume_object_id,
            **_owner_filter(
                "user_id",
                normalized_user_id,
            ),
        })

        if not resume:
            raise ValueError(
                "Resume not found."
            )

        job = db[JOBS_COLLECTION].find_one({
            "_id": job_object_id,
        })

        if not job:
            raise ValueError(
                "Job not found."
            )

        return resume, job

    # -----------------------------------------------------
    # HR / RECRUITER
    # -----------------------------------------------------

    job = db[JOBS_COLLECTION].find_one({
        "_id": job_object_id,
        **_owner_filter(
            "user_id",
            normalized_user_id,
        ),
    })

    if not job:
        raise ValueError(
            "Job not found."
        )

    resume = db[RESUMES_COLLECTION].find_one({
        "_id": resume_object_id,
    })

    if not resume:
        raise ValueError(
            "Resume not found."
        )

    candidate_user_id = resume.get("user_id")

    if (
        not candidate_user_id
        or not ObjectId.is_valid(
            str(candidate_user_id)
        )
    ):
        raise PermissionError(
            "Resume ownership could not be verified."
        )

    application = _get_active_application(
        db=db,
        job_id=str(job_object_id),
        resume_id=str(resume_object_id),
        candidate_user_id=str(candidate_user_id),
    )

    if not application:
        raise PermissionError(
            "This resume is not linked to an "
            "active application for your job."
        )

    return resume, job


# =========================================================
# CREATE AI SCREENING
# =========================================================

def create_screening(
    user_id: str,
    resume_id: str,
    job_id: str,
    user_role: str = "candidate",
) -> dict:
    """
    Run AI screening for an authorized
    Candidate resume/job combination.
    """

    db = _get_db()

    normalized_user_id = str(
        _validate_object_id(
            user_id,
            "user ID",
        )
    )

    role = _get_verified_role(
        db=db,
        user_id=normalized_user_id,
        user_role=user_role,
    )

    resume, job = get_resume_and_job(
        resume_id=resume_id,
        job_id=job_id,
        user_id=normalized_user_id,
        user_role=role,
    )

    if not resume.get("parsed"):
        raise ValueError(
            "Resume must be parsed before ATS screening."
        )

    resume_text = (
        resume.get("extracted_text") or ""
    )

    structured_data = (
        resume.get("structured_data") or {}
    )

    if not isinstance(structured_data, dict):
        structured_data = {}

    resume_skills = structured_data.get(
        "skills",
        [],
    )

    if not isinstance(resume_skills, list):
        resume_skills = []

    job_description = (
        job.get("description")
        or job.get("job_description")
        or ""
    )

    required_skills = (
        job.get("required_skills")
        or []
    )

    if not isinstance(required_skills, list):
        required_skills = []

    # -----------------------------------------------------
    # AI SCREENING PIPELINE
    # -----------------------------------------------------

    ai_result = run_screening_pipeline(
        resume_text=resume_text,
        resume_skills=resume_skills,
        job_description=job_description,
        required_skills=required_skills,
    )

    if not isinstance(ai_result, dict):
        raise RuntimeError(
            "AI screening engine returned invalid data."
        )

    ats_analysis = (
        ai_result.get("ats_analysis") or {}
    )

    if not isinstance(ats_analysis, dict):
        ats_analysis = {}

    try:
        ats_score = float(
            ats_analysis.get(
                "ats_score",
                0.0,
            )
        )
    except (TypeError, ValueError):
        ats_score = 0.0

    skill_matching = (
        ai_result.get("skill_matching") or {}
    )

    if not isinstance(skill_matching, dict):
        skill_matching = {}

    skill_gap = (
        ai_result.get("skill_gap") or {}
    )

    if not isinstance(skill_gap, dict):
        skill_gap = {}

    semantic_matches = (
        skill_matching.get("semantic_matches")
        or []
    )

    semantic_missing = (
        skill_matching.get("semantic_missing")
        or []
    )

    if not isinstance(semantic_matches, list):
        semantic_matches = []

    if not isinstance(semantic_missing, list):
        semantic_missing = []

    # -----------------------------------------------------
    # MATCHED SKILLS
    # -----------------------------------------------------

    matched_skills = []

    for match in semantic_matches:
        if not isinstance(match, dict):
            continue

        required_skill = match.get(
            "required_skill"
        )

        if (
            required_skill
            and required_skill not in matched_skills
        ):
            matched_skills.append(
                required_skill
            )

    # -----------------------------------------------------
    # MISSING SKILLS
    # -----------------------------------------------------

    missing_skills = []

    for missing in semantic_missing:
        if not isinstance(missing, dict):
            continue

        required_skill = missing.get(
            "required_skill"
        )

        if (
            required_skill
            and required_skill not in missing_skills
        ):
            missing_skills.append(
                required_skill
            )

    # -----------------------------------------------------
    # MATCHING PERCENTAGE
    # -----------------------------------------------------

    total_required = len([
        skill
        for skill in required_skills
        if isinstance(skill, str)
        and skill.strip()
    ])

    if total_required == 0:
        matching_percentage = 0.0
    else:
        matching_percentage = (
            len(matched_skills)
            / total_required
        ) * 100

    matching_percentage = round(
        min(
            max(matching_percentage, 0.0),
            100.0,
        ),
        2,
    )

    # -----------------------------------------------------
    # SUGGESTIONS
    # -----------------------------------------------------

    suggestions = []

    ats_suggestions = (
        ats_analysis.get("suggestions")
        or []
    )

    if isinstance(ats_suggestions, list):
        for suggestion in ats_suggestions:
            if (
                suggestion
                and suggestion not in suggestions
            ):
                suggestions.append(
                    suggestion
                )

    improvement_areas = (
        skill_gap.get("improvement_areas")
        or []
    )

    if isinstance(improvement_areas, list):
        for area in improvement_areas:
            if not isinstance(area, dict):
                continue

            recommendation = area.get(
                "recommendation"
            )

            if (
                recommendation
                and recommendation not in suggestions
            ):
                suggestions.append(
                    recommendation
                )

    # -----------------------------------------------------
    # VERIFY ACCESS AGAIN BEFORE SAVING
    # -----------------------------------------------------

    # A withdrawal may happen while the AI
    # pipeline is running. Recheck HR access
    # before inserting the screening record.

    if role in {"hr", "recruiter"}:
        candidate_user_id = str(
            resume["user_id"]
        )

        application = _get_authorized_hr_application(
            db=db,
            hr_user_id=normalized_user_id,
            job_id=str(job["_id"]),
            resume_id=str(resume["_id"]),
            candidate_user_id=candidate_user_id,
        )

        if not application:
            raise PermissionError(
                "Application is no longer eligible "
                "for HR screening."
            )

    # -----------------------------------------------------
    # SAVE SCREENING
    # -----------------------------------------------------

    now = datetime.now(timezone.utc)

    candidate_user_id = str(
        resume["user_id"]
    )

    screening_document = {
        # Candidate whose resume was screened.
        "user_id": candidate_user_id,

        # User who initiated screening.
        "created_by": normalized_user_id,
        "created_by_role": role,

        "resume_id": str(resume["_id"]),
        "job_id": str(job["_id"]),

        "ats_score": ats_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "matching_percentage": matching_percentage,
        "suggestions": suggestions,

        "ai_analysis": ai_result,

        "created_at": now,
        "updated_at": now,
    }

    result = db[
        SCREENINGS_COLLECTION
    ].insert_one(
        screening_document
    )

    screening_document["_id"] = (
        result.inserted_id
    )

    logger.info(
        "Screening created: %s",
        result.inserted_id,
    )

    return {
        **format_screening(
            screening_document
        ),
        "created_at": now,
        "updated_at": now,
    }


# =========================================================
# FORMAT SCREENING
# =========================================================

def format_screening(
    screening: dict,
) -> dict:
    """
    Preserve the existing API response.
    """

    return {
        "id": str(
            screening["_id"]
        ),
        "user_id": str(
            screening.get("user_id", "")
        ),
        "resume_id": str(
            screening.get("resume_id", "")
        ),
        "job_id": str(
            screening.get("job_id", "")
        ),
        "ats_score": screening.get(
            "ats_score",
            0.0,
        ),
        "matched_skills": screening.get(
            "matched_skills",
            [],
        ),
        "missing_skills": screening.get(
            "missing_skills",
            [],
        ),
        "matching_percentage": screening.get(
            "matching_percentage",
            0.0,
        ),
        "suggestions": screening.get(
            "suggestions",
            [],
        ),
        "ai_analysis": screening.get(
            "ai_analysis",
            {},
        ),
    }


# =========================================================
# SCREENING READ AUTHORIZATION
# =========================================================

def _can_read_screening(
    db,
    screening: dict,
    user_id: str,
    role: str,
) -> bool:
    """
    Candidate:
        Can read screening for own resume.

    HR/Recruiter:
        Must own the job and have an active
        application for the exact resume/job pair.
    """

    resume_id = screening.get(
        "resume_id"
    )

    job_id = screening.get(
        "job_id"
    )

    if (
        not resume_id
        or not job_id
        or not ObjectId.is_valid(str(resume_id))
        or not ObjectId.is_valid(str(job_id))
    ):
        return False

    resume = db[RESUMES_COLLECTION].find_one({
        "_id": ObjectId(str(resume_id)),
    })

    if not resume:
        return False

    candidate_user_id = str(
        resume.get("user_id", "")
    )

    if not ObjectId.is_valid(candidate_user_id):
        return False

    # New records have user_id = Candidate ID.
    # Legacy HR-generated records may have
    # user_id = HR ID, so do not rely on
    # screening.user_id alone.

    if role == "candidate":
        return (
            candidate_user_id == str(user_id)
        )

    if role in {"hr", "recruiter"}:
        application = _get_authorized_hr_application(
            db=db,
            hr_user_id=user_id,
            job_id=str(job_id),
            resume_id=str(resume_id),
            candidate_user_id=candidate_user_id,
        )

        return application is not None

    return False


# =========================================================
# GET USER SCREENINGS
# =========================================================

def get_user_screenings(
    user_id: str,
    user_role: str = "candidate",
) -> list[dict]:
    """
    Candidate:
        Own resume screenings.

    HR/Recruiter:
        Authorized screenings for their jobs.
    """

    db = _get_db()

    normalized_user_id = str(
        _validate_object_id(
            user_id,
            "user ID",
        )
    )

    role = _get_verified_role(
        db=db,
        user_id=normalized_user_id,
        user_role=user_role,
    )

    results = []

    if role == "candidate":
        resume_ids = [
            resume["_id"]
            for resume in db[
                RESUMES_COLLECTION
            ].find(
                _owner_filter(
                    "user_id",
                    normalized_user_id,
                ),
                {"_id": 1},
            )
        ]

        if not resume_ids:
            return []

        resume_id_values = []

        for resume_id in resume_ids:
            resume_id_values.extend(
                _id_values(str(resume_id))
            )

        screenings = (
            db[SCREENINGS_COLLECTION]
            .find({
                "resume_id": {
                    "$in": resume_id_values,
                },
            })
            .sort("created_at", -1)
        )

    else:
        owned_job_ids = [
            job["_id"]
            for job in db[
                JOBS_COLLECTION
            ].find(
                _owner_filter(
                    "user_id",
                    normalized_user_id,
                ),
                {"_id": 1},
            )
        ]

        if not owned_job_ids:
            return []

        job_id_values = []

        for job_id in owned_job_ids:
            job_id_values.extend(
                _id_values(str(job_id))
            )

        screenings = (
            db[SCREENINGS_COLLECTION]
            .find({
                "job_id": {
                    "$in": job_id_values,
                },
            })
            .sort("created_at", -1)
        )

    for screening in screenings:
        if _can_read_screening(
            db=db,
            screening=screening,
            user_id=normalized_user_id,
            role=role,
        ):
            results.append(
                format_screening(screening)
            )

    return results


# =========================================================
# GET SCREENING BY ID
# =========================================================

def get_screening_by_id(
    screening_id: str,
    user_id: str,
    user_role: str = "candidate",
) -> dict:
    """
    Retrieve a screening only when the
    authenticated user is authorized.
    """

    db = _get_db()

    normalized_user_id = str(
        _validate_object_id(
            user_id,
            "user ID",
        )
    )

    role = _get_verified_role(
        db=db,
        user_id=normalized_user_id,
        user_role=user_role,
    )

    screening_object_id = _validate_object_id(
        screening_id,
        "screening ID",
    )

    screening = db[
        SCREENINGS_COLLECTION
    ].find_one({
        "_id": screening_object_id,
    })

    if not screening:
        raise ValueError(
            "Screening result not found."
        )

    if not _can_read_screening(
        db=db,
        screening=screening,
        user_id=normalized_user_id,
        role=role,
    ):
        raise ValueError(
            "Screening result not found."
        )

    return format_screening(
        screening
    )

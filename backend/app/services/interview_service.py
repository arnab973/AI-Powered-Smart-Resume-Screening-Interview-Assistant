
import logging
import re
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

from interview_engine.interview_manager import create_interview


# =========================================================
# CONFIGURATION
# =========================================================

logger = logging.getLogger(__name__)

RESUMES_COLLECTION = "resumes"
JOBS_COLLECTION = "jobs"
SCREENINGS_COLLECTION = "screenings"
INTERVIEWS_COLLECTION = "interviews"


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
        raise ValueError(f"Invalid {field_name}.")

    return ObjectId(str(value))


def _id_variants(
    value: str,
    field_name: str = "ID",
) -> list:

    object_id = _validate_object_id(
        value,
        field_name,
    )

    return [
        str(object_id),
        object_id,
    ]


def _owner_filter(user_id: str) -> dict:
    return {
        "user_id": {
            "$in": _id_variants(
                user_id,
                "user_id",
            )
        }
    }


def _as_dict(value: Any) -> dict:
    return value if isinstance(value, dict) else {}


def _as_list(value: Any) -> list:
    return value if isinstance(value, list) else []


# =========================================================
# SERIALIZATION
# =========================================================

def _serialize_document(
    document: dict | None,
):

    if not document:
        return None

    result = {}

    for key, value in document.items():
        if isinstance(value, ObjectId):
            result[key] = str(value)
        else:
            result[key] = value

    return result


def _serialize_interview(
    interview: dict,
) -> dict:

    serialized = _serialize_document(interview)

    serialized["id"] = serialized.pop("_id")

    return serialized


# =========================================================
# SKILL NORMALIZATION
# =========================================================

def _extract_skills(value: Any) -> list[str]:
    """
    Extract unique skills from strings, lists,
    and common structured objects.
    """

    skills = []
    seen = set()

    def add_skill(skill):
        if not isinstance(skill, str):
            return

        for part in re.split(r"[,;\n]+", skill):
            cleaned = part.strip().strip("\"'[] ")

            if not cleaned:
                continue

            normalized = cleaned.casefold()

            if normalized not in seen:
                seen.add(normalized)
                skills.append(cleaned)

    def walk(item):
        if isinstance(item, str):
            add_skill(item)

        elif isinstance(item, (list, tuple, set)):
            for child in item:
                walk(child)

        elif isinstance(item, dict):
            for key in (
                "required_skill",
                "skill",
                "skill_name",
                "name",
                "skills",
                "technical_skills",
                "soft_skills",
                "matched_skills",
                "missing_skills",
                "semantic_matches",
                "semantic_missing",
            ):
                if key in item:
                    walk(item[key])

    walk(value)

    return skills


# =========================================================
# RESUME SKILL EXTRACTION
# =========================================================

def _get_resume_skills(
    resume: dict,
) -> list[str]:

    containers = [
        resume,
        _as_dict(resume.get("structured_data")),
        _as_dict(resume.get("parsed_data")),
        _as_dict(resume.get("parsed_resume")),
        _as_dict(resume.get("resume_data")),
        _as_dict(resume.get("extracted_data")),
    ]

    collected = []

    for container in containers:
        for key in (
            "skills",
            "technical_skills",
            "skill_set",
            "soft_skills",
        ):
            collected.extend(
                _extract_skills(container.get(key))
            )

        sections = _as_dict(
            container.get("sections")
        )

        collected.extend(
            _extract_skills(
                sections.get("skills")
            )
        )

    return _extract_skills(collected)


# =========================================================
# QUESTION COUNT VALIDATION
# =========================================================

def _validate_question_count(
    value: int,
    field_name: str,
) -> int:

    if isinstance(value, bool) or not isinstance(value, int):
        raise ValueError(
            f"{field_name} must be an integer."
        )

    if value < 0:
        raise ValueError(
            f"{field_name} cannot be negative."
        )

    if value > 50:
        raise ValueError(
            f"{field_name} cannot exceed 50."
        )

    return value


# =========================================================
# JOB DESCRIPTION
# =========================================================

def _get_job_description(
    job: dict,
) -> str:

    parts = []

    title = job.get("title")

    if isinstance(title, str) and title.strip():
        parts.append(
            f"Job title: {title.strip()}"
        )

    description = (
        job.get("description")
        or job.get("job_description")
        or ""
    )

    if isinstance(description, str) and description.strip():
        parts.append(description.strip())

    elif isinstance(description, dict):
        for key, value in description.items():
            if isinstance(value, str) and value.strip():
                parts.append(
                    f"{key}: {value.strip()}"
                )

    requirements = job.get("requirements")

    if isinstance(requirements, str):
        if requirements.strip():
            parts.append(
                f"Requirements: {requirements.strip()}"
            )

    elif isinstance(requirements, list):
        requirement_text = _extract_skills(
            requirements
        )

        if requirement_text:
            parts.append(
                "Requirements: "
                + ", ".join(requirement_text)
            )

    required_skills = _extract_skills(
        job.get("required_skills")
        or job.get("skills")
    )

    if required_skills:
        parts.append(
            "Required skills: "
            + ", ".join(required_skills)
        )

    return "\n".join(parts)


# =========================================================
# GET LATEST SCREENING
# =========================================================

def _get_latest_screening(
    db,
    resume_id: str,
    job_id: str,
):

    return db[SCREENINGS_COLLECTION].find_one(
        {
            "resume_id": {
                "$in": _id_variants(
                    resume_id,
                    "resume_id",
                )
            },
            "job_id": {
                "$in": _id_variants(
                    job_id,
                    "job_id",
                )
            },
        },
        sort=[("created_at", -1)],
    )


# =========================================================
# SCREENING SKILL EXTRACTION
# =========================================================

def _get_screening_skills(
    screening: dict | None,
) -> tuple[list[str], list[str]]:

    if not screening:
        return [], []

    matched_skills = _extract_skills(
        screening.get("matched_skills")
    )

    missing_skills = _extract_skills(
        screening.get("missing_skills")
    )

    analysis = _as_dict(
        screening.get("ai_analysis")
    )

    skill_matching = _as_dict(
        analysis.get("skill_matching")
    )

    skill_gap = _as_dict(
        analysis.get("skill_gap")
    )

    if not matched_skills:
        matched_skills = _extract_skills(
            skill_matching.get("semantic_matches")
            or skill_gap.get("matched_skills")
        )

    if not missing_skills:
        missing_skills = _extract_skills(
            skill_matching.get("semantic_missing")
            or skill_gap.get("missing_skills")
        )

    return matched_skills, missing_skills


# =========================================================
# CREATE AI INTERVIEW
# =========================================================

def create_ai_interview(
    user_id: str,
    resume_id: str,
    job_id: str,
    technical_question_count: int = 5,
    skill_gap_question_count: int = 2,
    hr_question_count: int = 3,
) -> dict[str, Any]:

    # -----------------------------------------------------
    # VALIDATE IDS
    # -----------------------------------------------------

    resume_object_id = _validate_object_id(
        resume_id,
        "resume_id",
    )

    job_object_id = _validate_object_id(
        job_id,
        "job_id",
    )

    normalized_user_id = str(
        _validate_object_id(
            user_id,
            "user_id",
        )
    )

    # -----------------------------------------------------
    # VALIDATE QUESTION COUNTS
    # -----------------------------------------------------

    technical_question_count = _validate_question_count(
        technical_question_count,
        "technical_question_count",
    )

    skill_gap_question_count = _validate_question_count(
        skill_gap_question_count,
        "skill_gap_question_count",
    )

    hr_question_count = _validate_question_count(
        hr_question_count,
        "hr_question_count",
    )

    expected_counts = (
        technical_question_count,
        skill_gap_question_count,
        hr_question_count,
    )

    expected_total = sum(expected_counts)

    if expected_total == 0:
        raise ValueError(
            "At least one interview question is required."
        )

    if expected_total > 100:
        raise ValueError(
            "Total interview questions cannot exceed 100."
        )

    db = _get_db()

    # -----------------------------------------------------
    # VERIFY RESUME OWNERSHIP
    # -----------------------------------------------------

    resume = db[RESUMES_COLLECTION].find_one({
        "_id": resume_object_id,
        **_owner_filter(normalized_user_id),
    })

    if not resume:
        raise ValueError(
            "Resume not found."
        )

    # -----------------------------------------------------
    # RESUME PARSING STATUS
    # -----------------------------------------------------

    if not resume.get("parsed"):
        logger.warning(
            "INTERVIEW WARNING | Resume %s is not "
            "marked as parsed. Continuing with "
            "available resume/job data.",
            resume_id,
        )

    # -----------------------------------------------------
    # GET JOB
    # -----------------------------------------------------

    job = db[JOBS_COLLECTION].find_one({
        "_id": job_object_id,
    })

    if not job:
        raise ValueError(
            "Job not found."
        )

    # -----------------------------------------------------
    # EXTRACT RESUME SKILLS
    # -----------------------------------------------------

    resume_skills = _get_resume_skills(
        resume
    )

    # -----------------------------------------------------
    # GET LATEST SCREENING
    # -----------------------------------------------------

    screening = _get_latest_screening(
        db=db,
        resume_id=str(resume_object_id),
        job_id=str(job_object_id),
    )

    matched_skills, missing_skills = (
        _get_screening_skills(screening)
    )

    # -----------------------------------------------------
    # BUILD JOB DESCRIPTION
    # -----------------------------------------------------

    job_description = _get_job_description(
        job
    )

    # -----------------------------------------------------
    # DEBUG LOGGING
    # -----------------------------------------------------

    logger.warning(
        "INTERVIEW DEBUG | resume_id=%s job_id=%s",
        resume_id,
        job_id,
    )

    logger.warning(
        "INTERVIEW DEBUG | parsed=%s resume_skills=%s",
        resume.get("parsed"),
        resume_skills,
    )

    logger.warning(
        "INTERVIEW DEBUG | matched_skills=%s",
        matched_skills,
    )

    logger.warning(
        "INTERVIEW DEBUG | missing_skills=%s",
        missing_skills,
    )

    logger.warning(
        "INTERVIEW DEBUG | screening_id=%s",
        str(screening["_id"]) if screening else None,
    )

    logger.warning(
        "INTERVIEW DEBUG | expected_counts=%s",
        expected_counts,
    )

    # -----------------------------------------------------
    # GENERATE AI INTERVIEW
    # -----------------------------------------------------

    interview_result = create_interview(
        resume_skills=resume_skills,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        job_description=job_description,
        technical_question_count=technical_question_count,
        skill_gap_question_count=skill_gap_question_count,
        hr_question_count=hr_question_count,
    )

    if not isinstance(interview_result, dict):
        raise RuntimeError(
            "AI interview engine returned invalid data."
        )

    # -----------------------------------------------------
    # EXTRACT QUESTION CATEGORIES
    # -----------------------------------------------------

    technical_questions = _as_list(
        interview_result.get("technical_questions")
    )

    skill_gap_questions = _as_list(
        interview_result.get("skill_gap_questions")
    )

    hr_questions = _as_list(
        interview_result.get("hr_questions")
    )

    actual_counts = (
        len(technical_questions),
        len(skill_gap_questions),
        len(hr_questions),
    )

    logger.warning(
        "INTERVIEW RESULT | expected=%s actual=%s method=%s",
        expected_counts,
        actual_counts,
        interview_result.get("generation_method"),
    )

    # -----------------------------------------------------
    # VALIDATE GENERATED QUESTION COUNTS
    # -----------------------------------------------------

    if actual_counts != expected_counts:
        raise RuntimeError(
            "Interview question count mismatch. "
            f"Expected {expected_counts}, "
            f"received {actual_counts}. "
            "Check AI generator logs."
        )

    # -----------------------------------------------------
    # COMBINE AND VALIDATE QUESTIONS
    # -----------------------------------------------------

    questions = (
        technical_questions
        + skill_gap_questions
        + hr_questions
    )

    for index, question in enumerate(
        questions,
        start=1,
    ):
        if not isinstance(question, dict):
            raise RuntimeError(
                "Interview engine returned an invalid question."
            )

        if not str(question.get("question") or "").strip():
            raise RuntimeError(
                "Interview engine returned an empty question."
            )

        question["question_number"] = index

    # -----------------------------------------------------
    # BUILD INTERVIEW DOCUMENT
    # -----------------------------------------------------

    now = datetime.now(timezone.utc)

    interview_document = {
        "user_id": normalized_user_id,
        "resume_id": str(resume_object_id),
        "job_id": str(job_object_id),

        "job_title": job.get(
            "title",
            "Selected Job",
        ),

        "company": job.get(
            "company",
            "",
        ),

        "total_questions": len(questions),

        # -------------------------------------------------
        # INITIAL INTERVIEW PROGRESS
        # -------------------------------------------------

        "answered_questions": 0,
        "completion_percentage": 0.0,
        "is_completed": False,
        "status": "not_started",
        "completed_at": None,

        "technical_questions": technical_questions,
        "skill_gap_questions": skill_gap_questions,
        "hr_questions": hr_questions,
        "questions": questions,

        "generation_method": interview_result.get(
            "generation_method",
            "unknown",
        ),

        "ai_analysis": {
            "resume_skills": resume_skills,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "job_description": job_description,
            "screening_id": (
                str(screening["_id"])
                if screening
                else None
            ),
        },

        "created_at": now,
        "updated_at": now,
    }

    # -----------------------------------------------------
    # SAVE INTERVIEW TO MONGODB
    # -----------------------------------------------------

    insert_result = db[
        INTERVIEWS_COLLECTION
    ].insert_one(
        interview_document
    )

    interview_document["_id"] = (
        insert_result.inserted_id
    )

    logger.info(
        "AI interview created successfully: %s",
        insert_result.inserted_id,
    )

    return _serialize_interview(
        interview_document
    )


# =========================================================
# GET INTERVIEW BY ID
# =========================================================

def get_interview_by_id(
    interview_id: str,
    user_id: str,
) -> dict[str, Any]:

    interview_object_id = _validate_object_id(
        interview_id,
        "interview_id",
    )

    db = _get_db()

    interview = db[
        INTERVIEWS_COLLECTION
    ].find_one({
        "_id": interview_object_id,
        **_owner_filter(user_id),
    })

    if not interview:
        raise ValueError(
            "Interview not found."
        )

    return _serialize_interview(
        interview
    )


# =========================================================
# GET USER INTERVIEWS
# =========================================================

def get_user_interviews(
    user_id: str,
) -> list[dict[str, Any]]:

    db = _get_db()

    interviews = (
        db[INTERVIEWS_COLLECTION]
        .find(_owner_filter(user_id))
        .sort("created_at", -1)
    )

    return [
        _serialize_interview(interview)
        for interview in interviews
    ]

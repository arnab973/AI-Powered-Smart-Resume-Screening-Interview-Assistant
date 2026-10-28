
from typing import Any
from datetime import datetime, timezone
import math

from bson import ObjectId

from app.database.mongodb import get_database
from app.services.interview_progress_service import (
    update_interview_progress,
)


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


def _id_variants(value: str) -> list:
    oid = _validate_object_id(value, "ID")
    return [oid, str(oid)]


def _user_filter(user_id: str) -> dict:
    return {
        "user_id": {
            "$in": _id_variants(user_id)
        }
    }


def _serialize_document(document: dict) -> dict:
    result = {}

    for key, value in document.items():
        if key == "_id":
            result["id"] = str(value)
        elif isinstance(value, ObjectId):
            result[key] = str(value)
        else:
            result[key] = value

    return result


def _safe_float(
    value,
    default: float = 0.0,
) -> float:

    try:
        if value is None:
            return default

        number = float(value)

        return (
            number
            if math.isfinite(number)
            else default
        )

    except (TypeError, ValueError, OverflowError):
        return default


def _average(values: list[float]) -> float:
    return (
        round(sum(values) / len(values), 2)
        if values
        else 0.0
    )


def _clamp_score(score: float) -> float:
    return round(
        max(0.0, min(10.0, _safe_float(score))),
        2,
    )


def _get_performance_level(score: float) -> str:
    score = _clamp_score(score)

    if score >= 8.5:
        return "Excellent"

    if score >= 7.0:
        return "Good"

    if score >= 5.0:
        return "Average"

    if score >= 3.0:
        return "Needs Improvement"

    return "Poor"


def _unique_items(values: list) -> list[str]:
    result = []
    seen = set()

    for value in values:
        if value is None:
            continue

        item = str(value).strip()

        if item and item not in seen:
            seen.add(item)
            result.append(item)

    return result


def _collect_scores(
    documents: list[dict],
    field: str,
) -> list[float]:

    return [
        _safe_float(doc[field])
        for doc in documents
        if doc.get(field) is not None
    ]


def _collect_list(
    documents: list[dict],
    field: str,
) -> list[str]:

    values = []

    for doc in documents:
        item = doc.get(field) or []

        if isinstance(item, list):
            values.extend(item)

        elif isinstance(item, str):
            values.append(item)

    return _unique_items(values)


# =========================================================
# CREATE CANDIDATE PERFORMANCE REPORT
# =========================================================

def create_performance_report(
    user_id: str,
    interview_id: str | None = None,
) -> dict[str, Any]:
    """
    Generate a candidate performance report.

    Without interview_id:
        Aggregate all candidate evaluations.

    With interview_id:
        Aggregate evaluations belonging only
        to the selected candidate interview.

    Interview progress is synchronized before
    generating an interview-specific report.
    """

    user_object_id = _validate_object_id(
        user_id,
        "user_id",
    )

    db = _get_db()

    normalized_interview_id = None
    evaluation_filter = _user_filter(user_id)

    total_questions = None
    question_numbers = set()

    # -----------------------------------------------------
    # VERIFY INTERVIEW OWNERSHIP
    # -----------------------------------------------------

    if interview_id is not None:

        interview_object_id = _validate_object_id(
            interview_id,
            "interview_id",
        )

        normalized_interview_id = str(
            interview_object_id
        )

        interview = db["interviews"].find_one({
            "_id": interview_object_id,
            **_user_filter(user_id),
        })

        if interview is None:
            raise ValueError(
                "Interview not found."
            )

        # -------------------------------------------------
        # SYNCHRONIZE INTERVIEW PROGRESS
        # -------------------------------------------------

        update_interview_progress(
            interview_id=normalized_interview_id,
            user_id=user_id,
        )

        # -------------------------------------------------
        # EXTRACT VALID INTERVIEW QUESTIONS
        # -------------------------------------------------

        questions = interview.get("questions")

        if not isinstance(questions, list) or not questions:

            questions = []

            for key in (
                "technical_questions",
                "skill_gap_questions",
                "hr_questions",
            ):
                items = interview.get(key) or []

                if isinstance(items, list):
                    questions.extend(items)

        for index, item in enumerate(
            questions,
            start=1,
        ):
            if not isinstance(item, dict):
                continue

            number = item.get(
                "question_number",
                index,
            )

            if (
                isinstance(number, int)
                and not isinstance(number, bool)
                and number >= 1
            ):
                question_numbers.add(number)

        total_questions = len(question_numbers)

        if total_questions == 0:
            raise ValueError(
                "Interview has no valid questions."
            )

        # -------------------------------------------------
        # FILTER EVALUATIONS BY INTERVIEW
        # -------------------------------------------------

        evaluation_filter["interview_id"] = {
            "$in": [
                interview_object_id,
                normalized_interview_id,
            ]
        }

    # -----------------------------------------------------
    # LOAD EVALUATIONS
    # -----------------------------------------------------

    evaluations = list(
        db["evaluations"]
        .find(evaluation_filter)
        .sort("_id", 1)
    )

    if not evaluations:
        raise ValueError(
            "No evaluations found for this interview."
            if normalized_interview_id
            else "No evaluations found for this user."
        )

    # -----------------------------------------------------
    # REMOVE DUPLICATE OR INVALID QUESTION EVALUATIONS
    # -----------------------------------------------------

    if normalized_interview_id:

        by_number = {}

        for evaluation in evaluations:

            number = evaluation.get(
                "question_number"
            )

            if (
                isinstance(number, int)
                and not isinstance(number, bool)
                and number in question_numbers
            ):
                by_number[number] = evaluation

        evaluations = list(
            by_number.values()
        )

        if not evaluations:
            raise ValueError(
                "No valid question evaluations found "
                "for this interview."
            )

    # -----------------------------------------------------
    # CALCULATE COMPLETION
    # -----------------------------------------------------

    answered_questions = len(evaluations)

    if total_questions is None:
        total_questions = answered_questions

    completion_percentage = round(
        (
            answered_questions / total_questions
        ) * 100,
        2,
    )

    is_completed = (
        answered_questions == total_questions
    )

    # -----------------------------------------------------
    # CALCULATE AVERAGE SCORES
    # -----------------------------------------------------

    def average_field(field: str) -> float:
        return _clamp_score(
            _average(
                _collect_scores(
                    evaluations,
                    field,
                )
            )
        )

    average_score = average_field(
        "overall_score"
    )

    average_technical_score = average_field(
        "technical_score"
    )

    average_relevance_score = average_field(
        "relevance_score"
    )

    average_clarity_score = average_field(
        "clarity_score"
    )

    average_completeness_score = average_field(
        "completeness_score"
    )

    performance_level = _get_performance_level(
        average_score
    )

    # -----------------------------------------------------
    # COLLECT FEEDBACK
    # -----------------------------------------------------

    strengths = _collect_list(
        evaluations,
        "strengths",
    )

    weaknesses = _collect_list(
        evaluations,
        "weaknesses",
    )

    improvement_recommendations = _collect_list(
        evaluations,
        "improvement_plan",
    )

    interview_tips = _unique_items([
        item.get("interview_tip")
        for item in evaluations
        if item.get("interview_tip")
    ])

    evaluation_ids = [
        str(item["_id"])
        for item in evaluations
        if item.get("_id")
    ]

    # -----------------------------------------------------
    # GENERATE OVERALL FEEDBACK
    # -----------------------------------------------------

    if normalized_interview_id:

        overall_feedback = (
            f"The candidate answered {answered_questions} "
            f"of {total_questions} interview questions "
            f"({completion_percentage}% completion). "
            f"Average score across evaluated answers: "
            f"{average_score}/10. "
            f"Performance level: {performance_level}."
        )

    else:

        overall_feedback = (
            f"The candidate completed {answered_questions} "
            f"evaluated interview questions with an "
            f"average score of {average_score}/10. "
            f"Overall performance level: {performance_level}."
        )

    # -----------------------------------------------------
    # SAVE REPORT
    # -----------------------------------------------------

    now = datetime.now(timezone.utc)

    report = {
        "user_id": user_object_id,
        "interview_id": normalized_interview_id,

        "total_questions": total_questions,
        "answered_questions": answered_questions,
        "completion_percentage": completion_percentage,
        "is_completed": is_completed,

        "average_score": average_score,
        "average_technical_score": average_technical_score,
        "average_relevance_score": average_relevance_score,
        "average_clarity_score": average_clarity_score,
        "average_completeness_score": average_completeness_score,

        "performance_level": performance_level,

        "strengths": strengths,
        "weaknesses": weaknesses,
        "overall_feedback": overall_feedback,
        "improvement_recommendations": improvement_recommendations,
        "interview_tips": interview_tips,

        "evaluation_ids": evaluation_ids,

        "metadata": {
            "report_type": (
                "interview_performance"
                if normalized_interview_id
                else "candidate_performance"
            ),
            "evaluation_count": answered_questions,
        },

        "created_at": now,
        "updated_at": now,
    }

    result = db["reports"].insert_one(
        report
    )

    saved_report = db["reports"].find_one({
        "_id": result.inserted_id,
        **_user_filter(user_id),
    })

    if saved_report is None:
        raise RuntimeError(
            "Failed to retrieve saved performance report."
        )

    return _serialize_document(
        saved_report
    )


# =========================================================
# GET PERFORMANCE REPORT BY ID
# =========================================================

def get_report_by_id(
    report_id: str,
    user_id: str,
) -> dict[str, Any]:

    report_object_id = _validate_object_id(
        report_id,
        "report_id",
    )

    db = _get_db()

    report = db["reports"].find_one({
        "_id": report_object_id,
        **_user_filter(user_id),
    })

    if not report:
        raise ValueError(
            "Performance report not found."
        )

    return _serialize_document(report)


# =========================================================
# GET USER REPORTS
# =========================================================

def get_user_reports(
    user_id: str,
) -> list[dict[str, Any]]:

    db = _get_db()

    reports = (
        db["reports"]
        .find(_user_filter(user_id))
        .sort("_id", -1)
    )

    return [
        _serialize_document(report)
        for report in reports
    ]


# =========================================================
# HR ANALYTICS HELPERS
# =========================================================

def _skill_frequency(
    screenings: list[dict],
    field: str,
) -> dict[str, int]:

    frequency = {}

    for screening in screenings:

        skills = screening.get(field) or []

        if not isinstance(skills, list):
            continue

        for skill in skills:

            skill_name = str(skill).strip()

            if skill_name:
                frequency[skill_name] = (
                    frequency.get(skill_name, 0) + 1
                )

    return frequency


def _top_skills(
    frequency: dict[str, int],
    limit: int = 10,
) -> list[dict]:

    return sorted(
        [
            {
                "skill": skill,
                "count": count,
            }
            for skill, count in frequency.items()
        ],
        key=lambda item: item["count"],
        reverse=True,
    )[:limit]


def _get_ats_distribution(
    scores: list[float],
) -> dict[str, int]:

    distribution = {
        "excellent": 0,
        "strong": 0,
        "average": 0,
        "low": 0,
    }

    for score in scores:

        if score >= 85:
            distribution["excellent"] += 1

        elif score >= 70:
            distribution["strong"] += 1

        elif score >= 50:
            distribution["average"] += 1

        else:
            distribution["low"] += 1

    return distribution


def _find_related_document(
    collection,
    document_id,
    projection: dict,
):

    if not document_id:
        return None

    if not ObjectId.is_valid(str(document_id)):
        return None

    return collection.find_one(
        {
            "_id": ObjectId(
                str(document_id)
            )
        },
        projection,
    )


def _get_recent_screenings(
    db,
    screenings: list[dict],
    limit: int = 10,
) -> list[dict]:

    recent_screenings = []

    for screening in screenings[:limit]:

        resume = _find_related_document(
            db["resumes"],
            screening.get("resume_id"),
            {"structured_data": 1},
        )

        job = _find_related_document(
            db["jobs"],
            screening.get("job_id"),
            {"title": 1, "company": 1},
        )

        candidate_name = "Unknown Candidate"

        if resume:

            structured_data = (
                resume.get("structured_data") or {}
            )

            personal_information = (
                structured_data.get(
                    "personal_information"
                ) or {}
            )

            candidate_name = (
                personal_information.get("name")
                or candidate_name
            )

        created_at = screening.get(
            "created_at"
        )

        recent_screenings.append({
            "id": str(screening["_id"]),
            "candidate_name": candidate_name,

            "job_title": (
                job.get("title")
                if job
                else "Unknown Job"
            ),

            "company": (
                job.get("company")
                if job
                else ""
            ),

            "ats_score": _safe_float(
                screening.get("ats_score")
            ),

            "matching_percentage": _safe_float(
                screening.get("matching_percentage")
            ),

            "matched_skills": (
                screening.get("matched_skills") or []
            ),

            "missing_skills": (
                screening.get("missing_skills") or []
            ),

            "created_at": (
                created_at.isoformat()
                if hasattr(
                    created_at,
                    "isoformat",
                )
                else None
            ),
        })

    return recent_screenings


def _empty_hr_analytics() -> dict[str, Any]:

    return {
        "total_candidates": 0,
        "total_resumes": 0,
        "parsed_resumes": 0,
        "total_screenings": 0,

        "average_ats": 0.0,
        "average_matching": 0.0,

        "total_evaluations": 0,
        "average_interview_score": 0.0,

        "shortlisted_count": None,
        "shortlist_tracking_available": False,

        "ats_distribution": {
            "excellent": 0,
            "strong": 0,
            "average": 0,
            "low": 0,
        },

        "top_matched_skills": [],
        "top_missing_skills": [],
        "recent_screenings": [],
        "ai_insights": [],
    }


# =========================================================
# HR ANALYTICS - OWNED JOBS ONLY
# =========================================================

def get_hr_analytics(
    *,
    hr_user_id: str,
) -> dict[str, Any]:
    """
    Recruitment analytics scoped to jobs
    owned by the authenticated HR user.

    Unlinked interview evaluations are not
    exposed through HR analytics.
    """

    db = _get_db()

    hr_object_id = _validate_object_id(
        hr_user_id,
        "hr_user_id",
    )

    # -----------------------------------------------------
    # VERIFY HR ACCOUNT
    # -----------------------------------------------------

    hr_user = db["users"].find_one({
        "_id": hr_object_id,
    })

    if not hr_user:
        raise ValueError(
            "User not found."
        )

    role = str(
        hr_user.get("role", "")
    ).strip().lower()

    if role not in {"hr", "recruiter"}:
        raise PermissionError(
            "Only HR or recruiters can access analytics."
        )

    # -----------------------------------------------------
    # FETCH OWNED JOBS
    # -----------------------------------------------------

    owned_jobs = list(
        db["jobs"].find(
            {
                "user_id": {
                    "$in": _id_variants(
                        hr_user_id
                    )
                }
            },
            {"_id": 1},
        )
    )

    if not owned_jobs:
        return _empty_hr_analytics()

    owned_job_ids = {
        str(job["_id"])
        for job in owned_jobs
    }

    job_id_variants = []

    for job_id in owned_job_ids:
        job_id_variants.extend(
            _id_variants(job_id)
        )

    # -----------------------------------------------------
    # FETCH APPLICATIONS
    # -----------------------------------------------------

    applications = list(
        db["applications"].find({
            "job_id": {
                "$in": job_id_variants
            },
            "status": {
                "$ne": "Withdrawn"
            },
        })
    )

    if not applications:
        return _empty_hr_analytics()

    authorized_resume_ids = set()
    authorized_candidate_ids = set()

    # -----------------------------------------------------
    # VERIFY RESUME OWNERSHIP
    # -----------------------------------------------------

    for application in applications:

        resume_id = application.get(
            "resume_id"
        )

        candidate_id = application.get(
            "user_id"
        )

        if not resume_id or not candidate_id:
            continue

        if not ObjectId.is_valid(
            str(resume_id)
        ):
            continue

        if not ObjectId.is_valid(
            str(candidate_id)
        ):
            continue

        resume = db["resumes"].find_one({
            "_id": ObjectId(str(resume_id)),
            "user_id": {
                "$in": _id_variants(
                    candidate_id
                )
            },
        })

        if not resume:
            continue

        authorized_resume_ids.add(
            str(resume["_id"])
        )

        authorized_candidate_ids.add(
            str(candidate_id)
        )

    if not authorized_resume_ids:
        return _empty_hr_analytics()

    # -----------------------------------------------------
    # RESUME STATISTICS
    # -----------------------------------------------------

    resume_object_ids = [
        ObjectId(resume_id)
        for resume_id in authorized_resume_ids
    ]

    resumes = list(
        db["resumes"].find({
            "_id": {
                "$in": resume_object_ids
            }
        })
    )

    total_candidates = len(
        authorized_candidate_ids
    )

    total_resumes = len(resumes)

    parsed_resumes = sum(
        1
        for resume in resumes
        if resume.get("parsed")
    )

    # -----------------------------------------------------
    # AUTHORIZED APPLICATION RELATIONSHIPS
    # -----------------------------------------------------

    authorized_pairs = set()

    for application in applications:

        job_id = str(
            application.get("job_id", "")
        )

        resume_id = str(
            application.get("resume_id", "")
        )

        candidate_id = str(
            application.get("user_id", "")
        )

        if (
            job_id in owned_job_ids
            and resume_id in authorized_resume_ids
            and candidate_id in authorized_candidate_ids
        ):
            authorized_pairs.add((
                job_id,
                resume_id,
                candidate_id,
            ))

    # -----------------------------------------------------
    # SCREENING STATISTICS
    # -----------------------------------------------------

    screenings = []

    screening_cursor = (
        db["screenings"]
        .find({
            "job_id": {
                "$in": job_id_variants
            }
        })
        .sort("created_at", -1)
    )

    for screening in screening_cursor:

        screening_pair = (
            str(screening.get("job_id", "")),
            str(screening.get("resume_id", "")),
            str(screening.get("user_id", "")),
        )

        if screening_pair in authorized_pairs:
            screenings.append(screening)

    total_screenings = len(screenings)

    ats_scores = _collect_scores(
        screenings,
        "ats_score",
    )

    matching_scores = _collect_scores(
        screenings,
        "matching_percentage",
    )

    average_ats = _average(
        ats_scores
    )

    average_matching = _average(
        matching_scores
    )

    matched_skill_frequency = _skill_frequency(
        screenings,
        "matched_skills",
    )

    missing_skill_frequency = _skill_frequency(
        screenings,
        "missing_skills",
    )

    top_matched_skills = _top_skills(
        matched_skill_frequency
    )

    top_missing_skills = _top_skills(
        missing_skill_frequency
    )

    ats_ranges = _get_ats_distribution(
        ats_scores
    )

    recent_screenings = _get_recent_screenings(
        db=db,
        screenings=screenings,
        limit=10,
    )

    # -----------------------------------------------------
    # HR EVALUATION STATISTICS
    # -----------------------------------------------------

    # Candidate interview results must only be
    # exposed to an HR when the corresponding
    # recruitment relationship is authorized.
    #
    # Until that linkage is implemented and
    # verified, return zero for these metrics.

    total_evaluations = 0
    average_interview_score = 0.0

    # -----------------------------------------------------
    # GENERATE ANALYTICS INSIGHTS
    # -----------------------------------------------------

    strongest_skill = (
        top_matched_skills[0]["skill"]
        if top_matched_skills
        else None
    )

    biggest_skill_gap = (
        top_missing_skills[0]["skill"]
        if top_missing_skills
        else None
    )

    insights = []

    if total_screenings:
        insights.append(
            f"{total_screenings} AI screening"
            f"{'s' if total_screenings != 1 else ''} "
            "completed across your recruitment pipeline."
        )

    if average_ats:
        insights.append(
            f"Average ATS compatibility is "
            f"{average_ats}%."
        )

    if strongest_skill:
        insights.append(
            f"{strongest_skill} appears most frequently "
            "among matched candidate skills."
        )

    if biggest_skill_gap:
        insights.append(
            f"{biggest_skill_gap} is the most frequently "
            "missing skill in screened candidates."
        )

    # -----------------------------------------------------
    # RETURN HR DASHBOARD DATA
    # -----------------------------------------------------

    return {
        "total_candidates": total_candidates,
        "total_resumes": total_resumes,
        "parsed_resumes": parsed_resumes,
        "total_screenings": total_screenings,

        "average_ats": average_ats,
        "average_matching": average_matching,

        "total_evaluations": total_evaluations,
        "average_interview_score": average_interview_score,

        "shortlisted_count": None,
        "shortlist_tracking_available": False,

        "ats_distribution": ats_ranges,

        "top_matched_skills": top_matched_skills,
        "top_missing_skills": top_missing_skills,

        "recent_screenings": recent_screenings,
        "ai_insights": insights,
    }

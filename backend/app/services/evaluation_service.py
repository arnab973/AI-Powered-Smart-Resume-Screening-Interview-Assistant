
import logging
import sys

from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from app.database.mongodb import get_database


# =========================================================
# AI ENGINE PATH
# =========================================================

CURRENT_FILE = Path(__file__).resolve()
PROJECT_ROOT = CURRENT_FILE.parents[3]
AI_ENGINE_PATH = PROJECT_ROOT / "ai-engine"

if str(AI_ENGINE_PATH) not in sys.path:
    sys.path.insert(0, str(AI_ENGINE_PATH))


from evaluation_engine.answer_evaluator import evaluate_answer
from evaluation_engine.feedback_generator import generate_feedback


# =========================================================
# CONFIGURATION
# =========================================================

logger = logging.getLogger(__name__)

EVALUATIONS_COLLECTION = "evaluations"
INTERVIEWS_COLLECTION = "interviews"
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


def _id_variants(value: str) -> list:
    object_id = ObjectId(str(value))

    return [
        object_id,
        str(object_id),
    ]


def _owner_filter(user_id: str) -> dict:
    user_object_id = _validate_object_id(
        user_id,
        "user_id",
    )

    return {
        "user_id": {
            "$in": _id_variants(str(user_object_id))
        }
    }


def _serialize_document(
    document: dict[str, Any],
) -> dict[str, Any]:

    result = {}

    for key, value in document.items():
        if key == "_id":
            result["id"] = str(value)

        elif isinstance(value, ObjectId):
            result[key] = str(value)

        else:
            result[key] = value

    return result


# =========================================================
# CANDIDATE VALIDATION
# =========================================================

def _require_candidate_user(
    db,
    user_id: str,
) -> dict:

    user_object_id = _validate_object_id(
        user_id,
        "user_id",
    )

    user = db[USERS_COLLECTION].find_one({
        "_id": user_object_id,
    })

    if not user:
        raise ValueError("User not found.")

    role = str(
        user.get("role", "")
    ).strip().lower()

    if role != "candidate":
        raise PermissionError(
            "Only candidates can create evaluations."
        )

    return user


# =========================================================
# AI RESPONSE VALIDATION
# =========================================================

def _require_dict(
    value: Any,
    source_name: str,
) -> dict:

    if not isinstance(value, dict):
        raise RuntimeError(
            f"{source_name} returned an invalid response."
        )

    return value


def _require_fields(
    data: dict,
    required_fields: tuple[str, ...],
    source_name: str,
):

    missing_fields = [
        field
        for field in required_fields
        if field not in data or data[field] is None
    ]

    if missing_fields:
        logger.error(
            "%s missing fields: %s",
            source_name,
            ", ".join(missing_fields),
        )

        raise RuntimeError(
            f"{source_name} returned incomplete data."
        )


# =========================================================
# INTERVIEW QUESTION HELPERS
# =========================================================

def _get_interview_question(
    db,
    user_id: str,
    interview_id: str,
    question_number: int,
) -> dict:
    """
    Verify interview ownership and retrieve
    the original generated question.
    """

    interview_object_id = _validate_object_id(
        interview_id,
        "interview_id",
    )

    if (
        isinstance(question_number, bool)
        or not isinstance(question_number, int)
        or question_number < 1
    ):
        raise ValueError(
            "Invalid question_number."
        )

    interview = db[INTERVIEWS_COLLECTION].find_one({
        "_id": interview_object_id,
        **_owner_filter(user_id),
    })

    if not interview:
        raise ValueError(
            "Interview not found."
        )

    questions = interview.get("questions")

    if not isinstance(questions, list) or not questions:
        questions = []

        for key in (
            "technical_questions",
            "skill_gap_questions",
            "hr_questions",
        ):
            items = interview.get(key, [])

            if isinstance(items, list):
                questions.extend(items)

    for index, item in enumerate(questions, start=1):
        if not isinstance(item, dict):
            continue

        stored_number = item.get(
            "question_number",
            index,
        )

        if stored_number == question_number:
            question_text = item.get("question")

            if (
                not isinstance(question_text, str)
                or not question_text.strip()
            ):
                raise ValueError(
                    "Interview question is invalid."
                )

            return {
                "interview_id": str(interview_object_id),
                "question_number": question_number,
                "question": question_text.strip(),
                "skill": item.get("skill"),
            }

    raise ValueError(
        "Question not found in interview."
    )


def _check_duplicate_evaluation(
    db,
    user_id: str,
    interview_id: str,
    question_number: int,
):
    """
    Reject an already evaluated interview question.
    """

    existing = db[EVALUATIONS_COLLECTION].find_one({
        **_owner_filter(user_id),
        "interview_id": {
            "$in": _id_variants(interview_id)
        },
        "question_number": question_number,
    })

    if existing:
        raise ValueError(
            "This interview question has already "
            "been evaluated."
        )


# =========================================================
# CREATE EVALUATION
# =========================================================

def create_evaluation(
    user_id: str,
    question: str | None = None,
    answer: str = "",
    skill: str | None = None,
    interview_id: str | None = None,
    question_number: int | None = None,
) -> dict[str, Any]:
    """
    Evaluate a standalone or interview-linked answer.

    For linked evaluations, question and skill
    are taken from the saved interview.
    """

    db = _get_db()

    user_object_id = _validate_object_id(
        user_id,
        "user_id",
    )

    normalized_user_id = str(user_object_id)

    _require_candidate_user(
        db=db,
        user_id=normalized_user_id,
    )

    # -----------------------------------------------------
    # VALIDATE ANSWER
    # -----------------------------------------------------

    if not isinstance(answer, str) or not answer.strip():
        raise ValueError(
            "Candidate answer is required."
        )

    answer = answer.strip()

    linked = interview_id is not None

    if linked != (question_number is not None):
        raise ValueError(
            "interview_id and question_number "
            "must be provided together."
        )

    # -----------------------------------------------------
    # RESOLVE QUESTION
    # -----------------------------------------------------

    if linked:
        saved_question = _get_interview_question(
            db=db,
            user_id=normalized_user_id,
            interview_id=interview_id,
            question_number=question_number,
        )

        interview_id = saved_question["interview_id"]
        question_number = saved_question["question_number"]

        # Trust the saved interview, not user-supplied text.
        question = saved_question["question"]
        skill = saved_question["skill"]

        _check_duplicate_evaluation(
            db=db,
            user_id=normalized_user_id,
            interview_id=interview_id,
            question_number=question_number,
        )

    else:
        if (
            not isinstance(question, str)
            or not question.strip()
        ):
            raise ValueError(
                "Interview question is required."
            )

        question = question.strip()

        if skill is not None:
            if not isinstance(skill, str):
                raise ValueError(
                    "Skill must be a string."
                )

            skill = skill.strip() or None

    if skill is not None and not isinstance(skill, str):
        skill = None

    # -----------------------------------------------------
    # AI ANSWER EVALUATION
    # -----------------------------------------------------

    evaluation = evaluate_answer(
        question=question,
        answer=answer,
        skill=skill,
    )

    evaluation = _require_dict(
        evaluation,
        "Evaluation engine",
    )

    _require_fields(
        evaluation,
        (
            "technical_score",
            "relevance_score",
            "clarity_score",
            "completeness_score",
            "overall_score",
            "performance_level",
            "feedback",
            "improvement",
            "strengths",
            "weaknesses",
        ),
        "Evaluation engine",
    )

    # -----------------------------------------------------
    # AI FEEDBACK GENERATION
    # -----------------------------------------------------

    feedback = generate_feedback(
        question=question,
        answer=answer,
        evaluation=evaluation,
    )

    feedback = _require_dict(
        feedback,
        "Feedback engine",
    )

    _require_fields(
        feedback,
        (
            "summary",
            "improvement_plan",
            "interview_tip",
        ),
        "Feedback engine",
    )

    # -----------------------------------------------------
    # SAVE EVALUATION
    # -----------------------------------------------------

    now = datetime.now(timezone.utc)

    evaluation_document = {
        "user_id": user_object_id,

        "interview_id": interview_id,
        "question_number": question_number,

        "question": question,
        "answer": answer,
        "skill": skill,

        "technical_score": evaluation["technical_score"],
        "relevance_score": evaluation["relevance_score"],
        "clarity_score": evaluation["clarity_score"],
        "completeness_score": evaluation["completeness_score"],

        "overall_score": evaluation["overall_score"],
        "performance_level": evaluation["performance_level"],

        "feedback": evaluation["feedback"],
        "improvement": evaluation["improvement"],

        "strengths": evaluation["strengths"],
        "weaknesses": evaluation["weaknesses"],

        "summary": feedback["summary"],
        "improvement_plan": feedback["improvement_plan"],
        "interview_tip": feedback["interview_tip"],

        "metadata": {
            "evaluation_engine": "openai",
            "feedback_engine": "openai",
        },

        "created_at": now,
        "updated_at": now,
    }

    try:
        result = db[EVALUATIONS_COLLECTION].insert_one(
            evaluation_document
        )

    except DuplicateKeyError as error:
        raise ValueError(
            "This interview question has already "
            "been evaluated."
        ) from error

    saved_document = db[EVALUATIONS_COLLECTION].find_one({
        "_id": result.inserted_id,
        **_owner_filter(normalized_user_id),
    })

    if not saved_document:
        raise RuntimeError(
            "Failed to retrieve saved evaluation."
        )

    logger.info(
        "Evaluation created: %s",
        result.inserted_id,
    )

    return _serialize_document(saved_document)


# =========================================================
# GET EVALUATION BY ID
# =========================================================

def get_evaluation_by_id(
    evaluation_id: str,
    user_id: str,
) -> dict[str, Any]:

    evaluation_object_id = _validate_object_id(
        evaluation_id,
        "evaluation_id",
    )

    db = _get_db()

    document = db[EVALUATIONS_COLLECTION].find_one({
        "_id": evaluation_object_id,
        **_owner_filter(user_id),
    })

    if not document:
        raise ValueError(
            "Evaluation not found."
        )

    return _serialize_document(document)


# =========================================================
# GET USER EVALUATIONS
# =========================================================

def get_user_evaluations(
    user_id: str,
) -> list[dict[str, Any]]:

    db = _get_db()

    documents = (
        db[EVALUATIONS_COLLECTION]
        .find(_owner_filter(user_id))
        .sort("_id", -1)
    )

    return [
        _serialize_document(document)
        for document in documents
    ]

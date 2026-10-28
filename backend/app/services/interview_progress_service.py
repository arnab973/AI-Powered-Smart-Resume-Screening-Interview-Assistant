
import logging
from datetime import datetime, timezone

from bson import ObjectId

from app.database.mongodb import get_database


logger = logging.getLogger(__name__)


def update_interview_progress(
    interview_id: str,
    user_id: str,
) -> dict:
    """
    Recalculate interview progress from saved evaluations.

    Counts unique, valid question numbers belonging
    to the interview.

    Updates the interview document in MongoDB.
    """

    db = get_database()

    if db is None:
        raise RuntimeError(
            "Database connection is not available."
        )

    if not ObjectId.is_valid(str(interview_id)):
        raise ValueError("Invalid interview_id.")

    if not ObjectId.is_valid(str(user_id)):
        raise ValueError("Invalid user_id.")

    interview_object_id = ObjectId(str(interview_id))
    user_object_id = ObjectId(str(user_id))

    interviews = db["interviews"]
    evaluations = db["evaluations"]

    # -----------------------------------------------------
    # FIND INTERVIEW AND VERIFY OWNERSHIP
    # -----------------------------------------------------

    interview_filter = {
        "_id": interview_object_id,
        "user_id": {
            "$in": [
                str(user_object_id),
                user_object_id,
            ]
        },
    }

    interview = interviews.find_one(interview_filter)

    if interview is None:
        raise ValueError("Interview not found.")

    # -----------------------------------------------------
    # GET VALID QUESTION NUMBERS
    # -----------------------------------------------------

    questions = interview.get("questions", [])

    valid_question_numbers = {
        question.get("question_number")
        for question in questions
        if isinstance(question, dict)
        and isinstance(question.get("question_number"), int)
        and not isinstance(
            question.get("question_number"), bool
        )
    }

    total_questions = len(valid_question_numbers)

    # -----------------------------------------------------
    # FETCH SAVED EVALUATIONS
    # -----------------------------------------------------

    cursor = evaluations.find(
        {
            "user_id": {
                "$in": [
                    str(user_object_id),
                    user_object_id,
                ]
            },
            "interview_id": {
                "$in": [
                    str(interview_object_id),
                    interview_object_id,
                ]
            },
        },
        {
            "question_number": 1,
        },
    )

    answered_numbers = set()

    for evaluation in cursor:
        question_number = evaluation.get(
            "question_number"
        )

        if question_number in valid_question_numbers:
            answered_numbers.add(question_number)

    answered_questions = len(answered_numbers)

    # -----------------------------------------------------
    # CALCULATE COMPLETION
    # -----------------------------------------------------

    completion_percentage = (
        round(
            answered_questions / total_questions * 100,
            2,
        )
        if total_questions > 0
        else 0.0
    )

    is_completed = (
        total_questions > 0
        and answered_questions == total_questions
    )

    if is_completed:
        interview_status = "completed"

    elif answered_questions > 0:
        interview_status = "in_progress"

    else:
        interview_status = "not_started"

    # -----------------------------------------------------
    # UPDATE MONGODB
    # -----------------------------------------------------

    now = datetime.now(timezone.utc)

    update_fields = {
        "total_questions": total_questions,
        "answered_questions": answered_questions,
        "completion_percentage": completion_percentage,
        "is_completed": is_completed,
        "status": interview_status,
        "updated_at": now,
    }

    if is_completed:
        # Preserve the original completion timestamp.
        update_fields["completed_at"] = (
            interview.get("completed_at") or now
        )
    else:
        update_fields["completed_at"] = None

    result = interviews.update_one(
        interview_filter,
        {
            "$set": update_fields,
        },
    )

    if result.matched_count != 1:
        raise RuntimeError(
            "Interview progress could not be updated."
        )

    logger.info(
        "Interview progress updated | interview=%s "
        "answered=%s total=%s status=%s",
        interview_id,
        answered_questions,
        total_questions,
        interview_status,
    )

    return {
        "interview_id": str(interview_object_id),
        "total_questions": total_questions,
        "answered_questions": answered_questions,
        "completion_percentage": completion_percentage,
        "is_completed": is_completed,
        "status": interview_status,
        "completed_at": (
            update_fields["completed_at"].isoformat()
            if update_fields["completed_at"]
            else None
        ),
    }

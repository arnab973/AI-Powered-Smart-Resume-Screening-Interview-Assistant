
import logging

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.middleware.auth_middleware import require_candidate

from app.schemas.evaluation_schema import (
    EvaluationRequestSchema,
    EvaluationResponseSchema,
)

from app.services.evaluation_service import (
    create_evaluation,
    get_evaluation_by_id,
    get_user_evaluations,
)

from app.services.interview_progress_service import (
    update_interview_progress,
)


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/evaluation",
    tags=["Evaluation"],
)


# =========================================================
# ERROR HANDLING
# =========================================================

def _handle_value_error(error: ValueError):
    message = str(error)

    if message.startswith("Invalid "):
        code = status.HTTP_400_BAD_REQUEST

    elif message in {
        "Evaluation not found.",
        "Interview not found.",
        "Question not found in interview.",
        "User not found.",
    }:
        code = status.HTTP_404_NOT_FOUND

    elif "already been evaluated" in message:
        code = status.HTTP_409_CONFLICT

    else:
        code = status.HTTP_400_BAD_REQUEST

    raise HTTPException(
        status_code=code,
        detail=message,
    ) from error


# =========================================================
# CREATE EVALUATION
# =========================================================

@router.post(
    "",
    response_model=EvaluationResponseSchema,
    status_code=status.HTTP_201_CREATED,
)
def create_answer_evaluation(
    evaluation_data: EvaluationRequestSchema,
    current_user: dict = Depends(require_candidate),
):
    """
    Evaluate a standalone or interview-linked answer.

    After successful linked evaluation, synchronize
    the interview progress in MongoDB.
    """

    user_id = str(current_user["_id"])

    try:
        evaluation = create_evaluation(
            user_id=user_id,
            question=evaluation_data.question,
            answer=evaluation_data.answer,
            skill=evaluation_data.skill,
            interview_id=evaluation_data.interview_id,
            question_number=evaluation_data.question_number,
        )

    except ValueError as error:
        _handle_value_error(error)

    except PermissionError as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(error),
        ) from error

    except Exception:
        logger.exception(
            "AI evaluation failed."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Evaluation failed.",
        )

    # -----------------------------------------------------
    # SYNCHRONIZE INTERVIEW PROGRESS
    # -----------------------------------------------------

    if evaluation_data.interview_id is not None:
        try:
            progress = update_interview_progress(
                interview_id=evaluation_data.interview_id,
                user_id=user_id,
            )

            logger.info(
                "Interview progress synchronized: %s",
                progress,
            )

        except Exception:
            # Evaluation is already saved.
            # Do not return a misleading evaluation failure.
            logger.exception(
                "Evaluation saved, but interview progress "
                "synchronization failed. "
                "interview_id=%s",
                evaluation_data.interview_id,
            )

    return evaluation


# =========================================================
# GET MY EVALUATIONS
# =========================================================

@router.get(
    "",
    response_model=list[EvaluationResponseSchema],
)
def get_my_evaluations(
    current_user: dict = Depends(require_candidate),
):
    try:
        return get_user_evaluations(
            user_id=str(current_user["_id"]),
        )

    except ValueError as error:
        _handle_value_error(error)

    except Exception:
        logger.exception(
            "Failed to retrieve evaluations."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve evaluations.",
        )


# =========================================================
# GET EVALUATION BY ID
# =========================================================

@router.get(
    "/{evaluation_id}",
    response_model=EvaluationResponseSchema,
)
def get_evaluation(
    evaluation_id: str,
    current_user: dict = Depends(require_candidate),
):
    try:
        return get_evaluation_by_id(
            evaluation_id=evaluation_id,
            user_id=str(current_user["_id"]),
        )

    except ValueError as error:
        _handle_value_error(error)

    except Exception:
        logger.exception(
            "Failed to retrieve evaluation."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve evaluation.",
        )

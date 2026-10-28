
import logging

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.middleware.auth_middleware import (
    require_candidate,
)

from app.schemas.interview_schema import (
    InterviewRequestSchema,
    InterviewResponseSchema,
)

from app.services.interview_service import (
    create_ai_interview,
    get_interview_by_id,
    get_user_interviews,
)


# =========================================================
# CONFIGURATION
# =========================================================

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/interview",
    tags=["Interview"],
)


# =========================================================
# ERROR HANDLING
# =========================================================

def _handle_value_error(error: ValueError):
    """
    Convert expected interview errors
    into appropriate HTTP responses.
    """

    message = str(error)

    if message.startswith("Invalid "):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        ) from error

    if message in {
        "Interview not found.",
        "Interview result not found.",
        "Resume not found.",
        "Job not found.",
    }:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=message,
        ) from error

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=message,
    ) from error


# =========================================================
# CREATE AI INTERVIEW - CANDIDATE ONLY
# =========================================================

@router.post(
    "",
    response_model=InterviewResponseSchema,
    status_code=status.HTTP_201_CREATED,
)
def create_interview(
    interview_data: InterviewRequestSchema,
    current_user: dict = Depends(require_candidate),
):
    """
    Generate an AI-powered interview.

    Access:
        Candidate only.

    The service must verify that the
    requested resume belongs to the
    authenticated Candidate.
    """

    try:
        return create_ai_interview(
            user_id=str(current_user["_id"]),
            resume_id=interview_data.resume_id,
            job_id=interview_data.job_id,
            technical_question_count=(
                interview_data.technical_question_count
            ),
            skill_gap_question_count=(
                interview_data.skill_gap_question_count
            ),
            hr_question_count=(
                interview_data.hr_question_count
            ),
        )

    except ValueError as error:
        _handle_value_error(error)

    except PermissionError as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(error),
        ) from error

    except RuntimeError:
        logger.exception(
            "AI interview generation service error."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Interview generation failed.",
        )

    except Exception:
        logger.exception(
            "Unexpected AI interview generation error."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Interview generation failed.",
        )


# =========================================================
# GET MY INTERVIEWS - CANDIDATE ONLY
# =========================================================

@router.get(
    "",
    response_model=list[InterviewResponseSchema],
)
def get_my_interviews(
    current_user: dict = Depends(require_candidate),
):
    """
    Retrieve interviews belonging to the
    authenticated Candidate.

    Access:
        Candidate only.
    """

    try:
        return get_user_interviews(
            user_id=str(current_user["_id"]),
        )

    except ValueError as error:
        _handle_value_error(error)

    except RuntimeError:
        logger.exception(
            "Failed to retrieve Candidate interviews."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve interviews.",
        )

    except Exception:
        logger.exception(
            "Unexpected interview list error."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve interviews.",
        )


# =========================================================
# GET INTERVIEW BY ID - CANDIDATE ONLY
# =========================================================

@router.get(
    "/{interview_id}",
    response_model=InterviewResponseSchema,
)
def get_interview(
    interview_id: str,
    current_user: dict = Depends(require_candidate),
):
    """
    Retrieve one interview belonging to
    the authenticated Candidate.

    Access:
        Candidate only.

    Ownership must also be enforced in
    interview_service.py.
    """

    try:
        return get_interview_by_id(
            interview_id=interview_id,
            user_id=str(current_user["_id"]),
        )

    except ValueError as error:
        _handle_value_error(error)

    except PermissionError as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(error),
        ) from error

    except RuntimeError:
        logger.exception(
            "Failed to retrieve interview."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve interview.",
        )

    except Exception:
        logger.exception(
            "Unexpected interview retrieval error."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve interview.",
        )

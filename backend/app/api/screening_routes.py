
import logging

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.middleware.auth_middleware import (
    require_roles,
)

from app.schemas.screening_schema import (
    ScreeningRequestSchema,
    ScreeningResponseSchema,
)

from app.services.screening_service import (
    create_screening,
    get_screening_by_id,
    get_user_screenings,
)


# =========================================================
# CONFIGURATION
# =========================================================

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/screening",
    tags=["Screening"],
)


# =========================================================
# ROLE-BASED ACCESS
# =========================================================

screening_access = require_roles(
    "candidate",
    "hr",
    "recruiter",
)


# =========================================================
# ERROR HANDLING
# =========================================================

def _handle_value_error(error: ValueError):
    """
    Convert expected screening service errors
    into appropriate HTTP responses.
    """

    message = str(error)

    if message.startswith("Invalid "):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        ) from error

    if message in {
        "Resume not found.",
        "Job not found.",
        "Screening result not found.",
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
# CREATE AI SCREENING
# =========================================================

@router.post(
    "",
    response_model=ScreeningResponseSchema,
    status_code=status.HTTP_201_CREATED,
)
def run_screening(
    screening_data: ScreeningRequestSchema,
    current_user: dict = Depends(screening_access),
):
    """
    Run AI-powered resume screening.

    Access:
        Candidate, HR and Recruiter.

    Security:
        The service verifies:
        - Current user's database role.
        - Candidate resume ownership.
        - HR/Recruiter job ownership.
        - Active application for HR screening.
        - Resume/application Candidate match.
    """

    try:
        return create_screening(
            user_id=str(current_user["_id"]),
            resume_id=screening_data.resume_id,
            job_id=screening_data.job_id,
            user_role=str(
                current_user["role"]
            ).strip().lower(),
        )

    except ValueError as error:
        _handle_value_error(error)

    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You are not authorized to "
                "screen this resume for this job."
            ),
        )

    except RuntimeError:
        logger.exception(
            "Screening service error."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to complete screening.",
        )

    except Exception:
        logger.exception(
            "Unexpected screening creation error."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Screening failed.",
        )


# =========================================================
# GET CURRENT USER SCREENINGS
# =========================================================

@router.get(
    "",
    response_model=list[ScreeningResponseSchema],
)
def get_my_screenings(
    current_user: dict = Depends(screening_access),
):
    """
    Retrieve screenings accessible to the
    authenticated user.

    Candidate:
        Screenings associated with their resumes.

    HR/Recruiter:
        Screenings for owned jobs with
        verified active applications.
    """

    try:
        return get_user_screenings(
            user_id=str(current_user["_id"]),
            user_role=str(
                current_user["role"]
            ).strip().lower(),
        )

    except ValueError as error:
        _handle_value_error(error)

    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You are not authorized to "
                "access these screenings."
            ),
        )

    except RuntimeError:
        logger.exception(
            "Failed to retrieve user screenings."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve screenings.",
        )

    except Exception:
        logger.exception(
            "Unexpected screening list error."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve screenings.",
        )


# =========================================================
# GET SCREENING BY ID
# =========================================================

@router.get(
    "/{screening_id}",
    response_model=ScreeningResponseSchema,
)
def get_screening(
    screening_id: str,
    current_user: dict = Depends(screening_access),
):
    """
    Retrieve a screening by ID.

    Candidate:
        May view screenings for their own resumes.

    HR/Recruiter:
        May view screenings for their owned jobs
        when the application remains active.

    Unauthorized screening IDs are treated
    as not found to avoid exposing their existence.
    """

    try:
        return get_screening_by_id(
            screening_id=screening_id,
            user_id=str(current_user["_id"]),
            user_role=str(
                current_user["role"]
            ).strip().lower(),
        )

    except ValueError as error:
        _handle_value_error(error)

    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You are not authorized to "
                "access this screening."
            ),
        )

    except RuntimeError:
        logger.exception(
            "Failed to retrieve screening."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve screening.",
        )

    except Exception:
        logger.exception(
            "Unexpected screening retrieval error."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve screening.",
        )

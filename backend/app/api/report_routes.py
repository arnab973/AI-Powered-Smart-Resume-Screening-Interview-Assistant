
import logging

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.middleware.auth_middleware import (
    require_candidate,
    require_hr,
)

from app.schemas.report_schema import (
    ReportCreateRequestSchema,
    ReportResponseSchema,
)

from app.services.report_service import (
    create_performance_report,
    get_report_by_id,
    get_user_reports,
    get_hr_analytics,
)


# =========================================================
# CONFIGURATION
# =========================================================

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/report",
    tags=["Report"],
)


# =========================================================
# ERROR HANDLING
# =========================================================

def _handle_value_error(error: ValueError):
    """
    Convert expected service errors into
    appropriate HTTP responses.
    """

    message = str(error)

    if message.startswith("Invalid "):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        ) from error

    if message in {
        "Report not found.",
        "Performance report not found.",
        "Interview not found.",
        "User not found.",
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
# CREATE CANDIDATE PERFORMANCE REPORT
# =========================================================

@router.post(
    "",
    response_model=ReportResponseSchema,
    status_code=status.HTTP_201_CREATED,
)
def create_report(
    report_data: ReportCreateRequestSchema | None = None,
    current_user: dict = Depends(require_candidate),
):
    """
    Generate a candidate performance report.

    If interview_id is provided:
        Generate report for the selected interview.

    Otherwise:
        Generate a legacy candidate-wide report.

    Access:
        Candidate only.
    """

    try:
        interview_id = (
            report_data.interview_id
            if report_data is not None
            else None
        )

        return create_performance_report(
            user_id=str(current_user["_id"]),
            interview_id=interview_id,
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
            "Performance report generation failed."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to generate performance report.",
        )

    except Exception:
        logger.exception(
            "Unexpected performance report generation error."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Report generation failed.",
        )


# =========================================================
# GET MY REPORTS
# =========================================================

@router.get(
    "",
    response_model=list[ReportResponseSchema],
)
def get_my_reports(
    current_user: dict = Depends(require_candidate),
):
    """
    Retrieve reports belonging to
    the authenticated candidate.
    """

    try:
        return get_user_reports(
            user_id=str(current_user["_id"]),
        )

    except ValueError as error:
        _handle_value_error(error)

    except RuntimeError:
        logger.exception(
            "Failed to retrieve candidate reports."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve reports.",
        )

    except Exception:
        logger.exception(
            "Unexpected candidate report retrieval error."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve reports.",
        )


# =========================================================
# GET HR RECRUITMENT ANALYTICS
# =========================================================

@router.get(
    "/hr-analytics",
)
def get_hr_analytics_route(
    current_user: dict = Depends(require_hr),
):
    """
    Retrieve recruitment analytics scoped
    to the authenticated HR user's jobs.

    Access:
        HR / Recruiter only.
    """

    try:
        return get_hr_analytics(
            hr_user_id=str(current_user["_id"]),
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
            "HR analytics service error."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve HR analytics.",
        )

    except Exception:
        logger.exception(
            "Unexpected HR analytics error."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve HR analytics.",
        )


# =========================================================
# GET REPORT BY ID
# =========================================================

@router.get(
    "/{report_id}",
    response_model=ReportResponseSchema,
)
def get_report(
    report_id: str,
    current_user: dict = Depends(require_candidate),
):
    """
    Retrieve a specific candidate report.

    Security:
        Service validates report ownership.
    """

    try:
        return get_report_by_id(
            report_id=report_id,
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
            "Failed to retrieve performance report."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve report.",
        )

    except Exception:
        logger.exception(
            "Unexpected performance report retrieval error."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve report.",
        )

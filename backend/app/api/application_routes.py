
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

from app.schemas.application_schema import (
    CreateApplicationRequest,
    UpdateApplicationStatusRequest,
)

from app.services.application_service import (
    create_application,
    get_application_by_id,
    get_job_applications,
    get_my_applications,
    update_application_status,
    withdraw_application,
)


# =========================================================
# CONFIGURATION
# =========================================================

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/applications",
    tags=["Applications"],
)


# =========================================================
# AUTHENTICATED USER HELPER
# =========================================================

def _get_user_id(
    current_user: dict,
) -> str:
    """
    Get the authenticated user's MongoDB ID.

    Never accept user_id or hr_user_id
    from the client request body.
    """

    user_id = current_user.get("_id")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user ID is missing.",
        )

    return str(user_id)


# =========================================================
# ERROR HANDLING
# =========================================================

def _handle_value_error(
    error: ValueError,
):
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
        "Application not found.",
        "Job not found.",
        "User not found.",
        "Resume not found.",
        "Resume not found or does not belong to this user.",
    }:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=message,
        ) from error

    if message == "You have already applied for this job.":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=message,
        ) from error

    if (
        "status has changed" in message.lower()
        or "already withdrawn" in message.lower()
        or "cannot be updated" in message.lower()
        or "cannot be withdrawn" in message.lower()
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=message,
        ) from error

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=message,
    ) from error


def _handle_permission_error():
    """
    Return a generic authorization error
    without exposing internal resource details.
    """

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=(
            "You are not authorized to "
            "perform this application operation."
        ),
    )


def _handle_server_error(
    operation: str,
):
    """
    Log full error details on the backend,
    but return a safe message to the client.
    """

    logger.exception(
        "Application operation failed: %s",
        operation,
    )

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Application operation failed.",
    )


# =========================================================
# APPLY FOR JOB - CANDIDATE ONLY
# =========================================================

@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
)
def apply_for_job(
    application_data: CreateApplicationRequest,
    current_user: dict = Depends(require_candidate),
):
    """
    Submit an application for an available job.

    Access:
        Candidate only.

    Security:
        Resume ownership is verified by
        application_service.py.
    """

    user_id = _get_user_id(
        current_user
    )

    try:
        application = create_application(
            user_id=user_id,
            job_id=application_data.job_id,
            resume_id=application_data.resume_id,
            cover_letter=application_data.cover_letter,
        )

        return {
            "message": (
                "Application submitted successfully."
            ),
            "application": application,
        }

    except ValueError as error:
        _handle_value_error(error)

    except PermissionError:
        _handle_permission_error()

    except Exception:
        _handle_server_error(
            "create_application"
        )


# =========================================================
# GET MY APPLICATIONS - CANDIDATE ONLY
# =========================================================

@router.get(
    "/my-applications",
)
def my_applications(
    current_user: dict = Depends(require_candidate),
):
    """
    Retrieve all applications belonging
    to the authenticated Candidate.
    """

    user_id = _get_user_id(
        current_user
    )

    try:
        applications = get_my_applications(
            user_id=user_id,
        )

        return {
            "message": (
                "Applications retrieved successfully."
            ),
            "count": len(applications),
            "applications": applications,
        }

    except ValueError as error:
        _handle_value_error(error)

    except PermissionError:
        _handle_permission_error()

    except Exception:
        _handle_server_error(
            "get_my_applications"
        )


# =========================================================
# GET JOB APPLICATIONS - HR / RECRUITER ONLY
# =========================================================

@router.get(
    "/job/{job_id}",
)
def job_applications(
    job_id: str,
    current_user: dict = Depends(require_hr),
):
    """
    Retrieve applications for an HR-owned job.

    Access:
        HR and Recruiter only.

    The service verifies job ownership.
    """

    hr_user_id = _get_user_id(
        current_user
    )

    try:
        applications = get_job_applications(
            job_id=job_id,
            hr_user_id=hr_user_id,
        )

        return {
            "message": (
                "Job applications retrieved successfully."
            ),
            "count": len(applications),
            "applications": applications,
        }

    except ValueError as error:
        _handle_value_error(error)

    except PermissionError:
        _handle_permission_error()

    except Exception:
        _handle_server_error(
            "get_job_applications"
        )


# =========================================================
# UPDATE APPLICATION STATUS - HR / RECRUITER ONLY
# =========================================================

@router.patch(
    "/{application_id}/status",
)
def update_status(
    application_id: str,
    status_data: UpdateApplicationStatusRequest,
    current_user: dict = Depends(require_hr),
):
    """
    Update an application status.

    Access:
        HR and Recruiter only.

    Security:
        The application must belong to
        a job owned by the authenticated HR.
    """

    hr_user_id = _get_user_id(
        current_user
    )

    try:
        application = update_application_status(
            application_id=application_id,
            status=status_data.status,
            recruiter_note=status_data.recruiter_note,
            hr_user_id=hr_user_id,
        )

        return {
            "message": (
                "Application status updated successfully."
            ),
            "application": application,
        }

    except ValueError as error:
        _handle_value_error(error)

    except PermissionError:
        _handle_permission_error()

    except Exception:
        _handle_server_error(
            "update_application_status"
        )


# =========================================================
# WITHDRAW APPLICATION - CANDIDATE ONLY
# =========================================================

@router.patch(
    "/{application_id}/withdraw",
)
def withdraw(
    application_id: str,
    current_user: dict = Depends(require_candidate),
):
    """
    Withdraw an application belonging
    to the authenticated Candidate.

    Access:
        Candidate only.

    Hired, Rejected and already Withdrawn
    applications cannot be withdrawn.
    """

    user_id = _get_user_id(
        current_user
    )

    try:
        application = withdraw_application(
            user_id=user_id,
            application_id=application_id,
        )

        return {
            "message": (
                "Application withdrawn successfully."
            ),
            "application": application,
        }

    except ValueError as error:
        _handle_value_error(error)

    except PermissionError:
        _handle_permission_error()

    except Exception:
        _handle_server_error(
            "withdraw_application"
        )


# =========================================================
# GET APPLICATION BY ID - CANDIDATE ONLY
# =========================================================

@router.get(
    "/{application_id}",
)
def application_details(
    application_id: str,
    current_user: dict = Depends(require_candidate),
):
    """
    Retrieve one application belonging
    to the authenticated Candidate.

    Access:
        Candidate only.

    Another Candidate's application
    must not be accessible.
    """

    user_id = _get_user_id(
        current_user
    )

    try:
        application = get_application_by_id(
            user_id=user_id,
            application_id=application_id,
        )

        return {
            "message": (
                "Application retrieved successfully."
            ),
            "application": application,
        }

    except ValueError as error:
        _handle_value_error(error)

    except PermissionError:
        _handle_permission_error()

    except Exception:
        _handle_server_error(
            "get_application_by_id"
        )

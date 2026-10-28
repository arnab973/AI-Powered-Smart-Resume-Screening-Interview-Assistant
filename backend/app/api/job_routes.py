
import logging

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.database.mongodb import get_database

from app.middleware.auth_middleware import (
    require_candidate,
    require_hr,
)

from app.schemas.job_schema import (
    JobCreateSchema,
    JobResponseSchema,
)

from app.services.job_service import (
    create_job,
    delete_job,
    get_job_by_id,
    get_available_job_by_id,
    get_user_jobs,
    update_job,
)


logger = logging.getLogger(__name__)


# =========================================================
# JOB ROUTER
# =========================================================

router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"],
)


# =========================================================
# CREATE JOB - HR / RECRUITER ONLY
# =========================================================

@router.post(
    "",
    response_model=JobResponseSchema,
    status_code=status.HTTP_201_CREATED,
)
def create_job_route(
    job_data: JobCreateSchema,
    current_user: dict = Depends(require_hr),
):
    """
    Create a new job posting.

    Access:
        HR and Recruiter only.
    """

    try:
        return create_job(
            user_id=str(current_user["_id"]),
            title=job_data.title,
            company=job_data.company,
            description=job_data.description,
            required_skills=job_data.required_skills,
            preferred_skills=job_data.preferred_skills,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e

    except RuntimeError:
        logger.exception("Failed to create job.")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create job.",
        )


# =========================================================
# GET MY JOBS - HR / RECRUITER ONLY
# =========================================================

@router.get(
    "",
    response_model=list[JobResponseSchema],
)
def get_my_jobs(
    current_user: dict = Depends(require_hr),
):
    """
    Retrieve job postings created by the
    authenticated HR or Recruiter.

    Access:
        HR and Recruiter only.
    """

    try:
        return get_user_jobs(
            user_id=str(current_user["_id"]),
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e

    except RuntimeError:
        logger.exception("Failed to retrieve HR jobs.")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve jobs.",
        )


# =========================================================
# GET AVAILABLE JOBS - CANDIDATE ONLY
# =========================================================

@router.get(
    "/available",
    response_model=list[JobResponseSchema],
)
def get_available_jobs(
    current_user: dict = Depends(require_candidate),
):
    """
    Retrieve available job postings.

    Access:
        Candidate only.

    The current job model does not have a
    publication status field, so all stored
    jobs are treated as available.
    """

    try:
        db = get_database()

        if db is None:
            raise RuntimeError(
                "Database connection is not available."
            )

        jobs = list(
            db["jobs"]
            .find({})
            .sort("created_at", -1)
        )

        result = []

        for job in jobs:
            result.append({
                "id": str(job["_id"]),
                "user_id": str(
                    job.get("user_id", "")
                ),
                "title": job.get(
                    "title",
                    "Untitled Position",
                ),
                "company": job.get(
                    "company",
                    "Hiring Company",
                ),
                "description": job.get(
                    "description",
                    "",
                ),
                "required_skills": job.get(
                    "required_skills",
                    [],
                ),
                "preferred_skills": job.get(
                    "preferred_skills",
                    [],
                ),
                "created_at": job.get(
                    "created_at"
                ),
                "updated_at": job.get(
                    "updated_at"
                ),
            })

        return result

    except RuntimeError:
        logger.exception(
            "Database unavailable while fetching available jobs."
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Job service is temporarily unavailable.",
        )

    except Exception:
        logger.exception(
            "Failed to retrieve available jobs."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve available jobs.",
        )


# =========================================================
# GET AVAILABLE JOB DETAILS - CANDIDATE ONLY
# =========================================================

@router.get(
    "/available/{job_id}",
    response_model=JobResponseSchema,
)
def get_available_job_details(
    job_id: str,
    current_user: dict = Depends(require_candidate),
):
    """
    Retrieve details of an available job.

    Access:
        Candidate only.

    Candidates can view job details without
    being the owner of the job.

    This is a read-only endpoint.
    """

    try:
        return get_available_job_by_id(
            job_id=job_id,
        )

    except ValueError as e:
        if str(e) == "Invalid job ID.":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e),
            ) from e

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found.",
        ) from e

    except RuntimeError:
        logger.exception(
            "Failed to retrieve available job details."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve job details.",
        )


# =========================================================
# GET OWN JOB BY ID - HR / RECRUITER ONLY
# =========================================================

@router.get(
    "/{job_id}",
    response_model=JobResponseSchema,
)
def get_job(
    job_id: str,
    current_user: dict = Depends(require_hr),
):
    """
    Retrieve a job owned by the current HR/Recruiter.

    Access:
        HR and Recruiter only.

    Ownership is verified in get_job_by_id().
    """

    try:
        return get_job_by_id(
            job_id=job_id,
            user_id=str(current_user["_id"]),
        )

    except ValueError as e:
        if str(e) == "Invalid job ID.":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e),
            ) from e

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found.",
        ) from e

    except RuntimeError:
        logger.exception(
            "Failed to retrieve job."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve job.",
        )


# =========================================================
# UPDATE JOB - HR / RECRUITER ONLY
# =========================================================

@router.put(
    "/{job_id}",
    response_model=JobResponseSchema,
)
def update_job_route(
    job_id: str,
    job_data: JobCreateSchema,
    current_user: dict = Depends(require_hr),
):
    """
    Update a job owned by the current HR/Recruiter.

    Access:
        HR and Recruiter only.

    Ownership is enforced inside update_job().
    """

    try:
        return update_job(
            job_id=job_id,
            user_id=str(current_user["_id"]),
            title=job_data.title,
            company=job_data.company,
            description=job_data.description,
            required_skills=job_data.required_skills,
            preferred_skills=job_data.preferred_skills,
        )

    except ValueError as e:
        if str(e) == "Invalid job ID.":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e),
            ) from e

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found.",
        ) from e

    except RuntimeError:
        logger.exception(
            "Failed to update job."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update job.",
        )


# =========================================================
# DELETE JOB - HR / RECRUITER ONLY
# =========================================================

@router.delete(
    "/{job_id}",
)
def delete_job_route(
    job_id: str,
    current_user: dict = Depends(require_hr),
):
    """
    Delete a job owned by the current HR/Recruiter.

    Access:
        HR and Recruiter only.

    Ownership is enforced inside delete_job().
    """

    try:
        delete_job(
            job_id=job_id,
            user_id=str(current_user["_id"]),
        )

        return {
            "message": "Job deleted successfully.",
        }

    except ValueError as e:
        if str(e) == "Invalid job ID.":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e),
            ) from e

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found.",
        ) from e

    except RuntimeError:
        logger.exception(
            "Failed to delete job."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete job.",
        )

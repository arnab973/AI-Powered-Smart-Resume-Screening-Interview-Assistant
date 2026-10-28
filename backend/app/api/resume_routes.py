
import logging
import os
from pathlib import Path

from bson import ObjectId

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse

from app.database.mongodb import get_database

from app.middleware.auth_middleware import (
    get_current_user,
    require_candidate,
    require_hr,
)

from app.services.resume_service import (
    create_resume_record,
    parse_resume,
)

from app.utils.file_handler import save_resume_file
from app.utils.resume_parser import extract_resume_text


# =========================================================
# CONFIGURATION
# =========================================================

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/resume",
    tags=["Resume"],
)

ALLOWED_RESUME_EXTENSIONS = {
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
}

MEDIA_TYPES = {
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": (
        "application/vnd.openxmlformats-officedocument."
        "wordprocessingml.document"
    ),
    ".txt": "text/plain",
}


# =========================================================
# DATABASE AND ID HELPERS
# =========================================================

def _get_db():
    db = get_database()

    if db is None:
        raise RuntimeError(
            "Database connection is not available."
        )

    return db


def _validate_resume_id(
    resume_id: str,
) -> ObjectId:
    if not resume_id or not ObjectId.is_valid(
        str(resume_id)
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid resume ID.",
        )

    return ObjectId(str(resume_id))


def _id_variants(value) -> list:
    value = str(value)

    if not ObjectId.is_valid(value):
        return [value]

    object_id = ObjectId(value)

    return [
        object_id,
        str(object_id),
    ]


def _get_user_id(
    current_user: dict,
) -> str:
    user_id = current_user.get("_id")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user ID is missing.",
        )

    return str(user_id)


def _get_user_role(
    current_user: dict,
) -> str:
    return str(
        current_user.get("role") or ""
    ).strip().lower()


# =========================================================
# RESPONSE SERIALIZATION
# =========================================================

def _serialize_resume(
    resume: dict,
    *,
    include_text: bool = False,
) -> dict:
    """
    Preserve existing resume response fields
    except internal server file paths.

    Full extracted text is included only
    for authorized detail responses.
    """

    response = {
        "id": str(resume["_id"]),
        "user_id": str(
            resume.get("user_id") or ""
        ),
        "original_filename": resume.get(
            "original_filename",
            "",
        ),
        "stored_filename": resume.get(
            "stored_filename",
            "",
        ),
        "file_type": resume.get(
            "file_type",
            "",
        ),
        "file_size": resume.get(
            "file_size",
            0,
        ),
        "parsed": resume.get(
            "parsed",
            False,
        ),
        "extracted_text": None,
        "structured_data": (
            resume.get("structured_data")
            or {}
        ),
        "uploaded_at": resume.get(
            "uploaded_at"
        ),
        "updated_at": resume.get(
            "updated_at"
        ),
    }

    if include_text:
        response["extracted_text"] = (
            resume.get("extracted_text")
        )

    return response


# =========================================================
# HR RESUME ACCESS
# =========================================================

def _hr_can_access_resume(
    db,
    resume: dict,
    hr_user_id: str,
) -> bool:
    """
    HR/Recruiter can access a resume only if:

    1. The resume belongs to the applicant.
    2. An application references this exact resume.
    3. The application is not withdrawn.
    4. The application belongs to an HR-owned job.
    """

    resume_owner_id = str(
        resume.get("user_id") or ""
    )

    if not ObjectId.is_valid(resume_owner_id):
        return False

    applications = db["applications"].find({
        "resume_id": {
            "$in": _id_variants(
                resume["_id"]
            ),
        },
        "user_id": {
            "$in": _id_variants(
                resume_owner_id
            ),
        },
        "status": {
            "$ne": "Withdrawn",
        },
    })

    hr_ids = _id_variants(
        hr_user_id
    )

    for application in applications:
        job_id = application.get("job_id")

        if not job_id:
            continue

        if not ObjectId.is_valid(
            str(job_id)
        ):
            continue

        job = db["jobs"].find_one({
            "_id": ObjectId(
                str(job_id)
            ),
            "user_id": {
                "$in": hr_ids,
            },
        })

        if job:
            return True

    return False


def can_access_resume(
    resume: dict,
    current_user: dict,
    db=None,
) -> bool:
    """
    Candidate:
        Own resume only.

    HR/Recruiter:
        Exact applicant resume linked to
        an active application for an owned job.

    Other roles:
        No access.
    """

    user_id = _get_user_id(
        current_user
    )

    role = _get_user_role(
        current_user
    )

    resume_owner_id = str(
        resume.get("user_id") or ""
    )

    if role == "candidate":
        return (
            resume_owner_id == user_id
        )

    if role not in {
        "hr",
        "recruiter",
    }:
        return False

    if db is None:
        db = _get_db()

    return _hr_can_access_resume(
        db=db,
        resume=resume,
        hr_user_id=user_id,
    )


def _get_authorized_resume(
    resume_id: str,
    current_user: dict,
) -> dict:
    """
    Return a resume only after
    authorization succeeds.
    """

    db = _get_db()

    object_id = _validate_resume_id(
        resume_id
    )

    resume = db["resumes"].find_one({
        "_id": object_id,
    })

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )

    if not can_access_resume(
        resume=resume,
        current_user=current_user,
        db=db,
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )

    return resume


# =========================================================
# UPLOAD RESUME - CANDIDATE ONLY
# =========================================================

@router.post("/upload")
def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(
        require_candidate
    ),
):
    """
    Candidate uploads a resume.

    File content and size restrictions
    must also be enforced by file_handler.
    """

    user_id = _get_user_id(
        current_user
    )

    original_filename = (
        file.filename or ""
    )

    extension = Path(
        original_filename
    ).suffix.lower()

    if extension not in ALLOWED_RESUME_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Unsupported resume file type."
            ),
        )

    file_path = None

    try:
        file_path = save_resume_file(
            file
        )

        stored_filename = os.path.basename(
            file_path
        )

        file_extension = Path(
            stored_filename
        ).suffix.lower()

        file_size = os.path.getsize(
            file_path
        )

        resume = create_resume_record(
            user_id=user_id,
            original_filename=original_filename,
            stored_filename=stored_filename,
            file_path=file_path,
            file_type=file_extension,
            file_size=file_size,
        )

        if isinstance(resume, dict):
            resume = {
                key: value
                for key, value in resume.items()
                if key != "file_path"
            }

        return {
            "message": (
                "Resume uploaded successfully."
            ),
            "resume": resume,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    except Exception:
        logger.exception(
            "Resume upload failed."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Resume upload failed.",
        )

    finally:
        file.file.close()


# =========================================================
# GET MY RESUMES - CANDIDATE ONLY
# =========================================================

@router.get("/my-resumes")
def get_my_resumes(
    current_user: dict = Depends(
        require_candidate
    ),
):
    """
    List only the authenticated
    Candidate's resumes.
    """

    user_id = _get_user_id(
        current_user
    )

    try:
        db = _get_db()

        resumes = (
            db["resumes"]
            .find({
                "user_id": {
                    "$in": _id_variants(
                        user_id
                    ),
                },
            })
            .sort(
                "uploaded_at",
                -1,
            )
        )

        resume_list = [
            _serialize_resume(
                resume,
                include_text=False,
            )
            for resume in resumes
        ]

        return {
            "message": (
                "Resumes retrieved successfully."
            ),
            "count": len(resume_list),
            "resumes": resume_list,
        }

    except Exception:
        logger.exception(
            "Failed to retrieve resumes."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve resumes.",
        )


# =========================================================
# GET CANDIDATES - HR / RECRUITER ONLY
# =========================================================

@router.get("/candidates")
def get_all_candidates(
    current_user: dict = Depends(
        require_hr
    ),
):
    """
    Return candidates with valid resumes
    attached to applications for jobs
    owned by the authenticated HR.

    Withdrawn applications are excluded.
    """

    hr_user_id = _get_user_id(
        current_user
    )

    try:
        db = _get_db()

        owned_jobs = db["jobs"].find(
            {
                "user_id": {
                    "$in": _id_variants(
                        hr_user_id
                    ),
                },
            },
            {
                "_id": 1,
            },
        )

        owned_job_ids = []

        for job in owned_jobs:
            owned_job_ids.extend(
                _id_variants(
                    job["_id"]
                )
            )

        if not owned_job_ids:
            return {
                "message": (
                    "Candidates retrieved successfully."
                ),
                "count": 0,
                "candidates": [],
            }

        applications = db[
            "applications"
        ].find({
            "job_id": {
                "$in": owned_job_ids,
            },
            "status": {
                "$ne": "Withdrawn",
            },
            "resume_id": {
                "$ne": None,
            },
        })

        candidates = []
        seen_resume_ids = set()

        for application in applications:
            resume_id = application.get(
                "resume_id"
            )

            if not resume_id:
                continue

            if not ObjectId.is_valid(
                str(resume_id)
            ):
                continue

            resume_object_id = ObjectId(
                str(resume_id)
            )

            resume_id_str = str(
                resume_object_id
            )

            if resume_id_str in seen_resume_ids:
                continue

            resume = db["resumes"].find_one({
                "_id": resume_object_id,
            })

            if not resume:
                continue

            user_id = str(
                resume.get("user_id")
                or ""
            )

            if user_id != str(
                application.get("user_id")
                or ""
            ):
                continue

            user = None

            if ObjectId.is_valid(user_id):
                user = db["users"].find_one({
                    "_id": ObjectId(
                        user_id
                    ),
                })

            structured_data = (
                resume.get(
                    "structured_data"
                )
                or {}
            )

            if not isinstance(
                structured_data,
                dict,
            ):
                structured_data = {}

            personal_information = (
                structured_data.get(
                    "personal_information"
                )
                or {}
            )

            if not isinstance(
                personal_information,
                dict,
            ):
                personal_information = {}

            candidate_name = (
                personal_information.get(
                    "name"
                )
                or (user or {}).get(
                    "name"
                )
                or "Unknown Candidate"
            )

            candidate_email = (
                personal_information.get(
                    "email"
                )
                or (user or {}).get(
                    "email"
                )
                or ""
            )

            candidate_phone = (
                personal_information.get(
                    "phone"
                )
                or ""
            )

            candidates.append({
                "id": resume_id_str,
                "resume_id": resume_id_str,
                "user_id": user_id,
                "name": candidate_name,
                "email": candidate_email,
                "phone": candidate_phone,
                "role": "Candidate",
                "summary": structured_data.get(
                    "summary",
                    "",
                ),
                "skills": structured_data.get(
                    "skills",
                    [],
                ),
                "education": structured_data.get(
                    "education",
                    "",
                ),
                "experience": structured_data.get(
                    "experience",
                    "",
                ),
                "projects": structured_data.get(
                    "projects",
                    "",
                ),
                "achievements": structured_data.get(
                    "achievements",
                    "",
                ),
                "certifications": structured_data.get(
                    "certifications",
                    "",
                ),
                "parsed": resume.get(
                    "parsed",
                    False,
                ),
                "original_filename": resume.get(
                    "original_filename",
                    "",
                ),
                "uploaded_at": resume.get(
                    "uploaded_at"
                ),
                "updated_at": resume.get(
                    "updated_at"
                ),
            })

            seen_resume_ids.add(
                resume_id_str
            )

        return {
            "message": (
                "Candidates retrieved successfully."
            ),
            "count": len(candidates),
            "candidates": candidates,
        }

    except Exception:
        logger.exception(
            "Failed to retrieve HR candidates."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve candidates.",
        )


# =========================================================
# VIEW RESUME FILE - AUTHORIZED USER
# =========================================================

@router.get("/{resume_id}/file")
def view_resume_file(
    resume_id: str,
    current_user: dict = Depends(
        get_current_user
    ),
):
    """
    Candidate: own resume file.

    HR/Recruiter: applicant resume for
    an owned job with active application.
    """

    try:
        resume = _get_authorized_resume(
            resume_id=resume_id,
            current_user=current_user,
        )

        file_path = resume.get(
            "file_path"
        )

        if (
            not file_path
            or not os.path.isfile(
                file_path
            )
        ):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume file not found.",
            )

        extension = str(
            resume.get(
                "file_type"
            )
            or ""
        ).lower()

        media_type = MEDIA_TYPES.get(
            extension,
            "application/octet-stream",
        )

        original_filename = os.path.basename(
            str(
                resume.get(
                    "original_filename"
                )
                or "resume.pdf"
            )
        )

        return FileResponse(
            path=file_path,
            media_type=media_type,
            filename=original_filename,
            content_disposition_type="inline",
            headers={
                "Cache-Control": (
                    "private, no-store"
                ),
                "X-Content-Type-Options": (
                    "nosniff"
                ),
            },
        )

    except HTTPException:
        raise

    except Exception:
        logger.exception(
            "Failed to open resume file."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to open resume.",
        )


# =========================================================
# GET RESUME DETAILS - AUTHORIZED USER
# =========================================================

@router.get("/{resume_id}")
def get_resume(
    resume_id: str,
    current_user: dict = Depends(
        get_current_user
    ),
):
    """
    Candidate: own resume details.

    HR/Recruiter: authorized applicant
    resume details.
    """

    try:
        resume = _get_authorized_resume(
            resume_id=resume_id,
            current_user=current_user,
        )

        return {
            "message": (
                "Resume retrieved successfully."
            ),
            "resume": _serialize_resume(
                resume,
                include_text=True,
            ),
        }

    except HTTPException:
        raise

    except Exception:
        logger.exception(
            "Failed to retrieve resume."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve resume.",
        )


# =========================================================
# PARSE RESUME - CANDIDATE ONLY
# =========================================================

@router.post("/{resume_id}/parse")
def parse_uploaded_resume(
    resume_id: str,
    current_user: dict = Depends(
        require_candidate
    ),
):
    """
    Only the authenticated Candidate
    who owns the resume can parse it.
    """

    user_id = _get_user_id(
        current_user
    )

    try:
        db = _get_db()

        object_id = _validate_resume_id(
            resume_id
        )

        resume = db["resumes"].find_one({
            "_id": object_id,
            "user_id": {
                "$in": _id_variants(
                    user_id
                ),
            },
        })

        if not resume:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found.",
            )

        file_path = resume.get(
            "file_path"
        )

        if (
            not file_path
            or not os.path.isfile(
                file_path
            )
        ):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume file not found.",
            )

        extracted_text = extract_resume_text(
            file_path
        )

        if not extracted_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "No text could be extracted "
                    "from the resume."
                ),
            )

        parsed_resume = parse_resume(
            resume_id=resume_id,
            user_id=user_id,
            extracted_text=extracted_text,
        )

        if isinstance(parsed_resume, dict):
            parsed_resume = {
                key: value
                for key, value in parsed_resume.items()
                if key != "file_path"
            }

        return {
            "message": (
                "Resume parsed successfully."
            ),
            "resume": parsed_resume,
        }

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume file not found.",
        )

    except Exception:
        logger.exception(
            "Resume parsing failed."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Resume parsing failed.",
        )

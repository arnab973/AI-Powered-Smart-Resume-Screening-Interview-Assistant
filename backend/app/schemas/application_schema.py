
import math

from typing import Literal

from bson import ObjectId

from pydantic import (
    BaseModel,
    Field,
    field_validator,
)


# =========================================================
# APPLICATION STATUS
# =========================================================

ApplicationStatus = Literal[
    "Applied",
    "Under Review",
    "Shortlisted",
    "Interview",
    "Rejected",
    "Hired",
    "Withdrawn",
]


# =========================================================
# CREATE APPLICATION REQUEST
# =========================================================

class CreateApplicationRequest(BaseModel):
    """
    Candidate submits an application for a job.

    The authenticated Candidate ID must come
    from the JWT, not the request body.
    """

    job_id: str = Field(
        ...,
        min_length=24,
        max_length=24,
        description="MongoDB ObjectId of the job",
    )

    resume_id: str | None = Field(
        default=None,
        description="Optional MongoDB ObjectId of the resume",
    )

    cover_letter: str = Field(
        default="",
        max_length=5000,
        description="Candidate's cover letter",
    )

    # -----------------------------------------------------
    # MONGODB OBJECT ID VALIDATION
    # -----------------------------------------------------

    @field_validator(
        "job_id",
        "resume_id",
    )
    @classmethod
    def validate_object_ids(
        cls,
        value: str | None,
    ) -> str | None:
        """
        Validate MongoDB ObjectId format.

        resume_id remains optional to preserve
        the existing application API contract.
        """

        if value is None:
            return None

        if not ObjectId.is_valid(value):
            raise ValueError(
                "Must be a valid MongoDB ObjectId."
            )

        return str(ObjectId(value))

    # -----------------------------------------------------
    # COVER LETTER NORMALIZATION
    # -----------------------------------------------------

    @field_validator("cover_letter")
    @classmethod
    def normalize_cover_letter(
        cls,
        value: str,
    ) -> str:
        return value.strip()


# =========================================================
# UPDATE APPLICATION STATUS REQUEST
# =========================================================

class UpdateApplicationStatusRequest(BaseModel):
    """
    HR/Recruiter updates an application status.

    The service must verify that the HR owns
    the job associated with the application.
    """

    status: ApplicationStatus = Field(
        ...,
        description="New application status",
    )

    recruiter_note: str = Field(
        default="",
        max_length=3000,
        description="Internal HR/Recruiter note",
    )

    @field_validator("recruiter_note")
    @classmethod
    def normalize_recruiter_note(
        cls,
        value: str,
    ) -> str:
        return value.strip()


# =========================================================
# APPLICATION RESPONSE
# =========================================================

class ApplicationResponse(BaseModel):
    """
    Application response used by Candidate
    and HR/Recruiter dashboards.

    Existing frontend field names are preserved.
    """

    id: str

    user_id: str

    job_id: str

    resume_id: str | None = None

    title: str

    company: str

    location: str

    type: str

    salary: str

    status: ApplicationStatus

    match: float = Field(
        default=0.0,
        ge=0.0,
        le=100.0,
        allow_inf_nan=False,
        description="Resume-job matching percentage",
    )

    skills: list[str] = Field(
        default_factory=list,
        description="Skills associated with the application",
    )

    appliedDate: str

    cover_letter: str = ""

    recruiter_note: str = ""

    created_at: str | None = None

    updated_at: str | None = None

    # -----------------------------------------------------
    # MATCH SCORE VALIDATION
    # -----------------------------------------------------

    @field_validator("match")
    @classmethod
    def validate_match_score(
        cls,
        value: float,
    ) -> float:
        if not math.isfinite(value):
            raise ValueError(
                "Match score must be finite."
            )

        return round(value, 2)

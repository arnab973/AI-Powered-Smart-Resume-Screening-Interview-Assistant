
import math

from typing import Any

from bson import ObjectId
from pydantic import (
    BaseModel,
    Field,
    field_validator,
)


# =========================================================
# SCREENING REQUEST SCHEMA
# =========================================================

class ScreeningRequestSchema(BaseModel):
    """
    Request body for AI-powered resume screening.
    """

    resume_id: str = Field(
        ...,
        min_length=24,
        max_length=24,
        description="MongoDB ObjectId of the resume",
    )

    job_id: str = Field(
        ...,
        min_length=24,
        max_length=24,
        description="MongoDB ObjectId of the job",
    )

    @field_validator(
        "resume_id",
        "job_id",
    )
    @classmethod
    def validate_mongodb_id(
        cls,
        value: str,
    ) -> str:
        """
        Validate and normalize MongoDB ObjectIds.
        """

        if not ObjectId.is_valid(value):
            raise ValueError(
                "Must be a valid MongoDB ObjectId."
            )

        return str(ObjectId(value))


# =========================================================
# SCREENING RESPONSE SCHEMA
# =========================================================

class ScreeningResponseSchema(BaseModel):
    """
    API response for AI screening results.

    Existing response structure is preserved
    for frontend compatibility.
    """

    id: str

    user_id: str

    resume_id: str

    job_id: str

    ats_score: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        allow_inf_nan=False,
        description="Overall ATS compatibility score",
    )

    matched_skills: list[str] = Field(
        default_factory=list,
        description=(
            "Skills matched between resume "
            "and job description"
        ),
    )

    missing_skills: list[str] = Field(
        default_factory=list,
        description=(
            "Required job skills missing "
            "from the resume"
        ),
    )

    matching_percentage: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        allow_inf_nan=False,
        description=(
            "Percentage of required skills matched"
        ),
    )

    suggestions: list[str] = Field(
        default_factory=list,
        description=(
            "Suggestions for improving the resume"
        ),
    )

    ai_analysis: dict[str, Any] = Field(
        default_factory=dict,
        description=(
            "Detailed AI screening analysis"
        ),
    )

    @field_validator(
        "ats_score",
        "matching_percentage",
    )
    @classmethod
    def validate_scores(
        cls,
        value: float,
    ) -> float:
        """
        Reject non-finite scores.
        """

        if not math.isfinite(value):
            raise ValueError(
                "Score must be a finite number."
            )

        return round(value, 2)

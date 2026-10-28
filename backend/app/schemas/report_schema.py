
from typing import Any

from pydantic import BaseModel, Field


# =========================================================
# CREATE REPORT REQUEST
# =========================================================

class ReportCreateRequestSchema(BaseModel):
    """
    Request schema for generating a performance report.

    If interview_id is provided:
        Generate report for that interview only.

    If interview_id is omitted:
        Generate a candidate-wide performance report.
    """

    interview_id: str | None = Field(
        default=None,
        description=(
            "Optional interview ID for generating "
            "an interview-specific performance report."
        ),
    )


# =========================================================
# REPORT RESPONSE
# =========================================================

class ReportResponseSchema(BaseModel):
    """
    Response schema for candidate performance reports.

    Supports:
        1. Candidate-wide reports
        2. Interview-specific reports
    """

    id: str | None = None

    user_id: str

    # -----------------------------------------------------
    # INTERVIEW INFORMATION
    # -----------------------------------------------------

    interview_id: str | None = Field(
        default=None,
        description="Associated interview ID",
    )

    total_questions: int = Field(
        ...,
        ge=0,
        description="Total questions in the interview",
    )

    answered_questions: int = Field(
        default=0,
        ge=0,
        description="Number of evaluated questions",
    )

    completion_percentage: float = Field(
        default=0.0,
        ge=0,
        le=100,
        description="Interview completion percentage",
    )

    is_completed: bool = Field(
        default=False,
        description=(
            "Whether all interview questions "
            "have been evaluated"
        ),
    )

    # -----------------------------------------------------
    # PERFORMANCE SCORES
    # -----------------------------------------------------

    average_score: float = Field(
        ...,
        ge=0,
        le=10,
    )

    average_technical_score: float = Field(
        ...,
        ge=0,
        le=10,
    )

    average_relevance_score: float = Field(
        ...,
        ge=0,
        le=10,
    )

    average_clarity_score: float = Field(
        ...,
        ge=0,
        le=10,
    )

    average_completeness_score: float = Field(
        ...,
        ge=0,
        le=10,
    )

    performance_level: str

    # -----------------------------------------------------
    # STRENGTHS AND WEAKNESSES
    # -----------------------------------------------------

    strengths: list[str] = Field(
        default_factory=list
    )

    weaknesses: list[str] = Field(
        default_factory=list
    )

    # -----------------------------------------------------
    # FEEDBACK
    # -----------------------------------------------------

    overall_feedback: str = ""

    improvement_recommendations: list[str] = Field(
        default_factory=list
    )

    interview_tips: list[str] = Field(
        default_factory=list
    )

    # -----------------------------------------------------
    # RELATED EVALUATIONS
    # -----------------------------------------------------

    evaluation_ids: list[str] = Field(
        default_factory=list
    )

    # -----------------------------------------------------
    # METADATA
    # -----------------------------------------------------

    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Additional report information",
    )

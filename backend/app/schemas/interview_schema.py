
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


# =========================================================
# INTERVIEW REQUEST SCHEMA
# =========================================================

class InterviewRequestSchema(BaseModel):
    """
    Request data required to generate an AI interview.
    """

    resume_id: str = Field(
        ...,
        description="MongoDB ID of the candidate resume",
    )

    job_id: str = Field(
        ...,
        description="MongoDB ID of the job",
    )

    technical_question_count: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Number of technical questions",
    )

    skill_gap_question_count: int = Field(
        default=2,
        ge=0,
        le=10,
        description="Number of skill-gap questions",
    )

    hr_question_count: int = Field(
        default=3,
        ge=1,
        le=10,
        description="Number of HR questions",
    )


# =========================================================
# INTERVIEW QUESTION SCHEMA
# =========================================================

class InterviewQuestionSchema(BaseModel):
    """
    Single generated interview question.
    """

    question: str
    type: str
    difficulty: str
    skill: str | None = None
    question_number: int


# =========================================================
# INTERVIEW RESPONSE SCHEMA
# =========================================================

class InterviewResponseSchema(BaseModel):
    """
    Complete AI-generated interview response,
    including progress and completion tracking.
    """

    id: str | None = None

    user_id: str
    resume_id: str
    job_id: str

    total_questions: int

    # -----------------------------------------------------
    # INTERVIEW PROGRESS
    # -----------------------------------------------------

    answered_questions: int = Field(
        default=0,
        ge=0,
        description="Number of unique evaluated questions",
    )

    completion_percentage: float = Field(
        default=0.0,
        ge=0,
        le=100,
        description="Percentage of interview completed",
    )

    is_completed: bool = Field(
        default=False,
        description="Whether all questions are evaluated",
    )

    status: str = Field(
        default="not_started",
        description=(
            "Interview status: not_started, "
            "in_progress, or completed"
        ),
    )

    completed_at: datetime | None = Field(
        default=None,
        description="UTC timestamp of interview completion",
    )

    # -----------------------------------------------------
    # GENERATED QUESTIONS
    # -----------------------------------------------------

    technical_questions: list[InterviewQuestionSchema] = Field(
        default_factory=list,
    )

    skill_gap_questions: list[InterviewQuestionSchema] = Field(
        default_factory=list,
    )

    hr_questions: list[InterviewQuestionSchema] = Field(
        default_factory=list,
    )

    questions: list[InterviewQuestionSchema] = Field(
        default_factory=list,
    )

    # -----------------------------------------------------
    # AI GENERATION INFORMATION
    # -----------------------------------------------------

    generation_method: str

    ai_analysis: dict[str, Any] = Field(
        default_factory=dict,
        description="Additional AI interview generation information",
    )

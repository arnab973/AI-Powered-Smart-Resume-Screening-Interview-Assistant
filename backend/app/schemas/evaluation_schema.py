
from typing import Any

from pydantic import BaseModel, Field, model_validator


class EvaluationRequestSchema(BaseModel):
    """
    Supports both:
    1. Standalone answer evaluation
    2. Interview-linked answer evaluation
    """

    interview_id: str | None = Field(
        default=None,
        description="Generated interview ID",
    )

    question_number: int | None = Field(
        default=None,
        ge=1,
        description="Question number in the interview",
    )

    question: str | None = Field(
        default=None,
        description="Required for standalone evaluation",
    )

    answer: str = Field(
        ...,
        min_length=1,
        description="Candidate's interview answer",
    )

    skill: str | None = Field(
        default=None,
        description="Relevant skill or topic",
    )

    @model_validator(mode="after")
    def validate_evaluation_request(self):
        linked = self.interview_id is not None
        numbered = self.question_number is not None

        if linked != numbered:
            raise ValueError(
                "interview_id and question_number "
                "must be provided together."
            )

        if not linked and (
            not self.question or not self.question.strip()
        ):
            raise ValueError(
                "question is required for "
                "standalone evaluation."
            )

        if not self.answer.strip():
            raise ValueError(
                "Candidate answer cannot be empty."
            )

        return self


class EvaluationResponseSchema(BaseModel):
    """
    Response returned after evaluating an answer.
    """

    id: str | None = None

    interview_id: str | None = None
    question_number: int | None = None

    question: str
    answer: str
    skill: str | None = None

    technical_score: float
    relevance_score: float
    clarity_score: float
    completeness_score: float

    overall_score: float
    performance_level: str

    feedback: str
    improvement: str

    strengths: list[str] = Field(
        default_factory=list
    )

    weaknesses: list[str] = Field(
        default_factory=list
    )

    summary: str = ""

    improvement_plan: list[str] = Field(
        default_factory=list
    )

    interview_tip: str = ""

    metadata: dict[str, Any] = Field(
        default_factory=dict
    )

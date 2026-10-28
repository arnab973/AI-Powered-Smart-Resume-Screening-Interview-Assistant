
from datetime import datetime, timezone

from pydantic import BaseModel, Field


class ScreeningModel(BaseModel):
    user_id: str
    resume_id: str
    job_id: str

    ats_score: float = Field(
        default=0.0,
        ge=0.0,
        le=100.0,
    )

    matched_skills: list[str] = Field(
        default_factory=list
    )

    missing_skills: list[str] = Field(
        default_factory=list
    )

    matching_percentage: float = Field(
        default=0.0,
        ge=0.0,
        le=100.0,
    )

    suggestions: list[str] = Field(
        default_factory=list
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


class JobModel(BaseModel):
    user_id: str
    title: str
    company: Optional[str] = None
    description: str
    required_skills: list[str] = Field(default_factory=list)
    preferred_skills: list[str] = Field(default_factory=list)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

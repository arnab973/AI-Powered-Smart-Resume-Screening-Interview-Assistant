from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


class ResumeModel(BaseModel):
    user_id: str
    original_filename: str
    stored_filename: str
    file_path: str
    file_type: str
    file_size: int
    parsed: bool = False
    uploaded_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
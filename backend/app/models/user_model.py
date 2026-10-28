from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserModel(BaseModel):
    """
    User document structure for MongoDB.
    """

    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password_hash: str
    role: str = "candidate"
    profile_image: Optional[str] = None
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
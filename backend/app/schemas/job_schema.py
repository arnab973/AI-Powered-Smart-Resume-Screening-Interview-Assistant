
from pydantic import BaseModel, Field


class JobCreateSchema(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    company: str | None = Field(default=None, max_length=200)
    description: str = Field(..., min_length=20)
    required_skills: list[str] = Field(default_factory=list)
    preferred_skills: list[str] = Field(default_factory=list)


class JobResponseSchema(BaseModel):
    id: str
    user_id: str
    title: str
    company: str | None = None
    description: str
    required_skills: list[str] = Field(default_factory=list)
    preferred_skills: list[str] = Field(default_factory=list)

from pydantic import BaseModel, Field


class SettingsUpdateRequest(BaseModel):
    name: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    phone: str = Field(
        default="",
        max_length=30,
    )

    location: str = Field(
        default="",
        max_length=150,
    )

    education: str = Field(
        default="",
        max_length=200,
    )

    headline: str = Field(
        default="",
        max_length=200,
    )

    bio: str = Field(
        default="",
        max_length=2000,
    )

    email_notifications: bool = True
    interview_reminders: bool = True
    job_alerts: bool = True
    application_updates: bool = True
    security_alerts: bool = True

    profile_visibility: bool = True
    show_email_to_recruiters: bool = False
    show_phone_to_recruiters: bool = False

    language: str = "English"
    theme: str = "Dark"
    interview_difficulty: str = "Adaptive"


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(
        ...,
        min_length=1,
        max_length=200,
    )

    new_password: str = Field(
        ...,
        min_length=6,
        max_length=100,
    )
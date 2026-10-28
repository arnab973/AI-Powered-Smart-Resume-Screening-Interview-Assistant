
from typing import Literal

from pydantic import BaseModel, Field, EmailStr, ConfigDict


class HRProfileUpdateSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=2, max_length=100)
    company: str = Field(default="", max_length=150)
    phone: str = Field(default="", max_length=30)
    designation: str = Field(default="", max_length=100)


class HRNotificationSettingsSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email_notifications: bool = True
    application_alerts: bool = True
    interview_reminders: bool = True
    report_updates: bool = True


class HRAppearanceSettingsSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    theme: Literal["dark", "light", "system"] = "dark"
    language: Literal["en", "hi", "bn"] = "en"


class HRPasswordChangeSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=1)


class HRSettingsResponseSchema(BaseModel):
    user_id: str
    name: str
    email: EmailStr
    company: str = ""
    phone: str = ""
    designation: str = ""
    notifications: HRNotificationSettingsSchema
    appearance: HRAppearanceSettingsSchema

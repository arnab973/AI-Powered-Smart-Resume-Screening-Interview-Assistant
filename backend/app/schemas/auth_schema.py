
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


# =========================================================
# USER REGISTRATION
# =========================================================

class RegisterRequest(BaseModel):
    name: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    email: EmailStr

    password: str = Field(
        ...,
        min_length=6,
        max_length=100,
    )

    role: Literal["candidate"] = "candidate"


# =========================================================
# EMAIL / PASSWORD LOGIN
# =========================================================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# =========================================================
# GOOGLE AUTHENTICATION
# =========================================================

class GoogleLoginRequest(BaseModel):
    credential: str = Field(
        ...,
        min_length=20,
        description="Google Identity Services ID token",
    )


# =========================================================
# AUTHENTICATED USER RESPONSE
# =========================================================

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    profile_image: str | None = None


# =========================================================
# AUTHENTICATION RESPONSE
# =========================================================

class AuthResponse(BaseModel):
    message: str
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

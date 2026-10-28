
from fastapi import APIRouter, Depends, HTTPException, status

from app.middleware.auth_middleware import get_current_user

from app.schemas.auth_schema import (
    AuthResponse,
    GoogleLoginRequest,
    LoginRequest,
    RegisterRequest,
)

from app.schemas.settings_schema import (
    ChangePasswordRequest,
    SettingsUpdateRequest,
)

from app.services.auth_service import (
    login_user,
    register_user,
)

from app.services.google_auth_service import (
    google_login_user,
)

from app.services.settings_service import (
    change_user_password,
    get_user_settings,
    update_user_settings,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# =========================================================
# REGISTER USER
# =========================================================

@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
)
def register(
    user_data: RegisterRequest,
):
    try:
        user = register_user(user_data)

        return {
            "message": "User registered successfully.",
            "user": user,
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    except RuntimeError as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


# =========================================================
# EMAIL / PASSWORD LOGIN
# =========================================================

@router.post(
    "/login",
    response_model=AuthResponse,
)
def login(
    login_data: LoginRequest,
):
    try:
        result = login_user(
            email=login_data.email,
            password=login_data.password,
        )

        return {
            "message": "Login successful.",
            "access_token": result["access_token"],
            "token_type": "bearer",
            "user": result["user"],
        }

    except ValueError as e:
        raise HTTPException(
            status_code=401,
            detail=str(e),
        )

    except RuntimeError as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


# =========================================================
# GOOGLE SIGN IN
# =========================================================

@router.post(
    "/google",
    response_model=AuthResponse,
)
def google_login(
    google_data: GoogleLoginRequest,
):
    """
    Authenticate a user using a Google ID token.

    The Google token is verified in google_auth_service.py.
    Existing users retain their database-assigned role.
    New Google users are registered as candidates.
    """

    try:
        result = google_login_user(
            credential=google_data.credential
        )

        return {
            "message": "Google login successful.",
            "access_token": result["access_token"],
            "token_type": "bearer",
            "user": result["user"],
        }

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )

    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


# =========================================================
# GET AUTHENTICATED USER
# =========================================================

@router.get("/me")
def get_me(
    current_user: dict = Depends(
        get_current_user
    ),
):
    return {
        "message": "Authenticated user.",
        "user": {
            "id": str(
                current_user["_id"]
            ),
            "name": current_user["name"],
            "email": current_user["email"],
            "role": current_user["role"],
            "profile_image": current_user.get(
                "profile_image"
            ),
        },
    }


# =========================================================
# GET USER SETTINGS
# =========================================================

@router.get("/settings")
def get_settings(
    current_user: dict = Depends(
        get_current_user
    ),
):
    try:
        return {
            "message": "Settings retrieved successfully.",
            "settings": get_user_settings(
                user_id=str(
                    current_user["_id"]
                )
            ),
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    except RuntimeError as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


# =========================================================
# UPDATE USER SETTINGS
# =========================================================

@router.put("/settings")
def update_settings(
    settings_data: SettingsUpdateRequest,
    current_user: dict = Depends(
        get_current_user
    ),
):
    try:
        updated_user = update_user_settings(
            user_id=str(
                current_user["_id"]
            ),
            settings=settings_data.model_dump(),
        )

        return {
            "message": "Settings updated successfully.",
            "user": updated_user,
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    except RuntimeError as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


# =========================================================
# CHANGE USER PASSWORD
# =========================================================

@router.post("/change-password")
def change_password(
    password_data: ChangePasswordRequest,
    current_user: dict = Depends(
        get_current_user
    ),
):
    try:
        return change_user_password(
            user_id=str(
                current_user["_id"]
            ),
            current_password=password_data.current_password,
            new_password=password_data.new_password,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    except RuntimeError as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


from typing import Callable

from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)

from app.database.mongodb import get_database
from app.utils.security import decode_access_token


# =========================================================
# AUTHENTICATION CONFIGURATION
# =========================================================

security = HTTPBearer(auto_error=False)

USERS_COLLECTION = "users"

ROLE_CANDIDATE = "candidate"
ROLE_HR = "hr"
ROLE_RECRUITER = "recruiter"

HR_ROLES = {
    ROLE_HR,
    ROLE_RECRUITER,
}

VALID_ROLES = {
    ROLE_CANDIDATE,
    ROLE_HR,
    ROLE_RECRUITER,
}


# =========================================================
# AUTHENTICATION ERROR HELPER
# =========================================================

def authentication_error(
    detail: str = "Invalid or expired authentication token.",
) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={
            "WWW-Authenticate": "Bearer",
        },
    )


# =========================================================
# GET CURRENT AUTHENTICATED USER
# =========================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
) -> dict:
    """
    Verify JWT authentication and retrieve the current
    user directly from MongoDB.

    The user's database role is authoritative.
    """

    # -----------------------------------------------------
    # STEP 1: VALIDATE AUTHORIZATION HEADER
    # -----------------------------------------------------

    if credentials is None:
        raise authentication_error(
            "Authentication token is required."
        )

    if credentials.scheme.lower() != "bearer":
        raise authentication_error(
            "Invalid authentication scheme."
        )

    token = credentials.credentials

    if not token:
        raise authentication_error(
            "Authentication token is missing."
        )

    # -----------------------------------------------------
    # STEP 2: VERIFY JWT TOKEN
    # -----------------------------------------------------

    payload = decode_access_token(token)

    if not payload or not isinstance(payload, dict):
        raise authentication_error()

    user_id = payload.get("sub")

    if not isinstance(user_id, str) or not user_id:
        raise authentication_error(
            "Invalid authentication token payload."
        )

    # -----------------------------------------------------
    # STEP 3: VALIDATE MONGODB USER ID
    # -----------------------------------------------------

    if not ObjectId.is_valid(user_id):
        raise authentication_error(
            "Invalid user ID in authentication token."
        )

    object_id = ObjectId(user_id)

    # -----------------------------------------------------
    # STEP 4: CONNECT TO DATABASE
    # -----------------------------------------------------

    db = get_database()

    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is not available.",
        )

    # -----------------------------------------------------
    # STEP 5: FETCH USER FROM MONGODB
    # -----------------------------------------------------

    user = db[USERS_COLLECTION].find_one(
        {
            "_id": object_id,
        },
        {
            "password_hash": 0,
        },
    )

    if not user:
        raise authentication_error(
            "User account was not found."
        )

    # -----------------------------------------------------
    # STEP 6: VALIDATE DATABASE ROLE
    # -----------------------------------------------------

    role = str(
        user.get("role") or ""
    ).strip().lower()

    if role not in VALID_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account does not have a valid role.",
        )

    user["role"] = role

    return user


# =========================================================
# REQUIRE SPECIFIC ROLES
# =========================================================

def require_roles(
    *allowed_roles: str,
) -> Callable:
    """
    Reusable role-based authorization dependency.

    Example:

        Depends(require_roles("hr", "recruiter"))

    The role is checked against the authenticated user's
    MongoDB record, not a frontend-supplied role.
    """

    normalized_roles = {
        str(role).strip().lower()
        for role in allowed_roles
    }

    if not normalized_roles:
        raise ValueError(
            "At least one allowed role must be provided."
        )

    if not normalized_roles.issubset(VALID_ROLES):
        raise ValueError(
            "Unsupported role in authorization configuration."
        )

    def role_checker(
        current_user: dict = Depends(get_current_user),
    ) -> dict:
        user_role = str(
            current_user.get("role") or ""
        ).strip().lower()

        if user_role not in normalized_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You do not have permission to "
                    "access this resource."
                ),
            )

        return current_user

    return role_checker


# =========================================================
# CANDIDATE AUTHORIZATION
# =========================================================

def require_candidate(
    current_user: dict = Depends(
        require_roles(ROLE_CANDIDATE)
    ),
) -> dict:
    """
    Allow only authenticated candidates.
    """

    return current_user


# =========================================================
# HR / RECRUITER AUTHORIZATION
# =========================================================

def require_hr(
    current_user: dict = Depends(
        require_roles(
            ROLE_HR,
            ROLE_RECRUITER,
        )
    ),
) -> dict:
    """
    Allow only authenticated HR and recruiter accounts.
    """

    return current_user


# =========================================================
# OPTIONAL ROLE CHECK HELPER
# =========================================================

def has_role(
    user: dict,
    *allowed_roles: str,
) -> bool:
    """
    Check a user's role when authorization is needed
    inside a service or helper function.
    """

    user_role = str(
        user.get("role") or ""
    ).strip().lower()

    normalized_roles = {
        str(role).strip().lower()
        for role in allowed_roles
    }

    return user_role in normalized_roles

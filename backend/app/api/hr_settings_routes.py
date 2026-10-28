
from fastapi import (
    APIRouter,
    Depends,
)

from app.middleware.auth_middleware import require_roles

from app.schemas.hr_settings_schema import (
    HRSettingsResponseSchema,
    HRProfileUpdateSchema,
    HRNotificationSettingsSchema,
    HRAppearanceSettingsSchema,
    HRPasswordChangeSchema,
)

from app.services.hr_settings_service import (
    get_hr_settings,
    update_hr_profile,
    update_hr_notifications,
    update_hr_appearance,
    change_hr_password,
)


# =========================================================
# HR SETTINGS ROUTER
# =========================================================

router = APIRouter(
    prefix="/hr/settings",
    tags=["HR Settings"],
)


# =========================================================
# HR-ONLY AUTHORIZATION
# =========================================================

# Only HR accounts can manage HR settings.
#
# The role is verified against the authenticated
# user's MongoDB record by the central middleware.
#
# Recruiter accounts are intentionally excluded
# to preserve the existing authorization policy.

hr_only = require_roles("hr")


# =========================================================
# GET HR SETTINGS
# =========================================================

@router.get(
    "",
    response_model=HRSettingsResponseSchema,
)
def get_settings(
    current_user: dict = Depends(hr_only),
):
    """
    Retrieve the authenticated HR user's settings.

    Access:
        HR only.
    """

    return get_hr_settings(
        current_user
    )


# =========================================================
# UPDATE HR PROFILE
# =========================================================

@router.put(
    "/profile",
    response_model=HRSettingsResponseSchema,
)
def update_profile(
    payload: HRProfileUpdateSchema,
    current_user: dict = Depends(hr_only),
):
    """
    Update the authenticated HR user's profile.

    Access:
        HR only.
    """

    return update_hr_profile(
        current_user,
        payload,
    )


# =========================================================
# UPDATE HR NOTIFICATION SETTINGS
# =========================================================

@router.put(
    "/notifications",
    response_model=HRSettingsResponseSchema,
)
def update_notifications(
    payload: HRNotificationSettingsSchema,
    current_user: dict = Depends(hr_only),
):
    """
    Update the authenticated HR user's
    notification preferences.

    Access:
        HR only.
    """

    return update_hr_notifications(
        current_user,
        payload,
    )


# =========================================================
# UPDATE HR APPEARANCE SETTINGS
# =========================================================

@router.put(
    "/appearance",
    response_model=HRSettingsResponseSchema,
)
def update_appearance(
    payload: HRAppearanceSettingsSchema,
    current_user: dict = Depends(hr_only),
):
    """
    Update the authenticated HR user's
    appearance preferences.

    Access:
        HR only.
    """

    return update_hr_appearance(
        current_user,
        payload,
    )


# =========================================================
# CHANGE HR PASSWORD
# =========================================================

@router.put(
    "/password",
)
def update_password(
    payload: HRPasswordChangeSchema,
    current_user: dict = Depends(hr_only),
):
    """
    Change the authenticated HR user's password.

    Access:
        HR only.

    Password verification and secure hashing
    are handled by the service layer.
    """

    return change_hr_password(
        current_user,
        payload,
    )

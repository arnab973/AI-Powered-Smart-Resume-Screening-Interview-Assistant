
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # =========================================================
    # APPLICATION CONFIGURATION
    # =========================================================
    APP_NAME: str = (
        "AI-Powered Smart Resume Screening & Interview Assistant"
    )
    DEBUG: bool = True

    # =========================================================
    # MONGODB CONFIGURATION
    # =========================================================
    MONGODB_URI: str = ""
    DATABASE_NAME: str = "resume_screening_db"

    # =========================================================
    # JWT AUTHENTICATION
    # =========================================================
    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # =========================================================
    # GOOGLE OAUTH AUTHENTICATION
    # =========================================================
    GOOGLE_CLIENT_ID: str = ""

    # =========================================================
    # AI API CONFIGURATION
    # =========================================================
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    # =========================================================
    # FILE UPLOAD CONFIGURATION
    # =========================================================
    MAX_FILE_SIZE_MB: int = 10
    UPLOAD_DIR: str = "uploads"

    # =========================================================
    # ENVIRONMENT CONFIGURATION
    # =========================================================
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

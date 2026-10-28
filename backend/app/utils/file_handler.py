
import os
import uuid
import zipfile

from pathlib import Path

from fastapi import UploadFile

from app.config import settings


# =========================================================
# CONFIGURATION
# =========================================================

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".docx",
}

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

CHUNK_SIZE = 1024 * 1024  # 1 MB


# =========================================================
# FILE VALIDATION
# =========================================================

def validate_resume_file(
    file: UploadFile,
) -> str:
    """
    Validate the uploaded resume filename
    and supported extension.

    Actual file content is checked separately.
    """

    if not file.filename:
        raise ValueError(
            "File name is required."
        )

    extension = Path(
        file.filename
    ).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError(
            "Invalid file type. Only PDF and "
            "DOCX files are allowed."
        )

    return extension


def _validate_file_content(
    file_path: str,
    extension: str,
) -> None:
    """
    Perform basic file format validation.

    PDF:
        Verify PDF signature.

    DOCX:
        Verify ZIP structure and required
        Microsoft Word document entries.
    """

    if extension == ".pdf":
        with open(file_path, "rb") as file:
            signature = file.read(5)

        if signature != b"%PDF-":
            raise ValueError(
                "Invalid PDF file content."
            )

    elif extension == ".docx":
        if not zipfile.is_zipfile(file_path):
            raise ValueError(
                "Invalid DOCX file content."
            )

        try:
            with zipfile.ZipFile(
                file_path,
                "r",
            ) as archive:
                filenames = set(
                    archive.namelist()
                )

                required_files = {
                    "[Content_Types].xml",
                    "word/document.xml",
                }

                if not required_files.issubset(
                    filenames
                ):
                    raise ValueError(
                        "Invalid DOCX document structure."
                    )

        except zipfile.BadZipFile as error:
            raise ValueError(
                "Invalid DOCX file content."
            ) from error


# =========================================================
# SAVE RESUME FILE
# =========================================================

def save_resume_file(
    file: UploadFile,
) -> str:
    """
    Securely save an uploaded resume.

    Features:
        - PDF/DOCX extension validation
        - Maximum file size of 5 MB
        - Basic content signature validation
        - Random UUID filename
        - Chunked file writing
        - Automatic cleanup on failure
    """

    extension = validate_resume_file(
        file
    )

    upload_dir = Path(
        settings.UPLOAD_DIR
    ).resolve()

    upload_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    unique_filename = (
        f"{uuid.uuid4().hex}{extension}"
    )

    file_path = upload_dir / unique_filename

    total_size = 0

    try:
        file.file.seek(0)

        with open(
            file_path,
            "xb",
        ) as buffer:
            while True:
                chunk = file.file.read(
                    CHUNK_SIZE
                )

                if not chunk:
                    break

                total_size += len(chunk)

                if total_size > MAX_FILE_SIZE:
                    raise ValueError(
                        "Resume file size must not "
                        "exceed 5 MB."
                    )

                buffer.write(chunk)

        if total_size == 0:
            raise ValueError(
                "Resume file cannot be empty."
            )

        _validate_file_content(
            file_path=str(file_path),
            extension=extension,
        )

        return str(file_path)

    except Exception:
        try:
            if file_path.exists():
                file_path.unlink()
        except OSError:
            pass

        raise

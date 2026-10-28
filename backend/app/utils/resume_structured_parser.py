
import re
from typing import Any


# =========================================================
# CONFIGURATION
# =========================================================

SECTION_ALIASES = {
    "summary": [
        "professional summary",
        "career summary",
        "summary",
        "profile",
        "professional profile",
        "career objective",
        "objective",
        "about me",
    ],
    "education": [
        "education",
        "educational qualifications",
        "academic background",
        "academic qualification",
        "academic qualifications",
        "education details",
    ],
    "skills": [
        "technical skills",
        "technical skills and tools",
        "technical skills & tools",
        "skills",
        "technical expertise",
        "core competencies",
        "key skills",
        "skills and technologies",
        "technologies",
        "tech stack",
        "technology stack",
        "technical stack",
        "programming languages",
        "frameworks and libraries",
        "frameworks & libraries",
        "tools and technologies",
        "tools & technologies",
        "software skills",
        "computer skills",
        "technical competencies",
        "areas of expertise",
    ],
    "experience": [
        "experience",
        "work experience",
        "professional experience",
        "employment history",
        "work history",
        "internships",
        "internship experience",
    ],
    "projects": [
        "projects",
        "project experience",
        "academic projects",
        "personal projects",
        "technical projects",
    ],
    "achievements": [
        "achievements",
        "accomplishments",
        "awards",
        "awards and achievements",
        "honors",
    ],
    "certifications": [
        "certifications",
        "certificates",
        "licenses and certifications",
        "professional certifications",
        "courses and certifications",
    ],
}

SECTION_NAMES = tuple(SECTION_ALIASES.keys())

MAX_NAME_LENGTH = 80
MAX_SKILL_LENGTH = 100

SKILL_CATEGORY_ALIASES = {
    "languages",
    "programming languages",
    "frameworks",
    "libraries",
    "frameworks and libraries",
    "frameworks & libraries",
    "databases",
    "database",
    "tools",
    "developer tools",
    "platforms",
    "cloud",
    "cloud platforms",
    "web technologies",
    "frontend",
    "backend",
    "machine learning",
    "ai/ml",
    "data science",
    "other skills",
    "technologies",
    "technical skills",
    "soft skills",
}


# =========================================================
# TEXT CLEANING
# =========================================================

def clean_text(text: str) -> str:
    """
    Normalize extracted resume text while
    preserving line breaks for section detection.
    """

    if not isinstance(text, str):
        raise ValueError(
            "Resume text must be a string."
        )

    text = (
        text.replace("\r\n", "\n")
        .replace("\r", "\n")
        .replace("\u00a0", " ")
    )

    text = re.sub(
        r"[ \t]+",
        " ",
        text,
    )

    text = re.sub(
        r"\n[ \t]*\n+",
        "\n",
        text,
    )

    return text.strip()


# =========================================================
# PERSONAL INFORMATION
# =========================================================

def extract_email(text: str) -> str | None:
    match = re.search(
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
        text,
    )

    return match.group(0) if match else None


def extract_phone(text: str) -> str | None:
    pattern = (
        r"(?<!\d)"
        r"(?:\+91[\s-]?|91[\s-]?)?"
        r"[6-9]\d{4}[\s-]?\d{5}"
        r"(?!\d)"
    )

    match = re.search(pattern, text)

    return match.group(0).strip() if match else None


def _normalize_name_line(line: str) -> str:
    line = re.sub(
        r"^[\s•●▪*#-]+",
        "",
        line,
    )

    return re.sub(
        r"\s+",
        " ",
        line,
    ).strip()


def extract_name(text: str) -> str | None:
    """
    Heuristically identify candidate name
    near the start of the resume.
    """

    lines = [
        _normalize_name_line(line)
        for line in text.splitlines()
        if line.strip()
    ]

    excluded_words = {
        "resume",
        "curriculum vitae",
        "cv",
        "profile",
        "summary",
        "professional summary",
        "contact",
        "contact details",
    }

    for line in lines[:8]:
        if not line:
            continue

        if line.casefold() in excluded_words:
            continue

        if len(line) > MAX_NAME_LENGTH:
            continue

        if "@" in line:
            continue

        if re.search(r"\d", line):
            continue

        if re.search(
            r"https?://|www\.",
            line,
            flags=re.IGNORECASE,
        ):
            continue

        if any(
            char in line
            for char in ("|", ":", "/", "\\")
        ):
            continue

        words = line.split()

        if not 2 <= len(words) <= 5:
            continue

        if not all(
            re.fullmatch(
                r"[A-Za-z][A-Za-z.'-]*",
                word,
            )
            for word in words
        ):
            continue

        return line

    return None


# =========================================================
# HEADING NORMALIZATION
# =========================================================

def _normalize_heading(line: str) -> str:
    line = line.strip()

    line = re.sub(
        r"^[#*•●▪\s]+",
        "",
        line,
    )

    line = re.sub(
        r"[*#\s]+$",
        "",
        line,
    )

    line = line.strip(" :-–—\t")

    line = re.sub(
        r"\s+",
        " ",
        line,
    )

    return line.casefold()


def _identify_section(line: str) -> str | None:
    heading = _normalize_heading(line)

    if not heading:
        return None

    for section_name, aliases in SECTION_ALIASES.items():
        if heading in aliases:
            return section_name

    return None


def _identify_inline_heading(
    line: str,
) -> tuple[str, str] | None:
    """
    Example:
        Technical Skills: Python, FastAPI
        Tech Stack: React | Node.js | MongoDB
    """

    match = re.match(
        r"^\s*(.{2,60}?)\s*:\s*(.+?)\s*$",
        line,
    )

    if not match:
        return None

    heading = _normalize_heading(match.group(1))
    content = match.group(2).strip()

    for section_name, aliases in SECTION_ALIASES.items():
        if heading in aliases:
            return section_name, content

    return None


def find_section_positions(
    text: str,
) -> list[tuple[int, str]]:
    """
    Keep original function signature
    for backward compatibility.
    """

    positions = []

    for index, line in enumerate(text.splitlines()):
        section = _identify_section(line)

        if section is None:
            inline = _identify_inline_heading(line)

            if inline:
                section = inline[0]

        if section:
            positions.append((index, section))

    return positions


# =========================================================
# SECTION EXTRACTION
# =========================================================

def extract_sections(
    text: str,
) -> dict[str, str]:
    """
    Extract resume sections and include
    content from inline section headings.
    """

    lines = text.splitlines()

    positions = find_section_positions(text)

    sections = {
        name: ""
        for name in SECTION_NAMES
    }

    for index, (start, section_name) in enumerate(positions):
        content_lines = []

        inline = _identify_inline_heading(lines[start])

        if inline and inline[0] == section_name:
            content_lines.append(inline[1])

        content_start = start + 1

        if index + 1 < len(positions):
            content_end = positions[index + 1][0]
        else:
            content_end = len(lines)

        content_lines.extend(
            line.strip()
            for line in lines[content_start:content_end]
            if line.strip()
        )

        content = "\n".join(content_lines).strip()

        if not content:
            continue

        if sections[section_name]:
            sections[section_name] += "\n" + content
        else:
            sections[section_name] = content

    return sections


# =========================================================
# SKILLS EXTRACTION
# =========================================================

def _normalize_skill(skill: str) -> str:
    skill = re.sub(
        r"^[\s•●▪*+-]+",
        "",
        skill,
    )

    skill = re.sub(
        r"\s+",
        " ",
        skill,
    )

    return skill.strip(" .;:-\"'")


def extract_skills(
    skills_text: str,
) -> list[str]:
    """
    Supported formats:

        Python, Java, SQL
        React | Node.js | MongoDB
        Languages: Python, Java
        Frameworks: FastAPI, React
        - Machine Learning
        • Docker
    """

    if not skills_text:
        return []

    skills = []
    seen = set()

    for raw_line in skills_text.splitlines():
        line = raw_line.strip()

        if not line:
            continue

        # Remove bullets
        line = re.sub(
            r"^[•●▪*+-]\s*",
            "",
            line,
        )

        # Remove recognized category labels
        if ":" in line:
            label, content = line.split(":", 1)

            if (
                _normalize_heading(label)
                in SKILL_CATEGORY_ALIASES
            ):
                line = content.strip()

        # Split skills
        parts = re.split(
            r"[,|;]",
            line,
        )

        for part in parts:
            skill = _normalize_skill(part)

            if not skill:
                continue

            if len(skill) > MAX_SKILL_LENGTH:
                continue

            # Avoid accidentally storing full URLs
            if re.search(
                r"https?://|www\.",
                skill,
                flags=re.IGNORECASE,
            ):
                continue

            key = skill.casefold()

            if key in seen:
                continue

            seen.add(key)
            skills.append(skill)

    return skills


# =========================================================
# MAIN STRUCTURED PARSER
# =========================================================

def extract_resume_structure(
    text: str,
) -> dict[str, Any]:
    """
    Convert extracted resume text into
    structured data for HireNexus.

    Existing response keys remain unchanged.
    """

    cleaned_text = clean_text(text)

    if not cleaned_text:
        raise ValueError(
            "Resume text cannot be empty."
        )

    sections = extract_sections(cleaned_text)

    return {
        "personal_information": {
            "name": extract_name(cleaned_text),
            "email": extract_email(cleaned_text),
            "phone": extract_phone(cleaned_text),
        },
        "summary": sections["summary"],
        "education": sections["education"],
        "skills": extract_skills(
            sections["skills"]
        ),
        "experience": sections["experience"],
        "projects": sections["projects"],
        "achievements": sections["achievements"],
        "certifications": sections["certifications"],
    }

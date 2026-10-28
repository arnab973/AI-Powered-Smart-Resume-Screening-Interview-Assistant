from typing import Any


EXPECTED_SECTIONS = {
    "summary": [
        "summary",
        "professional summary",
        "profile",
        "objective",
    ],
    "education": [
        "education",
        "academic background",
        "academic qualification",
    ],
    "skills": [
        "skills",
        "technical skills",
        "technical expertise",
    ],
    "experience": [
        "experience",
        "work experience",
        "professional experience",
        "internships",
    ],
    "projects": [
        "projects",
        "project experience",
    ],
    "achievements": [
        "achievements",
        "accomplishments",
    ],
    "certifications": [
        "certifications",
        "certificates",
    ],
}


def normalize_section_name(section_name: str) -> str:
    """
    Normalize a section name for comparison.
    """

    if not section_name:
        return ""

    return " ".join(
        section_name.lower().strip().split()
    )


def detect_sections(
    resume_text: str,
) -> dict[str, bool]:
    """
    Detect expected resume sections from raw resume text.
    """

    if not resume_text:
        return {
            section: False
            for section in EXPECTED_SECTIONS
        }

    normalized_text = resume_text.lower()

    detected_sections = {}

    for section, aliases in EXPECTED_SECTIONS.items():
        detected = False

        for alias in aliases:
            normalized_alias = normalize_section_name(alias)

            if normalized_alias in normalized_text:
                detected = True
                break

        detected_sections[section] = detected

    return detected_sections


def analyze_sections(
    resume_text: str,
) -> dict[str, Any]:
    """
    Analyze resume section completeness.
    """

    detected_sections = detect_sections(resume_text)

    present_sections = [
        section
        for section, present in detected_sections.items()
        if present
    ]

    missing_sections = [
        section
        for section, present in detected_sections.items()
        if not present
    ]

    total_sections = len(detected_sections)
    total_present = len(present_sections)

    if total_sections == 0:
        completeness_percentage = 0.0
    else:
        completeness_percentage = (
            total_present / total_sections
        ) * 100

    return {
        "detected_sections": detected_sections,
        "present_sections": present_sections,
        "missing_sections": missing_sections,
        "total_sections": total_sections,
        "total_present": total_present,
        "total_missing": len(missing_sections),
        "completeness_percentage": round(
            completeness_percentage,
            2,
        ),
    }
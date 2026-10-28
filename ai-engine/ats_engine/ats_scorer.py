from typing import Any


KEYWORD_WEIGHT = 0.70
SECTION_WEIGHT = 0.30


def calculate_ats_score(
    keyword_match_percentage: float,
    section_completeness_percentage: float,
) -> float:
    """
    Calculate the overall ATS compatibility score.

    Keyword matching has a higher weight because
    job-related keyword relevance is important for ATS screening.
    """

    keyword_score = max(
        0.0,
        min(100.0, keyword_match_percentage),
    )

    section_score = max(
        0.0,
        min(100.0, section_completeness_percentage),
    )

    ats_score = (
        keyword_score * KEYWORD_WEIGHT
        + section_score * SECTION_WEIGHT
    )

    return round(
        max(0.0, min(100.0, ats_score)),
        2,
    )


def generate_ats_suggestions(
    keyword_match_percentage: float,
    section_completeness_percentage: float,
    missing_keywords: list[str],
    missing_sections: list[str],
) -> list[str]:
    """
    Generate resume improvement suggestions.
    """

    suggestions = []

    if keyword_match_percentage < 50:
        suggestions.append(
            "Improve keyword alignment by adding relevant "
            "skills and terminology from the job description."
        )
    elif keyword_match_percentage < 75:
        suggestions.append(
            "Strengthen keyword alignment by highlighting "
            "more relevant technical skills and experience."
        )
    else:
        suggestions.append(
            "Keyword alignment is strong. Make sure the matched "
            "skills are supported by relevant projects or experience."
        )

    if missing_keywords:
        keywords = ", ".join(missing_keywords[:5])

        suggestions.append(
            f"Consider adding relevant keywords where applicable: "
            f"{keywords}."
        )

    if section_completeness_percentage < 60:
        suggestions.append(
            "Several important resume sections are missing. "
            "Add the missing sections to improve resume completeness."
        )
    elif section_completeness_percentage < 85:
        suggestions.append(
            "Consider adding the missing resume sections "
            "to improve overall completeness."
        )

    if missing_sections:
        sections = ", ".join(missing_sections)

        suggestions.append(
            f"Missing sections detected: {sections}."
        )

    return suggestions


def score_resume(
    keyword_analysis: dict[str, Any],
    section_analysis: dict[str, Any],
) -> dict[str, Any]:
    """
    Generate a complete ATS scoring result.
    """

    keyword_match_percentage = float(
        keyword_analysis.get(
            "match_percentage",
            0.0,
        )
    )

    section_completeness_percentage = float(
        section_analysis.get(
            "completeness_percentage",
            0.0,
        )
    )

    missing_keywords = keyword_analysis.get(
        "missing_keywords",
        [],
    )

    missing_sections = section_analysis.get(
        "missing_sections",
        [],
    )

    ats_score = calculate_ats_score(
        keyword_match_percentage=keyword_match_percentage,
        section_completeness_percentage=section_completeness_percentage,
    )

    suggestions = generate_ats_suggestions(
        keyword_match_percentage=keyword_match_percentage,
        section_completeness_percentage=section_completeness_percentage,
        missing_keywords=missing_keywords,
        missing_sections=missing_sections,
    )

    return {
        "ats_score": ats_score,
        "keyword_match_percentage": round(
            keyword_match_percentage,
            2,
        ),
        "section_completeness_percentage": round(
            section_completeness_percentage,
            2,
        ),
        "missing_keywords": missing_keywords,
        "missing_sections": missing_sections,
        "suggestions": suggestions,
    }
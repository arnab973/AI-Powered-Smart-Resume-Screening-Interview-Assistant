
from typing import Any


def clamp_score(score: float) -> float:
    """
    Keep score between 0 and 10.
    """
    return round(max(0.0, min(10.0, float(score))), 2)


def calculate_overall_score(
    technical_score: float,
    relevance_score: float,
    clarity_score: float,
    completeness_score: float,
) -> float:
    """
    Calculate the overall answer evaluation score.

    Weights:
    - Technical correctness: 40%
    - Relevance: 25%
    - Clarity: 15%
    - Completeness: 20%
    """

    technical_score = clamp_score(technical_score)
    relevance_score = clamp_score(relevance_score)
    clarity_score = clamp_score(clarity_score)
    completeness_score = clamp_score(completeness_score)

    overall_score = (
        technical_score * 0.40
        + relevance_score * 0.25
        + clarity_score * 0.15
        + completeness_score * 0.20
    )

    return clamp_score(overall_score)


def get_performance_level(score: float) -> str:
    """
    Convert the overall score into a descriptive performance level.
    """

    score = clamp_score(score)

    if score >= 8.5:
        return "Excellent"

    if score >= 7.0:
        return "Good"

    if score >= 5.0:
        return "Average"

    if score >= 3.0:
        return "Needs Improvement"

    return "Poor"


def calculate_evaluation_score(
    technical_score: float,
    relevance_score: float,
    clarity_score: float,
    completeness_score: float,
) -> dict[str, Any]:
    """
    Generate the complete score summary.
    """

    overall_score = calculate_overall_score(
        technical_score=technical_score,
        relevance_score=relevance_score,
        clarity_score=clarity_score,
        completeness_score=completeness_score,
    )

    performance_level = get_performance_level(
        overall_score
    )

    return {
        "technical_score": clamp_score(
            technical_score
        ),
        "relevance_score": clamp_score(
            relevance_score
        ),
        "clarity_score": clamp_score(
            clarity_score
        ),
        "completeness_score": clamp_score(
            completeness_score
        ),
        "overall_score": overall_score,
        "performance_level": performance_level,
    }

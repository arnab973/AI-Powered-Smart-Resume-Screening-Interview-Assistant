from typing import Any


def generate_skill_gap(
    semantic_matches: list[dict[str, Any]],
    semantic_missing: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Generate skill gap analysis from semantic skill matching results.
    """

    matched_skills = []
    missing_skills = []
    improvement_areas = []

    for match in semantic_matches:
        matched_skills.append({
            "required_skill": match["required_skill"],
            "matched_resume_skill": match["matched_resume_skill"],
            "similarity_percentage": match["similarity_percentage"],
        })

    for missing in semantic_missing:
        required_skill = missing["required_skill"]
        similarity_percentage = missing["similarity_percentage"]

        missing_skills.append({
            "required_skill": required_skill,
            "closest_resume_skill": missing["matched_resume_skill"],
            "similarity_percentage": similarity_percentage,
        })

        if similarity_percentage < 30:
            priority = "High"
        elif similarity_percentage < 50:
            priority = "Medium"
        else:
            priority = "Low"

        improvement_areas.append({
            "skill": required_skill,
            "priority": priority,
            "similarity_percentage": similarity_percentage,
            "recommendation": (
                f"Consider learning or strengthening {required_skill} "
                f"and adding relevant projects or experience to the resume."
            ),
        })

    return {
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "improvement_areas": improvement_areas,
        "total_matched": len(matched_skills),
        "total_missing": len(missing_skills),
    }


def analyze_skill_gap(
    matching_result: dict[str, Any],
) -> dict[str, Any]:
    """
    Analyze skill gaps directly from match_skills() output.
    """

    if not matching_result:
        return {
            "matched_skills": [],
            "missing_skills": [],
            "improvement_areas": [],
            "total_matched": 0,
            "total_missing": 0,
        }

    semantic_matches = matching_result.get(
        "semantic_matches",
        [],
    )

    semantic_missing = matching_result.get(
        "semantic_missing",
        [],
    )

    return generate_skill_gap(
        semantic_matches=semantic_matches,
        semantic_missing=semantic_missing,
    )
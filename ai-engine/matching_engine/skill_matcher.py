
from typing import Any

from matching_engine.embeddings import (
    generate_embeddings,
)
from matching_engine.semantic_matcher import (
    calculate_cosine_similarity,
)


DEFAULT_MATCH_THRESHOLD = 0.60


def normalize_skill(skill: str) -> str:
    if not skill:
        return ""

    normalized = skill.lower().strip()

    normalized = normalized.replace(
        "javascript",
        "js",
    )

    normalized = normalized.replace(
        "typescript",
        "ts",
    )

    normalized = " ".join(
        normalized.split()
    )

    return normalized


def exact_skill_match(
    resume_skills: list[str],
    required_skills: list[str],
) -> tuple[list[str], list[str]]:
    normalized_resume = {
        normalize_skill(skill): skill
        for skill in resume_skills
        if normalize_skill(skill)
    }

    matched_skills = []
    missing_skills = []

    for required_skill in required_skills:
        normalized_required = normalize_skill(
            required_skill
        )

        if not normalized_required:
            continue

        if normalized_required in normalized_resume:
            matched_skills.append(
                normalized_resume[
                    normalized_required
                ]
            )
        else:
            missing_skills.append(
                required_skill
            )

    return matched_skills, missing_skills


def semantic_skill_match(
    resume_skills: list[str],
    required_skills: list[str],
    threshold: float = DEFAULT_MATCH_THRESHOLD,
) -> list[dict[str, Any]]:

    if not resume_skills or not required_skills:
        return []

    valid_resume_skills = [
        skill.strip()
        for skill in resume_skills
        if skill and skill.strip()
    ]

    valid_required_skills = [
        skill.strip()
        for skill in required_skills
        if skill and skill.strip()
    ]

    if not valid_resume_skills or not valid_required_skills:
        return []

    resume_embeddings = generate_embeddings(
        valid_resume_skills
    )

    required_embeddings = generate_embeddings(
        valid_required_skills
    )

    results = []

    for required_index, required_skill in enumerate(
        valid_required_skills
    ):
        best_match = None

        for resume_index, resume_skill in enumerate(
            valid_resume_skills
        ):
            similarity = calculate_cosine_similarity(
                required_embeddings[required_index],
                resume_embeddings[resume_index],
            )

            if (
                best_match is None
                or similarity > best_match["similarity"]
            ):
                best_match = {
                    "required_skill": required_skill,
                    "matched_resume_skill": resume_skill,
                    "similarity": similarity,
                    "similarity_percentage": round(
                        max(0.0, similarity) * 100,
                        2,
                    ),
                }

        if best_match:
            normalized_required = normalize_skill(
                required_skill
            )

            normalized_resume = normalize_skill(
                best_match["matched_resume_skill"]
            )

            exact_match = (
                normalized_required
                == normalized_resume
            )

            best_match["is_exact_match"] = (
                exact_match
            )

            best_match["is_match"] = (
                exact_match
                or best_match["similarity"] >= threshold
            )

            if exact_match:
                best_match["similarity"] = 1.0
                best_match[
                    "similarity_percentage"
                ] = 100.0

            results.append(best_match)

    return results


def match_skills(
    resume_skills: list[str],
    required_skills: list[str],
    threshold: float = DEFAULT_MATCH_THRESHOLD,
) -> dict[str, Any]:

    matched_exact, missing_exact = exact_skill_match(
        resume_skills=resume_skills,
        required_skills=required_skills,
    )

    semantic_results = semantic_skill_match(
        resume_skills=resume_skills,
        required_skills=required_skills,
        threshold=threshold,
    )

    semantic_matched = []
    semantic_missing = []

    exact_skill_names = {
        normalize_skill(skill)
        for skill in matched_exact
    }

    for result in semantic_results:
        required_skill = result.get(
            "required_skill",
            ""
        )

        normalized_required = normalize_skill(
            required_skill
        )

        if normalized_required in exact_skill_names:
            result["is_exact_match"] = True
            result["is_match"] = True
            result["similarity"] = 1.0
            result["similarity_percentage"] = 100.0

        if result["is_match"]:
            semantic_matched.append(result)
        else:
            semantic_missing.append(result)

    return {
        "exact_matched_skills": matched_exact,
        "exact_missing_skills": missing_exact,
        "semantic_matches": semantic_matched,
        "semantic_missing": semantic_missing,
    }

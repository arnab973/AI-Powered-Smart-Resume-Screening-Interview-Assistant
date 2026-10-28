
import json
import logging
import re
from typing import Any

from interview_engine.question_templates import (
    get_hr_templates,
    get_skill_gap_templates,
    get_technical_templates,
)
from llm.openai_client import get_openai_client
from llm.prompts import (
    INTERVIEW_SYSTEM_PROMPT,
    build_interview_prompt,
)

logger = logging.getLogger(__name__)

KNOWN_SKILLS = [
    "Python", "FastAPI", "Machine Learning",
    "MongoDB", "Scikit-learn", "REST APIs",
    "React", "Next.js", "Node.js", "Express.js",
    "JavaScript", "TypeScript", "Java", "SQL",
    "Docker", "AWS", "TensorFlow", "PyTorch",
    "NLP", "Computer Vision", "Git",
]


def _clean_skills(skills: Any) -> list[str]:
    if isinstance(skills, str):
        skills = [skills]

    if not isinstance(skills, list):
        return []

    result = []
    seen = set()

    for item in skills:
        if isinstance(item, dict):
            item = (
                item.get("required_skill")
                or item.get("skill")
                or item.get("name")
            )

        if not isinstance(item, str):
            continue

        for part in re.split(r"[,;\n]+", item):
            skill = part.strip().strip("\"'[] ")
            key = skill.casefold()

            if skill and key not in seen:
                seen.add(key)
                result.append(skill)

    return result


def _job_skills(description: str) -> list[str]:
    description = description or ""

    return [
        skill
        for skill in KNOWN_SKILLS
        if re.search(
            r"(?<!\w)" + re.escape(skill) + r"(?!\w)",
            description,
            re.IGNORECASE,
        )
    ]


def _build_question(
    template: dict[str, Any],
    skill: str | None = None,
) -> dict[str, Any]:
    question_text = template["template"]

    return {
        "question": question_text.format(
            skill=skill or "software development"
        ),
        "type": template["type"],
        "difficulty": template.get("difficulty", "medium"),
        "skill": skill,
    }


def _generate_from_templates(
    templates: list[dict],
    count: int,
    skills: list[str] | None = None,
) -> list[dict[str, Any]]:
    if count <= 0:
        return []

    if not templates:
        raise RuntimeError(
            "Interview question templates are unavailable."
        )

    questions = []
    skills = skills or []

    for index in range(count):
        template = templates[index % len(templates)]
        skill = skills[index % len(skills)] if skills else None

        questions.append(_build_question(template, skill))

    return questions


def generate_technical_questions(
    skills: list[str],
    question_count: int = 5,
) -> list[dict[str, Any]]:
    return _generate_from_templates(
        get_technical_templates(),
        question_count,
        _clean_skills(skills),
    )


def generate_hr_questions(
    question_count: int = 3,
) -> list[dict[str, Any]]:
    return _generate_from_templates(
        get_hr_templates(),
        question_count,
    )


def generate_skill_gap_questions(
    missing_skills: list[str],
    question_count: int = 2,
) -> list[dict[str, Any]]:
    return _generate_from_templates(
        get_skill_gap_templates(),
        question_count,
        _clean_skills(missing_skills),
    )


def _normalize_questions(
    questions: Any,
    question_type: str,
) -> list[dict[str, Any]]:
    if not isinstance(questions, list):
        return []

    result = []

    for item in questions:
        if not isinstance(item, dict):
            continue

        text = item.get("question")

        if not isinstance(text, str) or not text.strip():
            continue

        difficulty = item.get("difficulty", "medium")
        if difficulty not in ("easy", "medium", "hard"):
            difficulty = "medium"

        skill = item.get("skill")
        if not isinstance(skill, str):
            skill = None

        result.append({
            "question": text.strip(),
            "type": question_type,
            "difficulty": difficulty,
            "skill": skill,
        })

    return result


def _parse_ai_response(response_text: str) -> dict:
    if not isinstance(response_text, str):
        raise ValueError("AI response is not text.")

    response_text = response_text.strip()

    if response_text.startswith("```"):
        response_text = re.sub(
            r"^```(?:json)?\s*",
            "",
            response_text,
            flags=re.IGNORECASE,
        )
        response_text = re.sub(
            r"\s*```$",
            "",
            response_text,
        )

    data = json.loads(response_text)

    if not isinstance(data, dict):
        raise ValueError("AI response must be a JSON object.")

    return {
        "technical_questions": _normalize_questions(
            data.get("technical_questions"),
            "technical",
        ),
        "skill_gap_questions": _normalize_questions(
            data.get("skill_gap_questions"),
            "skill_gap",
        ),
        "hr_questions": _normalize_questions(
            data.get("hr_questions"),
            "hr",
        ),
    }


def _generate_ai_questions(
    resume_skills: list[str],
    matched_skills: list[str],
    missing_skills: list[str],
    job_description: str,
    technical_question_count: int,
    skill_gap_question_count: int,
    hr_question_count: int,
) -> dict:
    prompt = build_interview_prompt(
        resume_skills=resume_skills,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        job_description=job_description,
        technical_question_count=technical_question_count,
        skill_gap_question_count=skill_gap_question_count,
        hr_question_count=hr_question_count,
    )

    client = get_openai_client()

    response_text = client.generate_text(
        prompt=prompt,
        system_prompt=INTERVIEW_SYSTEM_PROMPT,
        temperature=0.7,
        max_tokens=3500,
    )

    return _parse_ai_response(response_text)


def _complete_category(
    ai_questions: list[dict],
    fallback_questions: list[dict],
    expected_count: int,
) -> tuple[list[dict], bool]:
    selected = ai_questions[:expected_count]
    used_fallback = False

    seen = {
        q["question"].strip().casefold()
        for q in selected
    }

    for question in fallback_questions:
        if len(selected) >= expected_count:
            break

        key = question["question"].strip().casefold()

        if key not in seen:
            selected.append(question)
            seen.add(key)
            used_fallback = True

    # Preserve the requested count even when a small
    # template library produces repeated questions.
    index = 0
    while len(selected) < expected_count:
        if not fallback_questions:
            raise RuntimeError(
                "Insufficient interview question templates."
            )

        question = fallback_questions[
            index % len(fallback_questions)
        ].copy()

        selected.append(question)
        used_fallback = True
        index += 1

    return selected, used_fallback


def _number_questions(
    technical: list[dict],
    skill_gap: list[dict],
    hr: list[dict],
) -> dict:
    number = 1

    for question in technical + skill_gap + hr:
        question["question_number"] = number
        number += 1

    all_questions = technical + skill_gap + hr

    return {
        "total_questions": len(all_questions),
        "technical_questions": technical,
        "skill_gap_questions": skill_gap,
        "hr_questions": hr,
        "questions": all_questions,
    }


def generate_interview_questions(
    resume_skills: list[str],
    matched_skills: list[str] | None = None,
    missing_skills: list[str] | None = None,
    job_description: str = "",
    technical_question_count: int = 5,
    hr_question_count: int = 3,
    skill_gap_question_count: int = 2,
) -> dict[str, Any]:

    resume_skills = _clean_skills(resume_skills)
    matched_skills = _clean_skills(matched_skills)
    missing_skills = _clean_skills(missing_skills)

    job_skills = _job_skills(job_description)

    # Use job skills as technical topics when resume
    # skills have not been extracted.
    technical_skills = (
        matched_skills
        or resume_skills
        or job_skills
        or ["software development"]
    )

    # Fallback topics are not proof that the
    # candidate actually lacks these skills.
    gap_topics = missing_skills

    if not gap_topics:
        known = {
            skill.casefold()
            for skill in resume_skills + matched_skills
        }

        gap_topics = [
            skill
            for skill in job_skills
            if skill.casefold() not in known
        ]

    if not gap_topics:
        gap_topics = job_skills or technical_skills

    fallback_technical = generate_technical_questions(
        technical_skills,
        technical_question_count,
    )

    fallback_skill_gap = generate_skill_gap_questions(
        gap_topics,
        skill_gap_question_count,
    )

    fallback_hr = generate_hr_questions(
        hr_question_count,
    )

    ai_result = {
        "technical_questions": [],
        "skill_gap_questions": [],
        "hr_questions": [],
    }

    ai_succeeded = False

    try:
        ai_result = _generate_ai_questions(
            resume_skills=resume_skills,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            job_description=job_description,
            technical_question_count=technical_question_count,
            skill_gap_question_count=skill_gap_question_count,
            hr_question_count=hr_question_count,
        )
        ai_succeeded = True

    except Exception:
        logger.exception(
            "OpenAI interview generation failed; "
            "using template fallback."
        )

    technical, tech_fallback = _complete_category(
        ai_result["technical_questions"],
        fallback_technical,
        technical_question_count,
    )

    skill_gap, gap_fallback = _complete_category(
        ai_result["skill_gap_questions"],
        fallback_skill_gap,
        skill_gap_question_count,
    )

    hr, hr_fallback = _complete_category(
        ai_result["hr_questions"],
        fallback_hr,
        hr_question_count,
    )

    result = _number_questions(
        technical,
        skill_gap,
        hr,
    )

    used_fallback = (
        tech_fallback
        or gap_fallback
        or hr_fallback
    )

    if not ai_succeeded:
        method = "template_fallback"
    elif used_fallback:
        method = "openai_with_template_fallback"
    else:
        method = "openai"

    result["generation_method"] = method

    return result

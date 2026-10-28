
import json
from typing import Any

from llm.openai_client import get_openai_client

from evaluation_engine.scoring import calculate_evaluation_score


EVALUATION_SYSTEM_PROMPT = """
You are an AI interview answer evaluator for a recruitment platform.

Your task is to evaluate a candidate's answer to an interview question.

Evaluate the answer based only on:
- The interview question
- The candidate's answer
- The expected skill or topic, if provided

Do not assume information that is not present in the candidate's answer.

Evaluate these four areas:

1. Technical correctness
2. Relevance to the question
3. Clarity of explanation
4. Completeness of the answer

Use a score from 0 to 10 for each area.

Rules:
- 0 means completely incorrect or irrelevant.
- 10 means excellent.
- Give realistic scores.
- Do not give high scores only because the answer is long.
- Identify important technical mistakes when present.
- Keep feedback professional and useful.
- Give specific improvement suggestions.
- Do not invent candidate experience.

Return ONLY valid JSON.
"""


def _clean_text(text: str | None) -> str:
    """
    Clean input text.
    """

    if not text:
        return ""

    return " ".join(
        text.strip().split()
    )


def _validate_evaluation_response(
    data: dict[str, Any],
) -> dict[str, Any]:
    """
    Validate and normalize the AI evaluation response.
    """

    if not isinstance(data, dict):
        raise ValueError(
            "AI evaluation response must be a JSON object."
        )

    required_fields = [
        "technical_score",
        "relevance_score",
        "clarity_score",
        "completeness_score",
    ]

    for field in required_fields:
        if field not in data:
            raise ValueError(
                f"Missing evaluation field: {field}"
            )

        try:
            data[field] = float(data[field])
        except (TypeError, ValueError):
            raise ValueError(
                f"Invalid score for field: {field}"
            )

    feedback = data.get(
        "feedback",
        "",
    )

    improvement = data.get(
        "improvement",
        "",
    )

    strengths = data.get(
        "strengths",
        [],
    )

    weaknesses = data.get(
        "weaknesses",
        [],
    )

    if not isinstance(feedback, str):
        feedback = str(feedback)

    if not isinstance(improvement, str):
        improvement = str(improvement)

    if not isinstance(strengths, list):
        strengths = []

    if not isinstance(weaknesses, list):
        weaknesses = []

    strengths = [
        str(item).strip()
        for item in strengths
        if str(item).strip()
    ]

    weaknesses = [
        str(item).strip()
        for item in weaknesses
        if str(item).strip()
    ]

    score_result = calculate_evaluation_score(
        technical_score=data["technical_score"],
        relevance_score=data["relevance_score"],
        clarity_score=data["clarity_score"],
        completeness_score=data["completeness_score"],
    )

    return {
        **score_result,
        "feedback": feedback.strip(),
        "improvement": improvement.strip(),
        "strengths": strengths,
        "weaknesses": weaknesses,
    }


def _build_evaluation_prompt(
    question: str,
    answer: str,
    skill: str | None = None,
) -> str:
    """
    Build the prompt used for AI answer evaluation.
    """

    skill_text = (
        skill.strip()
        if skill and skill.strip()
        else "Not specified"
    )

    return f"""
Evaluate the following candidate interview answer.

INTERVIEW QUESTION:
{question}

CANDIDATE ANSWER:
{answer}

RELEVANT SKILL / TOPIC:
{skill_text}

Evaluate the candidate's answer using the following criteria:

- Technical correctness: 0 to 10
- Relevance: 0 to 10
- Clarity: 0 to 10
- Completeness: 0 to 10

Also provide:

- strengths: important things the candidate did well
- weaknesses: important problems or missing points
- feedback: concise overall feedback
- improvement: specific advice for improving the answer

Return exactly this JSON structure:

{{
    "technical_score": 0,
    "relevance_score": 0,
    "clarity_score": 0,
    "completeness_score": 0,
    "strengths": [
        "Strength 1"
    ],
    "weaknesses": [
        "Weakness 1"
    ],
    "feedback": "Overall feedback",
    "improvement": "Specific improvement suggestion"
}}
""".strip()


def evaluate_answer(
    question: str,
    answer: str,
    skill: str | None = None,
) -> dict[str, Any]:
    """
    Evaluate a candidate's interview answer using OpenAI.
    """

    question = _clean_text(question)
    answer = _clean_text(answer)

    if not question:
        raise ValueError(
            "Interview question is required."
        )

    if not answer:
        raise ValueError(
            "Candidate answer is required."
        )

    prompt = _build_evaluation_prompt(
        question=question,
        answer=answer,
        skill=skill,
    )

    client = get_openai_client()

    response_text = client.generate_text(
        prompt=prompt,
        system_prompt=EVALUATION_SYSTEM_PROMPT,
        temperature=0.2,
        max_tokens=1200,
    )

    response_text = response_text.strip()

    # Handle Markdown JSON response
    if response_text.startswith("```"):
        response_text = (
            response_text
            .replace("```json", "", 1)
            .replace("```", "")
            .strip()
        )

    try:
        data = json.loads(response_text)
    except json.JSONDecodeError as exc:
        raise ValueError(
            "OpenAI returned invalid JSON."
        ) from exc

    return _validate_evaluation_response(
        data
    )

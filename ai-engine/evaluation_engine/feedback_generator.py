
import json
from typing import Any

from llm.openai_client import get_openai_client


FEEDBACK_SYSTEM_PROMPT = """
You are an AI interview feedback generator for a recruitment platform.

Your task is to generate clear, professional feedback for a candidate
based on an already completed interview answer evaluation.

Use only the information provided.

Do not invent candidate experience, skills, achievements, or facts.

The feedback should:
- Be professional and constructive.
- Clearly explain what the candidate did well.
- Identify the most important weaknesses.
- Provide practical improvement suggestions.
- Be concise but useful.
- Avoid unnecessary repetition.

Return ONLY valid JSON.
"""


def _clean_text(text: str | None) -> str:
    """
    Clean text input.
    """
    if not text:
        return ""

    return " ".join(text.strip().split())


def _clean_list(values: Any) -> list[str]:
    """
    Convert a list-like value into a clean list of strings.
    """
    if not isinstance(values, list):
        return []

    return [
        str(item).strip()
        for item in values
        if str(item).strip()
    ]


def _build_feedback_prompt(
    question: str,
    answer: str,
    evaluation: dict[str, Any],
) -> str:
    """
    Build the prompt used for generating candidate feedback.
    """

    strengths = _clean_list(
        evaluation.get("strengths", [])
    )

    weaknesses = _clean_list(
        evaluation.get("weaknesses", [])
    )

    return f"""
Generate professional interview feedback for the candidate.

INTERVIEW QUESTION:
{question}

CANDIDATE ANSWER:
{answer}

EVALUATION SCORES:
Technical Correctness: {evaluation.get("technical_score", 0)}/10
Relevance: {evaluation.get("relevance_score", 0)}/10
Clarity: {evaluation.get("clarity_score", 0)}/10
Completeness: {evaluation.get("completeness_score", 0)}/10
Overall Score: {evaluation.get("overall_score", 0)}/10
Performance Level: {evaluation.get("performance_level", "Unknown")}

STRENGTHS:
{json.dumps(strengths, ensure_ascii=False)}

WEAKNESSES:
{json.dumps(weaknesses, ensure_ascii=False)}

EXISTING FEEDBACK:
{_clean_text(evaluation.get("feedback", ""))}

EXISTING IMPROVEMENT:
{_clean_text(evaluation.get("improvement", ""))}

Generate:

1. summary
   - A concise overall assessment.

2. strengths
   - Important positive points.

3. weaknesses
   - Important areas that need improvement.

4. improvement_plan
   - Practical suggestions for improving future answers.

5. interview_tip
   - One useful interview tip specifically related to this answer.

Return exactly this JSON structure:

{{
    "summary": "Overall assessment",
    "strengths": [
        "Strength 1"
    ],
    "weaknesses": [
        "Weakness 1"
    ],
    "improvement_plan": [
        "Improvement 1"
    ],
    "interview_tip": "One practical interview tip"
}}
""".strip()


def _validate_feedback_response(
    data: dict[str, Any],
) -> dict[str, Any]:
    """
    Validate and normalize the AI feedback response.
    """

    if not isinstance(data, dict):
        raise ValueError(
            "AI feedback response must be a JSON object."
        )

    summary = data.get("summary", "")
    interview_tip = data.get("interview_tip", "")

    if not isinstance(summary, str):
        summary = str(summary)

    if not isinstance(interview_tip, str):
        interview_tip = str(interview_tip)

    strengths = _clean_list(
        data.get("strengths", [])
    )

    weaknesses = _clean_list(
        data.get("weaknesses", [])
    )

    improvement_plan = _clean_list(
        data.get("improvement_plan", [])
    )

    return {
        "summary": summary.strip(),
        "strengths": strengths,
        "weaknesses": weaknesses,
        "improvement_plan": improvement_plan,
        "interview_tip": interview_tip.strip(),
    }


def generate_feedback(
    question: str,
    answer: str,
    evaluation: dict[str, Any],
) -> dict[str, Any]:
    """
    Generate professional candidate feedback using OpenAI.
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

    if not isinstance(evaluation, dict):
        raise ValueError(
            "Evaluation data must be a dictionary."
        )

    prompt = _build_feedback_prompt(
        question=question,
        answer=answer,
        evaluation=evaluation,
    )

    client = get_openai_client()

    response_text = client.generate_text(
        prompt=prompt,
        system_prompt=FEEDBACK_SYSTEM_PROMPT,
        temperature=0.3,
        max_tokens=1000,
    )

    response_text = response_text.strip()

    # Handle Markdown JSON response.
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
            "OpenAI returned invalid JSON for feedback."
        ) from exc

    return _validate_feedback_response(data)

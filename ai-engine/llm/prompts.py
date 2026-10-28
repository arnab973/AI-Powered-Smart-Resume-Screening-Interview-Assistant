
from typing import Any


INTERVIEW_SYSTEM_PROMPT = """
You are an AI technical interviewer for a recruitment platform.

Your task is to generate interview questions based strictly on:
- the candidate's resume skills
- matched skills for the job
- missing skills for the job
- the job description

Generate realistic interview questions that can be used in an actual technical interview.

Rules:
1. Do not invent candidate experience.
2. Do not claim that the candidate has a skill that is not provided.
3. Questions should test practical understanding, not only definitions.
4. Include technical, skill-gap, and HR questions.
5. Questions must be clear and professional.
6. Avoid duplicate or nearly identical questions.
7. Return ONLY valid JSON.
"""


def build_interview_prompt(
    resume_skills: list[str],
    matched_skills: list[str],
    missing_skills: list[str],
    job_description: str,
    technical_question_count: int = 5,
    skill_gap_question_count: int = 2,
    hr_question_count: int = 3,
) -> str:
    """
    Build the prompt used by the LLM to generate interview questions.
    """

    resume_skills_text = ", ".join(resume_skills) if resume_skills else "None"
    matched_skills_text = ", ".join(matched_skills) if matched_skills else "None"
    missing_skills_text = ", ".join(missing_skills) if missing_skills else "None"

    return f"""
Generate an interview question set for the following candidate and job.

JOB DESCRIPTION:
{job_description}

CANDIDATE RESUME SKILLS:
{resume_skills_text}

MATCHED SKILLS:
{matched_skills_text}

MISSING SKILLS:
{missing_skills_text}

Generate exactly:

- {technical_question_count} technical questions
- {skill_gap_question_count} skill-gap questions
- {hr_question_count} HR questions

Requirements for technical questions:
- Focus mainly on the matched skills.
- Include practical/project-oriented questions.
- Mix easy, medium, and hard difficulty.
- Avoid simple repetition.

Requirements for skill-gap questions:
- Focus only on the missing skills.
- Do not assume the candidate already knows those skills.
- Test learning approach, implementation approach, or conceptual understanding.

Requirements for HR questions:
- Keep them relevant to the candidate's technical background and projects.
- Include questions such as project experience, problem solving, teamwork, and learning.

Return exactly this JSON structure:

{{
    "technical_questions": [
        {{
            "question": "Question text",
            "type": "technical",
            "difficulty": "easy|medium|hard",
            "skill": "Relevant skill"
        }}
    ],
    "skill_gap_questions": [
        {{
            "question": "Question text",
            "type": "skill_gap",
            "difficulty": "medium|hard",
            "skill": "Missing skill"
        }}
    ],
    "hr_questions": [
        {{
            "question": "Question text",
            "type": "hr",
            "difficulty": "easy|medium|hard",
            "skill": null
        }}
    ]
}}
""".strip()


def build_interview_context(data: dict[str, Any]) -> dict[str, Any]:
    """
    Normalize interview input data before creating the prompt.
    """

    return {
        "resume_skills": data.get("resume_skills", []),
        "matched_skills": data.get("matched_skills", []),
        "missing_skills": data.get("missing_skills", []),
        "job_description": data.get("job_description", ""),
        "technical_question_count": data.get(
            "technical_question_count",
            5,
        ),
        "skill_gap_question_count": data.get(
            "skill_gap_question_count",
            2,
        ),
        "hr_question_count": data.get(
            "hr_question_count",
            3,
        ),
    }

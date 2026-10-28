
from typing import Any

from interview_engine.question_generator import generate_interview_questions


class InterviewManager:
    def create_interview(
        self,
        resume_skills: list[str],
        matched_skills: list[str] | None = None,
        missing_skills: list[str] | None = None,
        job_description: str = "",
        technical_question_count: int = 5,
        hr_question_count: int = 3,
        skill_gap_question_count: int = 2,
    ) -> dict[str, Any]:
        return generate_interview_questions(
            resume_skills=resume_skills,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            job_description=job_description,
            technical_question_count=technical_question_count,
            hr_question_count=hr_question_count,
            skill_gap_question_count=skill_gap_question_count,
        )


def create_interview(
    resume_skills: list[str],
    matched_skills: list[str] | None = None,
    missing_skills: list[str] | None = None,
    job_description: str = "",
    technical_question_count: int = 5,
    hr_question_count: int = 3,
    skill_gap_question_count: int = 2,
) -> dict[str, Any]:
    manager = InterviewManager()

    return manager.create_interview(
        resume_skills=resume_skills,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        job_description=job_description,
        technical_question_count=technical_question_count,
        hr_question_count=hr_question_count,
        skill_gap_question_count=skill_gap_question_count,
    )

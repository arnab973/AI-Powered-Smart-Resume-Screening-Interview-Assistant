from typing import Any

from ats_engine.ats_scorer import score_resume
from ats_engine.keyword_analyzer import calculate_keyword_match
from ats_engine.section_analyzer import analyze_sections

from matching_engine.skill_gap import analyze_skill_gap
from matching_engine.skill_matcher import match_skills


def run_screening_pipeline(
    resume_text: str,
    resume_skills: list[str],
    job_description: str,
    required_skills: list[str],
) -> dict[str, Any]:
    """
    Run the complete AI screening pipeline.

    Combines:
    - ATS keyword analysis
    - Resume section analysis
    - ATS scoring
    - Semantic skill matching
    - Skill gap analysis
    """

    if not resume_text or not resume_text.strip():
        raise ValueError("Resume text is required.")

    if not job_description or not job_description.strip():
        raise ValueError("Job description is required.")

    # ---------------------------------------------------------
    # 1. ATS keyword analysis
    # ---------------------------------------------------------

    keyword_analysis = calculate_keyword_match(
        resume_text=resume_text,
        job_description=job_description,
    )

    # ---------------------------------------------------------
    # 2. Resume section analysis
    # ---------------------------------------------------------

    section_analysis = analyze_sections(
        resume_text=resume_text,
    )

    # ---------------------------------------------------------
    # 3. ATS score
    # ---------------------------------------------------------

    ats_analysis = score_resume(
        keyword_analysis=keyword_analysis,
        section_analysis=section_analysis,
    )

    # ---------------------------------------------------------
    # 4. Semantic skill matching
    # ---------------------------------------------------------

    skill_matching = match_skills(
        resume_skills=resume_skills,
        required_skills=required_skills,
    )

    # ---------------------------------------------------------
    # 5. Skill gap analysis
    # ---------------------------------------------------------

    skill_gap = analyze_skill_gap(
        matching_result=skill_matching,
    )

    # ---------------------------------------------------------
    # 6. Final result
    # ---------------------------------------------------------

    return {
        "ats_analysis": ats_analysis,
        "section_analysis": section_analysis,
        "skill_matching": skill_matching,
        "skill_gap": skill_gap,
    }
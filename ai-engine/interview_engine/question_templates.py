
from typing import Any


TECHNICAL_TEMPLATES: list[dict[str, Any]] = [
    {
        "type": "technical",
        "difficulty": "easy",
        "template": "What is {skill}, and where is it commonly used?",
    },
    {
        "type": "technical",
        "difficulty": "medium",
        "template": "Explain how you have used {skill} in a project or practical application.",
    },
    {
        "type": "technical",
        "difficulty": "medium",
        "template": "What are the important concepts a developer should understand when working with {skill}?",
    },
    {
        "type": "technical",
        "difficulty": "hard",
        "template": "Describe a challenging problem you could face while using {skill} and how you would solve it.",
    },
]


HR_TEMPLATES: list[dict[str, Any]] = [
    {
        "type": "hr",
        "difficulty": "easy",
        "template": "Tell me about yourself and your technical background.",
    },
    {
        "type": "hr",
        "difficulty": "medium",
        "template": "Tell me about one project from your resume that you are particularly proud of.",
    },
    {
        "type": "hr",
        "difficulty": "medium",
        "template": "Describe a technical challenge you faced during a project and how you handled it.",
    },
    {
        "type": "hr",
        "difficulty": "medium",
        "template": "How do you approach learning a technology that you have not used before?",
    },
]


SKILL_GAP_TEMPLATES: list[dict[str, Any]] = [
    {
        "type": "skill_gap",
        "difficulty": "medium",
        "template": "You mentioned experience with related technologies, but {skill} is required for this role. How would you approach learning and using {skill}?",
    },
    {
        "type": "skill_gap",
        "difficulty": "hard",
        "template": "Suppose you are asked to use {skill} in a production project. What steps would you take before implementing it?",
    },
]


def get_technical_templates() -> list[dict[str, Any]]:
    return TECHNICAL_TEMPLATES.copy()


def get_hr_templates() -> list[dict[str, Any]]:
    return HR_TEMPLATES.copy()


def get_skill_gap_templates() -> list[dict[str, Any]]:
    return SKILL_GAP_TEMPLATES.copy()


import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from openai import OpenAI


# =========================================================
# LOAD PROJECT ENVIRONMENT
# =========================================================

CURRENT_FILE = Path(__file__).resolve()

# ai-engine/llm/openai_client.py
#              ↑
# Project root is 3 levels above this file.
PROJECT_ROOT = CURRENT_FILE.parents[2]

ENV_FILES = [
    PROJECT_ROOT / ".env",
    PROJECT_ROOT / "backend" / ".env",
]

for env_file in ENV_FILES:
    if env_file.exists():
        load_dotenv(env_file)


class OpenAIClient:
    """
    Simple OpenAI client wrapper for the AI interview engine.
    """

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")

        if not self.api_key:
            raise ValueError(
                "OPENAI_API_KEY is not configured. "
                "Please add OPENAI_API_KEY to the project .env file."
            )

        self.client = OpenAI(
            api_key=self.api_key
        )

        self.model = os.getenv(
            "OPENAI_MODEL",
            "gpt-4o-mini",
        )

    def generate_text(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
    ) -> str:
        """
        Generate text using OpenAI.
        """

        if not prompt or not prompt.strip():
            raise ValueError("Prompt is required.")

        messages: list[dict[str, Any]] = []

        if system_prompt:
            messages.append(
                {
                    "role": "system",
                    "content": system_prompt,
                }
            )

        messages.append(
            {
                "role": "user",
                "content": prompt,
            }
        )

        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )

        if not response.choices:
            raise RuntimeError(
                "OpenAI returned no response choices."
            )

        content = response.choices[0].message.content

        if not content:
            raise RuntimeError(
                "OpenAI returned an empty response."
            )

        return content.strip()


def get_openai_client() -> OpenAIClient:
    """
    Return a configured OpenAI client.
    """

    return OpenAIClient()

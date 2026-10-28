
import re
from typing import Any


# =========================================================
# STOP WORDS
# =========================================================

STOP_WORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "has",
    "have",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "that",
    "the",
    "this",
    "to",
    "we",
    "will",
    "with",
    "you",
    "your",
    "need",
    "looking",
    "candidate",
    "candidates",
    "developer",
    "experience",
    "experienced",
    "work",
    "working",
    "role",
    "job",
    "position",
    "skills",
    "skill",
}


# =========================================================
# NORMALIZE KEYWORD
# =========================================================

def normalize_keyword(keyword: str) -> str:
    """
    Normalize a single keyword.

    Examples:

    React.js       -> react
    ReactJS        -> react
    Node.js        -> node
    NodeJS         -> node
    REST API       -> rest api
    REST APIs      -> rest api
    RESTful API    -> rest api
    RESTful APIs   -> rest api
    """

    if not keyword:
        return ""

    keyword = keyword.lower().strip()

    # Remove punctuation around the keyword.
    keyword = keyword.strip(
        ".,;:!?()[]{}\"'"
    )

    # Normalize common technical aliases.
    aliases = {
        "react.js": "react",
        "reactjs": "react",

        "node.js": "node",
        "nodejs": "node",

        "express.js": "express",
        "expressjs": "express",

        "next.js": "next",
        "nextjs": "next",

        "vue.js": "vue",
        "vuejs": "vue",

        "angular.js": "angular",
        "angularjs": "angular",

        "restful": "rest",
        "rest api": "rest api",
        "rest apis": "rest api",
        "restful api": "rest api",
        "restful apis": "rest api",
        "restapi": "rest api",

        "apis": "api",
    }

    keyword = aliases.get(
        keyword,
        keyword,
    )

    # Remove unwanted punctuation.
    keyword = re.sub(
        r"[^a-z0-9+#.\- ]",
        " ",
        keyword,
    )

    # Normalize spaces.
    keyword = re.sub(
        r"\s+",
        " ",
        keyword,
    ).strip()

    # Remove trailing punctuation again.
    keyword = keyword.strip(
        ".,;:!?()[]{}\"'"
    )

    # Final aliases pass.
    keyword = aliases.get(
        keyword,
        keyword,
    )

    return keyword


# =========================================================
# TOKENIZE TEXT
# =========================================================

def tokenize_text(text: str) -> list[str]:
    """
    Convert text into normalized keywords.

    Special handling ensures:

        REST API
        REST APIs
        RESTful API
        RESTful APIs
        RESTAPI

    are all represented as:

        rest api
    """

    if not text:
        return []

    text = text.lower()

    # -----------------------------------------------------
    # Normalize multi-word technical phrases BEFORE
    # removing punctuation.
    # -----------------------------------------------------

    phrase_patterns = [
        (r"\brestful\s+apis\b", "rest api"),
        (r"\brestful\s+api\b", "rest api"),
        (r"\brest\s+apis\b", "rest api"),
        (r"\brest\s+api\b", "rest api"),
        (r"\brestapi\b", "rest api"),
    ]

    for pattern, replacement in phrase_patterns:
        text = re.sub(
            pattern,
            replacement,
            text,
        )

    # -----------------------------------------------------
    # Normalize punctuation while preserving spaces.
    # -----------------------------------------------------

    normalized_text = re.sub(
        r"[^a-z0-9+#.\- ]",
        " ",
        text,
    )

    normalized_text = re.sub(
        r"\s+",
        " ",
        normalized_text,
    ).strip()

    # -----------------------------------------------------
    # Split into words.
    # -----------------------------------------------------

    tokens = normalized_text.split()

    keywords = []

    index = 0

    while index < len(tokens):

        # -------------------------------------------------
        # Detect REST + API even if punctuation or spacing
        # caused them to become separate tokens.
        # -------------------------------------------------

        if (
            tokens[index] == "rest"
            and index + 1 < len(tokens)
            and tokens[index + 1].strip(
                ".,;:!?()[]{}\"'"
            ) == "api"
        ):

            if "rest api" not in keywords:
                keywords.append(
                    "rest api"
                )

            index += 2
            continue

        # -------------------------------------------------
        # Normalize current token.
        # -------------------------------------------------

        normalized = normalize_keyword(
            tokens[index]
        )

        if not normalized:
            index += 1
            continue

        # -------------------------------------------------
        # Skip stop words.
        # -------------------------------------------------

        if normalized in STOP_WORDS:
            index += 1
            continue

        # -------------------------------------------------
        # Ignore very short tokens.
        # -------------------------------------------------

        if len(
            normalized.replace(
                " ",
                ""
            )
        ) < 2:

            index += 1
            continue

        # -------------------------------------------------
        # Add unique keyword.
        # -------------------------------------------------

        if normalized not in keywords:
            keywords.append(
                normalized
            )

        index += 1

    return keywords


# =========================================================
# EXTRACT KEYWORDS
# =========================================================

def extract_keywords(
    text: str,
    min_length: int = 2,
) -> list[str]:
    """
    Extract normalized keywords from text.
    """

    if not text or not text.strip():
        return []

    keywords = tokenize_text(
        text
    )

    return [
        keyword
        for keyword in keywords
        if len(
            keyword.replace(
                " ",
                ""
            )
        ) >= min_length
    ]


# =========================================================
# CALCULATE KEYWORD MATCH
# =========================================================

def calculate_keyword_match(
    resume_text: str,
    job_description: str,
) -> dict[str, Any]:
    """
    Compare normalized keywords between
    resume and job description.
    """

    resume_keywords = extract_keywords(
        resume_text
    )

    job_keywords = extract_keywords(
        job_description
    )

    resume_keyword_set = set(
        resume_keywords
    )

    matched_keywords = [
        keyword
        for keyword in job_keywords
        if keyword in resume_keyword_set
    ]

    missing_keywords = [
        keyword
        for keyword in job_keywords
        if keyword not in resume_keyword_set
    ]

    total_job_keywords = len(
        job_keywords
    )

    if total_job_keywords == 0:

        match_percentage = 0.0

    else:

        match_percentage = (
            len(matched_keywords)
            / total_job_keywords
        ) * 100

    return {
        "resume_keywords": resume_keywords,

        "job_keywords": job_keywords,

        "matched_keywords": matched_keywords,

        "missing_keywords": missing_keywords,

        "match_percentage": round(
            match_percentage,
            2,
        ),

        "total_resume_keywords": len(
            resume_keywords
        ),

        "total_job_keywords": total_job_keywords,

        "total_matched_keywords": len(
            matched_keywords
        ),

        "total_missing_keywords": len(
            missing_keywords
        ),
    }

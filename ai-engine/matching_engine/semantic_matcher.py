from typing import Any

from matching_engine.embeddings import (
    generate_embedding,
    generate_embeddings,
)


def calculate_cosine_similarity(
    embedding_a: list[float],
    embedding_b: list[float],
) -> float:
    """
    Calculate cosine similarity between two embedding vectors.

    Since the embeddings are normalized by the embedding model,
    cosine similarity is simply their dot product.
    """

    if not embedding_a or not embedding_b:
        return 0.0

    if len(embedding_a) != len(embedding_b):
        raise ValueError(
            "Embedding vectors must have the same dimensions."
        )

    similarity = sum(
        a * b
        for a, b in zip(embedding_a, embedding_b)
    )

    # Floating-point safety.
    similarity = max(-1.0, min(1.0, similarity))

    return round(similarity, 4)


def calculate_semantic_similarity(
    text_a: str,
    text_b: str,
) -> float:
    """
    Calculate semantic similarity between two text values.

    Returns a value between 0 and 1.
    """

    if not text_a or not text_a.strip():
        return 0.0

    if not text_b or not text_b.strip():
        return 0.0

    embedding_a = generate_embedding(text_a)
    embedding_b = generate_embedding(text_b)

    return calculate_cosine_similarity(
        embedding_a,
        embedding_b,
    )


def calculate_similarity_percentage(
    text_a: str,
    text_b: str,
) -> float:
    """
    Calculate semantic similarity as a percentage.
    """

    similarity = calculate_semantic_similarity(
        text_a=text_a,
        text_b=text_b,
    )

    # Cosine similarity can technically be negative.
    # For a user-facing matching score, clamp it to 0-100.
    percentage = max(0.0, min(1.0, similarity)) * 100

    return round(percentage, 2)


def find_best_semantic_matches(
    query_text: str,
    candidate_texts: list[str],
    candidate_labels: list[str] | None = None,
) -> list[dict[str, Any]]:
    """
    Compare one query against multiple candidate texts.

    Returns results sorted by similarity from highest to lowest.
    """

    if not query_text or not query_text.strip():
        return []

    if not candidate_texts:
        return []

    if candidate_labels and len(candidate_labels) != len(candidate_texts):
        raise ValueError(
            "candidate_labels must have the same length as candidate_texts."
        )

    query_embedding = generate_embedding(query_text)

    candidate_embeddings = generate_embeddings(candidate_texts)

    results = []

    for index, candidate_embedding in enumerate(candidate_embeddings):
        similarity = calculate_cosine_similarity(
            query_embedding,
            candidate_embedding,
        )

        label = (
            candidate_labels[index]
            if candidate_labels
            else candidate_texts[index]
        )

        results.append(
            {
                "label": label,
                "text": candidate_texts[index],
                "similarity": similarity,
                "similarity_percentage": round(
                    max(0.0, similarity) * 100,
                    2,
                ),
            }
        )

    results.sort(
        key=lambda item: item["similarity"],
        reverse=True,
    )

    return results

from collections import defaultdict

from bson import ObjectId
from pymongo.errors import (
    DuplicateKeyError,
    OperationFailure,
)

from app.database.mongodb import (
    connect_to_mongodb,
    close_mongodb_connection,
    get_database,
)


INDEX_NAME = "unique_candidate_interview_question"


def main():
    # -----------------------------------------------------
    # INITIALIZE MONGODB CONNECTION
    # -----------------------------------------------------

    connect_to_mongodb()

    db = get_database()

    if db is None:
        raise RuntimeError(
            "MongoDB connection is not available. "
            "Check MONGODB_URI and DATABASE_NAME."
        )

    collection = db["evaluations"]

    # -----------------------------------------------------
    # CHECK EXISTING LINKED EVALUATIONS
    # -----------------------------------------------------

    records = list(
        collection.find(
            {
                "interview_id": {
                    "$type": "string",
                },
                "question_number": {
                    "$type": "int",
                },
            },
            {
                "_id": 1,
                "user_id": 1,
                "interview_id": 1,
                "question_number": 1,
            },
        )
    )

    groups = defaultdict(list)

    for record in records:
        user_id = record.get("user_id")
        interview_id = record.get("interview_id")
        question_number = record.get("question_number")

        if (
            not ObjectId.is_valid(str(user_id))
            or not ObjectId.is_valid(str(interview_id))
            or not isinstance(question_number, int)
            or isinstance(question_number, bool)
            or question_number < 1
        ):
            continue

        key = (
            str(user_id),
            str(interview_id),
            question_number,
        )

        groups[key].append(str(record["_id"]))

    duplicates = {
        key: ids
        for key, ids in groups.items()
        if len(ids) > 1
    }

    if duplicates:
        print("\nDuplicate linked evaluations found!")

        for key, ids in duplicates.items():
            print(
                "\nUser / Interview / Question:",
                key,
            )

            for evaluation_id in ids:
                print(
                    "Evaluation ID:",
                    evaluation_id,
                )

        print(
            "\nResolve duplicates before creating "
            "the unique index."
        )

        print("No records were deleted.")
        return

    # -----------------------------------------------------
    # CREATE DATABASE-LEVEL UNIQUE INDEX
    # -----------------------------------------------------

    try:
        collection.create_index(
            [
                ("user_id", 1),
                ("interview_id", 1),
                ("question_number", 1),
            ],
            unique=True,
            name=INDEX_NAME,
            partialFilterExpression={
                "interview_id": {
                    "$type": "string",
                },
                "question_number": {
                    "$type": "int",
                },
            },
        )

        print(
            "\nUnique evaluation index created successfully."
        )

        print(
            "Index name:",
            INDEX_NAME,
        )

    except (DuplicateKeyError, OperationFailure) as error:
        print(
            "\nUnable to create unique index:"
        )
        print(str(error))


if __name__ == "__main__":
    try:
        main()

    finally:
        close_mongodb_connection()

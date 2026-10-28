from pymongo import MongoClient
from app.config import settings


client = None
database = None


def connect_to_mongodb():
    global client, database

    if not settings.MONGODB_URI:
        print("MongoDB URI is not configured.")
        return

    try:
        client = MongoClient(settings.MONGODB_URI)

        # Check connection
        client.admin.command("ping")

        database = client[settings.DATABASE_NAME]

        print("MongoDB connected successfully.")

    except Exception as e:
        print(f"MongoDB connection failed: {e}")


def close_mongodb_connection():
    global client

    if client:
        client.close()
        print("MongoDB connection closed.")


def get_database():
    return database
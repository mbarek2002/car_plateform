from pymongo import MongoClient
from typing import Generator
from src.core.config import settings


client = MongoClient(settings.MONGODB_URI)
database = client[settings.MONGODB_DB_NAME]

def get_database():
    try:
        yield database
    finally:
        pass
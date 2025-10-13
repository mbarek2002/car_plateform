from pymongo import MongoClient
from pymongo.database import Database
from typing import Generator
from src.core.config import settings


client = MongoClient(settings.MONGODB_URI)
database = client[settings.MONGODB_DB_NAME]

def get_database()->Database:
    try:
        return database
    finally:
        pass
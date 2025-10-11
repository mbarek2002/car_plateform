
from pymongo import MongoClient
from src.core.config import settings

class MongoDB:
    _instance = None
    _client = None
    _db = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDB, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._client is None:
            self._client = MongoClient(settings.MONGODB_URI)
            self._db = self._client[settings.MONGODB_DB_NAME]
            self._create_indexes()
    
    def _create_indexes(self):
        """Create necessary indexes for collections"""
        self._db['pdfs'].create_index("pdf_id", unique=True)
        self._db['pdfs'].create_index("conversation_id")
        self._db['conversations'].create_index("conversation_id", unique=True)
        self._db['messages'].create_index([("conversation_id", 1), ("created_at", 1)])
        self._db['chunks'].create_index("chunk_id")
    
    @property
    def db(self):
        return self._db
    
    @property
    def client(self):
        return self._client
    
    def close(self):
        if self._client:
            self._client.close()

def get_database():
    """Dependency for FastAPI"""
    mongodb = MongoDB()
    try:
        yield mongodb.db
    finally:
        pass
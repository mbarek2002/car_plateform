import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    #APP INFO
    PROJECT_NAME = "car platform"
    PROJECT_DESCRIPTION = "car platform"
    VERSION ="1.0"
    
    # MongoDB
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://iheb:iheb@cluster0.iabvunr.mongodb.net?retryWrites=true&w=majority")
    MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "rag_system")
    
    # API Keys
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY" , "AIzaSyDkZc1yla9KpGeoKY3LZ6ixq38oLEZycCs")
    PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
    
    # Providers
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini")
    EMBEDDING_PROVIDER = os.getenv("EMBEDDING_PROVIDER", "huggingface")
    VECTORDB_PROVIDER = os.getenv("VECTORDB_PROVIDER", "chroma")

    # Models
    LLM_MODEL = os.getenv("LLM_MODEL", "gemini-1.5-pro")
    EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    
    # Text splitting
    CHUNK_SIZE = 1000
    CHUNK_OVERLAP = 200

    # user security
    SECRET_KEY = os.getenv("SECRET_KEY", "ihebmbarek99360644")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30

    # rag service
    rag_service = None

    # Data Source
    DATA_FILE_PATH: str = "src/data/cars_embeddings.json"

    # Scoring Weights
    SIMILARITY_WEIGHT: float = 0.7
    DISTANCE_WEIGHT: float = 0.3
    MAX_DISTANCE_KM: float = 500.0

    # Recommendation Settings
    DEFAULT_TOP_N: int = 10
    MAX_TOP_N: int = 100
    SIMILARITY_THRESHOLD: float = 0.5

settings = Settings()


import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
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
    
    # Text splitting
    CHUNK_SIZE = 1000
    CHUNK_OVERLAP = 200

settings = Settings()


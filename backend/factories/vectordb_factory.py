from interfaces.vectordb_interface import VectorDBInterface
from implementations.vectordb.chroma_db import ChromaDB
from implementations.vectordb.pinecone_db import PineconeDB

class VectorDBFactory:
    @staticmethod
    def create(provider: str, **kwargs) -> VectorDBInterface:
        if provider == "chroma":
            return ChromaDB(kwargs.get("collection_name", "rag_collection"))
        elif provider == "pinecone":
            return PineconeDB(kwargs.get("api_key"), kwargs.get("index_name", "rag-index"))
        else:
            raise ValueError(f"Unknown vector DB provider: {provider}")

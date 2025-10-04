from src.stores.vectordb.vectordb_interface import VectorDBInterface
from src.stores.vectordb.providers import PineconeDB , ChromaDB

class VectorDBFactory:
    @staticmethod
    def create(provider: str, **kwargs) -> VectorDBInterface:
        if provider == "chroma":
            return ChromaDB(kwargs.get("collection_name", "rag_collection"))
        elif provider == "pinecone":
            return PineconeDB(kwargs.get("api_key"), kwargs.get("index_name", "rag-index"))
        else:
            raise ValueError(f"Unknown vector DB provider: {provider}")

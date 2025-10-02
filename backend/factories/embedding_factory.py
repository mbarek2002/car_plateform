from interfaces.embedding_interface import EmbeddingInterface
from implementations.embeddings.gemini_embedding import GeminiEmbedding
from implementations.embeddings.huggingface_embedding import HuggingFaceEmbedding

class EmbeddingFactory:
    @staticmethod
    def create(provider: str, api_key: str = None, **kwargs) -> EmbeddingInterface:
        if provider == "gemini":
            return GeminiEmbedding(api_key)
        elif provider == "huggingface":
            return HuggingFaceEmbedding(api_key, kwargs.get("model_name", "all-MiniLM-L6-v2"))
        else:
            raise ValueError(f"Unknown embedding provider: {provider}")

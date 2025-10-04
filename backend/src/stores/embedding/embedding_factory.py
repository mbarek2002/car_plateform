from src.stores.embedding.embedding_interface import EmbeddingInterface
from src.stores.embedding.providers import GeminiEmbedding , HuggingFaceEmbedding

class EmbeddingFactory:
    @staticmethod
    def create(provider: str, api_key: str = None, **kwargs) -> EmbeddingInterface:
        if provider == "gemini":
            return GeminiEmbedding(api_key)
        elif provider == "huggingface":
            return HuggingFaceEmbedding(api_key, kwargs.get("model_name", "all-MiniLM-L6-v2"))
        else:
            raise ValueError(f"Unknown embedding provider: {provider}")

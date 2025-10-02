from typing import List
from sentence_transformers import SentenceTransformer
from interfaces.embedding_interface import EmbeddingInterface

class HuggingFaceEmbedding(EmbeddingInterface):
    def __init__(self, api_key: str = None, model_name: str = "all-MiniLM-L6-v2"):
        """
        Local embedding using Sentence Transformers.
        Popular models:
        - all-MiniLM-L6-v2: Fast, 384 dimensions
        - all-mpnet-base-v2: Best quality, 768 dimensions
        - paraphrase-multilingual-MiniLM-L12-v2: Multilingual
        """
        self.model = SentenceTransformer(model_name)
        self.dimension = self.model.get_sentence_embedding_dimension()
    
    def embed(self, texts: List[str]) -> List[List[float]]:
        """Embed multiple texts efficiently in batch"""
        embeddings = self.model.encode(
            texts,
            convert_to_tensor=False,
            show_progress_bar=False,
            batch_size=32
        )
        return embeddings.tolist()
    
    def get_dimension(self) -> int:
        """Get embedding dimension"""
        return self.dimension
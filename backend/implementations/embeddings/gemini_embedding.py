import google.generativeai as genai
from typing import List
from interfaces.embedding_interface import EmbeddingInterface

class GeminiEmbedding(EmbeddingInterface):
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
    
    def embed(self, texts: List[str]) -> List[List[float]]:
        embeddings = []
        for text in texts:
            result = genai.embed_content(
                model="models/embedding-001",
                content=text,
                task_type="retrieval_document"
            )
            embeddings.append(result['embedding'])
        return embeddings
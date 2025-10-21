from abc import ABC, abstractmethod
from typing import List, Dict

class VectorDBInterface(ABC):
    @abstractmethod
    def add_documents(self, texts: List[str], embeddings: List[List[float]], 
                     metadata: List[Dict], ids: List[str]):
        pass
    
    @abstractmethod
    def search(self, query_embedding: List[float], top_k: int) -> List[Dict]:
        pass

    @abstractmethod
    def delete_by_pdf_id(self, pdf_id: str) -> None:
        pass
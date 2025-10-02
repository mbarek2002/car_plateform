import chromadb
from typing import List, Dict
from interfaces.vectordb_interface import VectorDBInterface

class ChromaDB(VectorDBInterface):
    def __init__(self, collection_name: str = "rag_collection"):
        self.client = chromadb.PersistentClient(path="./chroma_db")
        self.collection = self.client.get_or_create_collection(name=collection_name)
    
    def add_documents(self, texts: List[str], embeddings: List[List[float]], 
                     metadata: List[Dict], ids: List[str]):
        self.collection.add(
            documents=texts,
            embeddings=embeddings,
            metadatas=metadata,
            ids=ids
        )
    
    def search(self, query_embedding: List[float], top_k: int) -> List[Dict]:
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )
        return [
            {"text": doc, "metadata": meta}
            for doc, meta in zip(results['documents'][0], results['metadatas'][0])
        ]

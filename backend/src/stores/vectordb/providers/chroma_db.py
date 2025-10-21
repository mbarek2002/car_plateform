import chromadb
from typing import List, Dict
from src.stores.vectordb.vectordb_interface import VectorDBInterface

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
            {"text": doc, "metadata": meta, "score": score}
            for doc, meta, score in zip(results['documents'][0], results['metadatas'][0], results['distances'][0])
        ]
    def delete_by_pdf_id(self, pdf_id: str) -> None:
        """
        Delete all vector chunks from Chroma that belong to a specific pdf_id.
        """
        try:
            self.collection.delete(where={"pdf_id": pdf_id})
            print(f"✅ Successfully deleted all chunks for pdf_id={pdf_id} from ChromaDB.")
        except Exception as e:
            print(f"⚠️ Failed to delete chunks for pdf_id={pdf_id}: {e}")
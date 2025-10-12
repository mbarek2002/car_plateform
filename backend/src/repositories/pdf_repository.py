from pymongo.database import Database
from datetime import datetime
from typing import List , Dict , Optional
from bson import Binary

class PDFRepository:
    def __init__(self, db: Database):
        self.collection = db["pdfs"]

    def create(self, pdf_id: str, filename: str, content: bytes, 
               conversation_id: Optional[str] = None) -> str:
        doc = {
            "pdf_id": pdf_id,
            "filename": filename,
            "content": Binary(content),
            "conversation_id": conversation_id,
            "uploaded_at": datetime.utcnow()
        }
        result = self.collection.insert_one(doc)
        return str(result.inserted_id)
    
    def find_by_id(self, pdf_id: str) -> Optional[Dict]:
        return self.collection.find_one({"pdf_id": pdf_id})
    
    def find_by_conversation(self, conversation_id: str) -> List[Dict]:
        return list(self.collection.find({"conversation_id": conversation_id}))
    
    def find_global_pdfs(self) -> List[Dict]:
        return list(self.collection.find({"conversation_id": None}))
    
    def delete(self, pdf_id: str) -> int:
        result = self.collection.delete_one({"pdf_id": pdf_id})
        return result.deleted_count
    
    def delete_by_conversation(self, conversation_id: str) -> int:
        result = self.collection.delete_many({"conversation_id": conversation_id})
        return result.deleted_count
    
    def count_all(self) -> int:
        return self.collection.count_documents({})
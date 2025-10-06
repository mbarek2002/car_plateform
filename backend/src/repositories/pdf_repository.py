from pymongo.database import Database
from datetime import datetime
from typing import List , Dict , Optional
from bson import Binary

class PdfRepository:
    def __init__(self, db: Database):
        self.collection = db["pdfs"]

    def save_pdf(self, pdf_id: str, filename: str, content: bytes, 
                 conversation_id: Optional[str] = None) -> str:
        doc = {
            "pdf_id": pdf_id,
            "filename": filename,
            "content": Binary(content),
            "conversation_id": conversation_id if conversation_id!="" else None,
            "uploaded_at": datetime.utcnow()
        }
        result = self.pdfs.insert_one(doc)
        return str(result.inserted_id)
    
    def get_pdf(self, pdf_id: str) -> Optional[Dict]:
        return self.pdfs.find_one({"pdf_id": pdf_id})
    
    def get_pdfs_by_conversation(self, conversation_id: str) -> List[Dict]:
        return list(self.pdfs.find({"conversation_id": conversation_id}))
    
    def get_all_global_pdfs(self) -> List[Dict]:
        return list(self.pdfs.find({"conversation_id": None}))
    
    def delete_pdf(self, pdf_id: str):
        self.pdfs.delete_one({"pdf_id": pdf_id})
        

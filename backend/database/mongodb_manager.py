from pymongo import MongoClient 
from pymongo.database import Database
from datetime import datetime
from typing import List, Dict, Optional
from bson import Binary
from src.core.config import settings
from typing import Dict, Optional , List

class MongoDBManager:
    def __init__(self): 
        self.client = MongoClient(settings.MONGODB_URI)
        self.db = self.client[settings.MONGODB_DB_NAME]
        self.pdfs = self.db['pdfs']
        self.conversations = self.db['conversations']
        self.messages = self.db['messages']
        self.chunks = self.db['chunks']
        self._create_indexes()
    
    def _create_indexes(self):
        self.pdfs.create_index("pdf_id")
        self.pdfs.create_index("conversation_id")
        self.conversations.create_index("conversation_id")
        self.messages.create_index([("conversation_id",1) , ("created_at",1)])
        self.chunks.create_index("chunk_id")
    
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
    
    def create_conversation(self, conversation_id: str, title: str) -> str:
        doc = {
            "conversation_id": conversation_id,
            "title": title,
            "created_at": datetime.utcnow()
        }
        result = self.conversations.insert_one(doc)
        return str(result.inserted_id)
    
    def get_conversation(self, conversation_id: str) -> Optional[Dict]:
        return self.conversations.find_one({"conversation_id": conversation_id})
    
    def get_all_conversations(self) -> List[Dict]:
        return list(self.conversations.find())
    
    def delete_pdf(self, pdf_id: str):
        self.pdfs.delete_one({"pdf_id": pdf_id})
    
    def delete_conversation(self, conversation_id: str):
        self.conversations.delete_one({"conversation_id": conversation_id})
        self.pdfs.delete_many({"conversation_id": conversation_id})

    def save_messages(self , conversation_id : str , role : str , content : str , metadata : Optional[Dict]=None)->str:
        doc = {
            "conversation_id":conversation_id,
            "role":role,
            "content":content,
            "metadata": metadata or {} ,
            "created_at":datetime.utcnow()
         }

        result = self.messages.insert_one(doc)
        return str(result.inserted_id)
  
    def get_messages(self , conversation_id : str , limit : int=20 ,  ascending : bool=True)->List:
        sort_order = 1 if ascending else -1
        cursor = self.messages.find({"conversation_id":conversation_id}).sort("created_at",sort_order).limit(limit)
        return list(cursor)

    def delete_messages(self,conversation_id:str):
        self.messages.delete_many({"conversation_id":conversation_id})

    def save_chunks(self, docs: List[Dict]) -> list:
        """
        Save multiple document chunks to MongoDB.
        Returns a list of inserted IDs.
        """
        
        result = self.chunks.insert_many(docs)
        return [str(_id) for _id in result.inserted_ids]

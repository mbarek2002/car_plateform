from pymongo.database import Database
from datetime import datetime
from typing import List , Dict , Optional

class ConversationRepository:
    def __init__(self, db: Database):
        self.collection = db["conversations"]

    def create(self, conversation_id: str ,user_id :str , title: str) -> str:
        doc = {
            "conversation_id": conversation_id,
            "user_id": user_id,
            "title": title,
            "created_at": datetime.utcnow()
        }
        result = self.collection.insert_one(doc)
        return str(result.inserted_id)
    
    def find_by_id(self, conversation_id: str) -> Optional[Dict]:
        return self.collection.find_one({"conversation_id": conversation_id})
    
    def find_all(self , user_id:str) -> List[Dict]:
        return list(self.collection.find({"user_id":user_id}).sort("created_at", -1))
    
    def delete(self, conversation_id: str) -> int:
        result = self.collection.delete_one({"conversation_id": conversation_id})
        return result.deleted_count
    
    def exists(self, conversation_id: str) -> bool:
        return self.collection.count_documents({"conversation_id": conversation_id}) > 0

from pymongo.database import Database
from datetime import datetime
from typing import List , Dict , Optional

class ConversationRepository:
    def __init__(self, db: Database):
        self.collection = db["conversations"]

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
    
    def delete_conversation(self, conversation_id: str):
        self.conversations.delete_one({"conversation_id": conversation_id})
        self.pdfs.delete_many({"conversation_id": conversation_id})

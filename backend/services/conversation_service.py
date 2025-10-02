from datetime import datetime
from database.mongodb_manager import MongoDBManager

from typing import Optional

class ConversationService:
    def __init__(self):
        self.db_manager = MongoDBManager()
    
    def create(self, title: str) -> str:
        conversation_id = f"conv_{datetime.now().timestamp()}"
        self.db_manager.create_conversation(conversation_id, title)
        return conversation_id
    
    def get(self, conversation_id: str):
        return self.db_manager.get_conversation(conversation_id)
    
    def list_all(self):
        return self.db_manager.get_all_conversations()
    
    def delete(self, conversation_id: str):
        self.db_manager.delete_conversation(conversation_id)

    def add_message(self , conversation_id, role: str , content: str ,  metadata: Optional[dict] = None):
        return self.db_manager.save_messages(conversation_id , role , content , metadata)

    def list_messages(self, conversation_id: str, limit: int = 20, ascending: bool = True):
        return self.db_manager.get_messages(conversation_id, limit=limit, ascending=ascending)

    def clear_messages(self, conversation_id: str):
        self.db_manager.delete_messages(conversation_id)  
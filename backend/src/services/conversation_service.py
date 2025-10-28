from typing import List, Dict, Optional
from datetime import datetime
from src.repositories.conversations_repository import ConversationRepository
from src.repositories.messages_repository import MessagesRepository
from src.repositories.pdf_repository import PDFRepository


class ConversationService:
    def __init__(self, db):
        self.conversation_repo = ConversationRepository(db)
        self.message_repo = MessagesRepository(db)
        self.pdf_repo = PDFRepository(db)

    def create(self, user_id :str , title: str) -> str:
        """Create a new conversation"""
        conversation_id = f"conv_{datetime.now().timestamp()}"
        self.conversation_repo.create(conversation_id , user_id , title)
        return conversation_id
    
    def get(self, conversation_id: str) -> Optional[Dict]:
        """Get conversation by ID"""
        return self.conversation_repo.find_by_id(conversation_id)
    
    def list_all(self , user_id : str) -> List[Dict]:
        """List all conversations"""
        return self.conversation_repo.find_all(user_id)
    
    def delete(self, conversation_id: str):
        """Delete conversation and associated data"""
        # Delete conversation
        self.conversation_repo.delete(conversation_id)
        
        # Delete messages
        self.message_repo.delete_by_conversation(conversation_id)
        
        # Delete PDFs
        self.pdf_repo.delete_by_conversation(conversation_id)
    
    def add_message(self, conversation_id: str, role: str, content: str):
        """Add a message to conversation"""
        return self.message_repo.save_messages(conversation_id, role, content)
    
    def list_messages(self, conversation_id: str, limit: int = 20, 
                     ascending: bool = True) -> List[Dict]:
        """List messages in a conversation"""
        return self.message_repo.find_by_conversation(conversation_id, limit, ascending)


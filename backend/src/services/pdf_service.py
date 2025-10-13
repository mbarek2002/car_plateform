from typing import List, Dict, Optional
from datetime import datetime
from src.repositories.conversations_repository import ConversationRepository
from src.repositories.messages_repository import MessagesRepository
from src.repositories.pdf_repository import PDFRepository


class PdfService:
    def __init__(self, db):
        self.pdf_repo = PDFRepository(db)

    def get_pdf(self, pdf_id: str) -> Optional[Dict]:
        return self.pdf_repo.find_by_id(pdf_id=pdf_id)

    def get_conversation_pdfs(self, conversation_id: str) -> List:
        """Get all PDFs for a conversation"""
        return self.pdf_repo.find_by_conversation(conversation_id)
    
    def get_global_pdfs(self) -> List:
        """Get all global PDFs"""
        return self.pdf_repo.find_global_pdfs()
    
    def delete_pdf(self, pdf_id: str):
        """Delete a PDF"""
        self.pdf_repo.delete(pdf_id)
        # TODO: Also delete from vector DB
    
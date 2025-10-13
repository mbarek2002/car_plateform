from src.repositories.conversations_repository import ConversationRepository
from src.repositories.messages_repository import MessagesRepository
from src.repositories.pdf_repository import PDFRepository
from src.services.conversation_service import ConversationService
from src.services.prediction_service import PredictionService
from src.services.pdf_service import PdfService

from src.db.connection import get_database


async def get_conversation_repository():
    db=get_database()
    return ConversationRepository(db)

async def get_message_repository():
    db=get_database()
    return MessagesRepository(db)

async def get_pdf_repository():
    db=get_database()
    return PDFRepository(db)

async def get_conversation_service():
    db=get_database()
    return ConversationService(db)

async def get_prediction_service():
    db=get_database()
    return PredictionService(db)

async def get_pdf_service():
    db=get_database()
    return PdfService(db)


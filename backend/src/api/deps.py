from src.repositories.conversations_repository import ConversationRepository
from src.repositories.messages_repository import MessagesRepository
from src.repositories.pdf_repository import PDFRepository
from src.services.conversation_service import ConversationService
from src.services.prediction_service import PredictionService
from src.services.pdf_service import PdfService
from src.services.rag_service import RAGService
from src.services.auth import AuthService


from src.db.connection import get_database

from fastapi import Depends , HTTPException , status
from fastapi.security import OAuth2PasswordBearer
import jwt 
from jwt.exceptions import PyJWTError 
from src.core.config import Settings
from src.repositories.user_repository import UserRepository

settings = Settings()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/v1/auth/login")

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

async def get_rag_service():
    db=get_database()
    return RAGService(db)

async def get_auth_service():
    db=get_database()
    return AuthService(db)

def get_current_user(token: str = Depends(oauth2_scheme),
                     db= Depends(get_database)
                     ):
    credentials_exception = HTTPException(
        status_code = status.HTTP_401_UNAUTHORIZED,
        detail = "Could not validate credentials",
        headers = {"WWW-Authenticate":"Bearer"},
    )

    try :
        payload = jwt.decode(token , settings.SECRET_KEY , algorithms=[settings.ALGORITHM])
        email :str = payload.get("sub")
        if email is None :
            raise credentials_exception
    except PyJWTError :
        raise credentials_exception
    
    user_repo = UserRepository(db)
    user = user_repo.get_by_email(email=email)
    if user is None :
        raise credentials_exception
    
    return user


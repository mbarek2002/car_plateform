from src.repositories.conversations_repository import ConversationRepository
from src.repositories.messages_repository import MessagesRepository
from src.repositories.pdf_repository import PDFRepository
from src.services.conversation_service import ConversationService
from src.services.prediction_service import PredictionService
from src.services.pdf_service import PdfService
from src.services.rag_service import RAGService
from src.services.auth import AuthService

from src.repositories.car_repository import CarRepository
from src.repositories.embedding_repository import EmbeddingRepository
from src.services.scoring_service import ScoringService
from src.services.recommendation_service import RecommendationService


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


def get_car_repository() -> CarRepository:
    """Dependency for car repository."""
    return CarRepository()

def get_embedding_repository() -> EmbeddingRepository:
    """Dependency for car repository."""
    return EmbeddingRepository()

def get_scoring_service() -> ScoringService:
    """Dependency for scoring service."""
    return ScoringService()

def get_recommendation_service(
    car_repo: CarRepository = None,
    embedding_repo: EmbeddingRepository = None,
    scoring_service: ScoringService = None,
) -> RecommendationService:
    """Dependency for recommendation service."""
    if car_repo is None:
        car_repo = get_car_repository()
    if embedding_repo is None:
        embedding_repo = get_embedding_repository()
    if scoring_service is None:
        scoring_service = get_scoring_service()

    return RecommendationService(car_repo, embedding_repo, scoring_service)




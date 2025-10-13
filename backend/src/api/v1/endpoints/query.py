from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException, Form , Depends , APIRouter
from src.schemas.chat_schema import ChatRequest , ChatResponse
from src.schemas.query_schema import QueryRequest , QueryResponse
from src.services.conversation_service import ConversationService
from src.services.rag_service import RAGService
from src.db.connection import get_database
from core.rag_system import RAGSystem
from typing import Optional 
import shutil
from pathlib import Path
from src.core.config import settings

router = APIRouter(prefix="/chat", tags=["chat"])
# rag_system = RAGSystem()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest , db = Depends(get_database)):
    try:

        # service = RAGService(db)
        service = settings.rag_service
        result = service.chat(
            conversation_id=request.conversation_id,
            message=request.message,
            top_k=request.top_k,
            history_limit=request.history_limit
        )
        return ChatResponse(
            conversation_id=request.conversation_id,
            user_message_id=result["user_message_id"],
            assistant_message_id=result["assistant_message_id"],
            answer=result["answer"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== QUERY ENDPOINTS ====================

@router.post("/query", response_model=QueryResponse)
async def query_rag(request: QueryRequest , db=Depends(get_database)):
    """Query the RAG system (global or conversation-specific)"""
    # try:
        # service = RAGService(db)
    service = settings.rag_service
    answer = service.query(
        question=request.question,
        conversation_id=request.conversation_id,
        top_k=request.top_k
    )
    return QueryResponse(
        answer=answer,
        conversation_id=request.conversation_id
    )
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=str(e))


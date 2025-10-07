from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException, Form , Depends , APIRouter
from src.schemas.chat_schema import ChatRequest , ChatResponse
from src.schemas.query_schema import QueryRequest , QueryResponse
from src.services.conversation_service import ConversationService
from core.rag_system import RAGSystem
from typing import Optional 
import shutil
from pathlib import Path

router = APIRouter(prefix="/chat", tags=["chat"])
rag_system = RAGSystem()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        result = rag_system.chat(
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
async def query_rag(request: QueryRequest):
    """Query the RAG system (global or conversation-specific)"""
    try:
        answer = rag_system.query(
            question=request.question,
            conversation_id=request.conversation_id,
            top_k=request.top_k
        )
        print(QueryResponse(
            answer=answer,
            conversation_id=request.conversation_id
        ))
        return QueryResponse(
            answer=answer,
            conversation_id=request.conversation_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from src.schemas.conversation_schema import ConversationResponse, ConversationCreate
from src.services.conversation_service import ConversationService
from core.rag_system import RAGSystem
router = APIRouter(prefix="/conversations", tags=["conversations"])

rag_sytem = RAGSystem()

@router.post("/conversations", response_model=ConversationResponse, tags=["Conversations"])
async def create_conversation(conversation: ConversationCreate , rag_system):
    """Create a new conversation"""
    try:
        conv_id = rag_system.create_conversation(conversation.title)
        conv_data = rag_system.conversation_service.get(conv_id)
        return ConversationResponse(
            conversation_id=conv_data["conversation_id"],
            title=conv_data["title"],
            created_at=conv_data["created_at"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conversations", response_model=List[ConversationResponse], tags=["Conversations"])
async def list_conversations():
    """List all conversations"""
    try:
        conversations = rag_system.conversation_service.list_all()
        return [
            ConversationResponse(
                conversation_id=conv["conversation_id"],
                title=conv["title"],
                created_at=conv["created_at"]
            )
            for conv in conversations
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conversations/{conversation_id}", response_model=ConversationResponse, tags=["Conversations"])
async def get_conversation(conversation_id: str):
    """Get a specific conversation"""
    try:
        conv = rag_system.conversation_service.get(conversation_id)
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return ConversationResponse(
            conversation_id=conv["conversation_id"],
            title=conv["title"],
            created_at=conv["created_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/conversations/{conversation_id}", tags=["Conversations"])
async def delete_conversation(conversation_id: str):
    """Delete a conversation and its associated PDFs"""
    try:
        rag_system.conversation_service.delete(conversation_id)
        return {"message": "Conversation deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


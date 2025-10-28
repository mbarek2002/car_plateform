from fastapi import APIRouter, Depends, HTTPException
from typing import List

from src.schemas.conversation_schema import ConversationResponse, ConversationCreate
from src.schemas.message_schema import MessageResponse , MessageCreate

from src.services.conversation_service import ConversationService

from src.db.mongodb import get_database
from src.api.deps import get_conversation_service , get_current_user

router = APIRouter(prefix="/conversations", tags=["conversations"])

@router.post('/' , response_model = ConversationResponse)
async def create_conversation(
    conversation : ConversationCreate ,
    current_user = Depends(get_current_user),
      db=Depends(get_database),
      conversation_service: ConversationService = Depends(get_conversation_service)
      ):
    """Create a new conversation"""
    try :
        print("Current user:", current_user.id)  
        conv_id = conversation_service.create( str(current_user.id), conversation.title)
        conv_data = conversation_service.get(conv_id)
        return ConversationResponse (
            conversation_id = conv_data["conversation_id"],
            user_id = conv_data["user_id"],
            title = conv_data["title"],
            created_at = conv_data["created_at"],
        )
    except Exception as e:
        raise HTTPException(status_code=500 , detail=str(e))


@router.get('' , response_model = List[ConversationResponse])
async def list_conversations(
    db=Depends(get_database),
    current_user = Depends(get_current_user),
    conversation_service: ConversationService = Depends(get_conversation_service)
    ):
    """List all conversations"""
    try:
        conversations = conversation_service.list_all(user_id = str(current_user.id))
        return [
            ConversationResponse(
                conversation_id=conv["conversation_id"],
                user_id=conv.get("user_id"),
                title=conv["title"],
                created_at=conv["created_at"]
            )
            for conv in conversations
        ] 
    except Exception as e :
        raise HTTPException(status_code=500 , detail=str(e))


@router.get('/{conversation_id}' , response_model = ConversationResponse)
async def get_conversation(conversation_id:str,current_user = Depends(get_current_user),db=Depends(get_database)):
    """Get a specific conversation"""
    try:
        service = ConversationService(db)
        conv = service.get(conversation_id=conversation_id)
        if not conv : 
            raise HTTPException (status_code = 404 , detail="Conversation not found")
        return ConversationResponse(
            conversation_id=conv["conversation_id"],
            title=conv["title"],
            created_at=conv["created_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.delete('/{conversation_id}' )
async def get_conversation(conversation_id:str,current_user = Depends(get_current_user),db=Depends(get_database)):
    """Delete a conversation and its associated data"""
    try:
        service = ConversationService(db)
        service.delete(conversation_id=conversation_id)
        return {"message": "Conversation deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{conversation_id}/messages", response_model=List[MessageResponse])
async def list_messages(conversation_id: str,current_user = Depends(get_current_user), limit: int = 20, db=Depends(get_database)):
    """List messages in a conversation"""
    try :
        service = ConversationService(db)
        msgs = service.list_messages(conversation_id= conversation_id, limit=limit ,ascending=True )
        return [
            MessageResponse(
                conversation_id=m["conversation_id"],
                role=m["role"],
                content=m["content"],
                created_at=m["created_at"]
            ) for m in msgs
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{conversation_id}/messages")
async def add_message(conversation_id: str, body: MessageCreate,current_user = Depends(get_current_user), db=Depends(get_database)):
    """Add a message to a conversation"""
    try:
        if body.conversation_id != conversation_id:
            raise HTTPException(status_code=400, detail="conversation_id mismatch")
        service = ConversationService(db)
        service.add_message(conversation_id , body.role , body.content)
        return {"message": "Message saved"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


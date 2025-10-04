from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    conversation_id: str
    message: str
    top_k: int = 3
    history_limit: int = 20  # number of past messages to include

class ChatResponse(BaseModel):
    conversation_id: str
    user_message_id: Optional[str] = None
    assistant_message_id: Optional[str] = None
    answer: str

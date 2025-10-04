from pydantic import BaseModel
from datetime import datetime

class MessageCreate(BaseModel):
    conversation_id: str
    role: str  # "user" or "assistant"
    content: str

class MessageResponse(BaseModel):
    conversation_id: str
    role: str
    content: str
    created_at: datetime

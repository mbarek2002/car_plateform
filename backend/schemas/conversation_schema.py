from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ConversationCreate(BaseModel):
    title: str

class ConversationResponse(BaseModel):
    conversation_id: str
    title: str
    created_at: datetime



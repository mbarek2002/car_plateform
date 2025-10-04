from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class QueryRequest(BaseModel):
    question: str
    conversation_id: Optional[str] = None
    top_k: int = 3

class QueryResponse(BaseModel):
    answer: str
    conversation_id: Optional[str] = None
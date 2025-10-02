from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ConversationCreate(BaseModel):
    title: str

class ConversationResponse(BaseModel):
    conversation_id: str
    title: str
    created_at: datetime

class QueryRequest(BaseModel):
    question: str
    conversation_id: Optional[str] = None
    top_k: int = 3

class QueryResponse(BaseModel):
    answer: str
    conversation_id: Optional[str] = None

class PDFUploadResponse(BaseModel):
    pdf_id: str
    filename: str
    conversation_id: Optional[str] = None
    message: str

class PDFInfo(BaseModel):
    pdf_id: str
    filename: str
    conversation_id: Optional[str] = None
    uploaded_at: datetime

class ProviderConfig(BaseModel):
    llm_provider: Optional[str] = None
    embedding_provider: Optional[str] = None
    vectordb_provider: Optional[str] = None

class ErrorResponse(BaseModel):
    detail: str

class MessageCreate(BaseModel):
    conversation_id: str
    role: str  # "user" or "assistant"
    content: str

class MessageResponse(BaseModel):
    conversation_id: str
    role: str
    content: str
    created_at: datetime

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

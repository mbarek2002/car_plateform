from pydantic import BaseModel
from typing import Optional
from datetime import datetime

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

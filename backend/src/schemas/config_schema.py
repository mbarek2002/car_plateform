from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# ==================== Configuration Schemas ====================

class ProviderConfig(BaseModel):
    llm_provider: Optional[str] = None
    embedding_provider: Optional[str] = None
    vectordb_provider: Optional[str] = None

class CurrentConfigResponse(BaseModel):
    llm_provider: str
    embedding_provider: str
    vectordb_provider: str
    llm_model: Optional[str] = None
    embedding_model: Optional[str] = None
    vectordb_index: Optional[str] = None

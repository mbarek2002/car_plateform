from pydantic import BaseModel
from typing import Optional

class ProviderConfig(BaseModel):
    llm_provider: Optional[str] = None
    embedding_provider: Optional[str] = None
    vectordb_provider: Optional[str] = None

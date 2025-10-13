from fastapi import APIRouter, HTTPException , Depends
from src.schemas.config_schema import ProviderConfig, CurrentConfigResponse
from src.core.config import settings
from src.services.rag_service import RAGService
from src.db.mongodb import get_database
from src.core.config import settings


router = APIRouter(prefix="/config", tags=["Configuration"])


# Global configuration state
_current_config = {
    "llm_provider": settings.LLM_PROVIDER,
    "embedding_provider": settings.EMBEDDING_PROVIDER,
    "vectordb_provider": settings.VECTORDB_PROVIDER
}

@router.get("/providers", response_model=CurrentConfigResponse)
async def get_current_config():
    """Get current provider configuration"""
    return CurrentConfigResponse(
        llm_provider=_current_config["llm_provider"],
        embedding_provider=_current_config["embedding_provider"],
        vectordb_provider=_current_config["vectordb_provider"],
        llm_model=getattr(settings, 'LLM_MODEL', None),
        embedding_model=getattr(settings, 'EMBEDDING_MODEL', None),
        vectordb_index=getattr(settings, 'VECTORDB_INDEX', None)
    )


@router.post("/providers", response_model=dict)
async def configure_providers(
    config: ProviderConfig,
    db=Depends(get_database)):
    """
    Reconfigure LLM, Embedding, and Vector DB providers.
    Note: This will affect all subsequent requests until server restart.
    """
    try:
        # Update global configuration
        if config.llm_provider:
            _current_config["llm_provider"] = config.llm_provider
        if config.embedding_provider:
            _current_config["embedding_provider"] = config.embedding_provider
        if config.vectordb_provider:
            _current_config["vectordb_provider"] = config.vectordb_provider

        print(_current_config)
        settings.rag_service = RAGService(
            llm_provider=_current_config["llm_provider"],
            embedding_provider=_current_config["embedding_provider"],
            vectordb_provider=_current_config["vectordb_provider"],
            db=db
        )
        
        
        return {
            "message": "Providers updated successfully",
            "config": _current_config,
            "note": "Configuration will be applied to new requests. Existing connections remain unchanged."
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/providers/reset")
async def reset_providers():
    """Reset providers to default configuration from environment"""
    global _current_config
    _current_config = {
        "llm_provider": settings.LLM_PROVIDER,
        "embedding_provider": settings.EMBEDDING_PROVIDER,
        "vectordb_provider": settings.VECTORDB_PROVIDER
    }
    return {
        "message": "Providers reset to default configuration",
        "config": _current_config
    }

def get_current_providers():
    """Helper function to get current provider configuration"""
    return _current_config.copy()
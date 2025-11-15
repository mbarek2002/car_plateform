from fastapi import APIRouter, HTTPException, Depends
from src.services.rag_service import RAGService
from src.db.mongodb import get_database 
from src.api.deps import get_current_user , get_rag_service
from src.core.config import settings

router = APIRouter(prefix="/stats", tags=["Statistics"])

@router.get("")
async def get_statistics( db=Depends(get_database)):
    """Get system statistics"""
    # try:
    # service = RAGService(db)
    return settings.rag_service.get_statistics()
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=str(e))
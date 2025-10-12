from fastapi import APIRouter, HTTPException, Depends
from src.services.rag_service import RAGService
from src.db.mongodb import get_database

router = APIRouter(prefix="/stats", tags=["Statistics"])

@router.get("")
async def get_statistics(db=Depends(get_database)):
    """Get system statistics"""
    try:
        service = RAGService(db)
        return service.get_statistics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
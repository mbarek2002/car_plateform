"""
API v1 router configuration
"""
from fastapi import APIRouter
from src.core.config import settings
from src.api.v1.endpoints import auth

# Create the v1 router
router = APIRouter(prefix="/v1")

router.include_router(auth.router)



@router.get('/app-info',tags=['info'])
async def app_info():
    """
    Application information endpoint
    
    Returns basic information about the application
    """
    return {
        "name":settings.PROJECT_NAME,
        "description":settings.PROJECT_DESCRIPTION,
        "version":settings.VERSION
    }


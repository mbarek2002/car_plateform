from pydantic import BaseModel, Field
from src.schemas.car_schemas import  Car
from typing import Optional


class Recommendation(BaseModel):
    """Recommendation with scoring details."""
    car: Car
    similarity_score: float = Field(..., ge=0, le=1)
    distance_score: float = Field(..., ge=0, le=1)
    final_score: float = Field(..., ge=0, le=1)
    distance_km: Optional[float] = None
    rank: int = Field(..., ge=1)
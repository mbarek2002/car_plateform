from pydantic import BaseModel, Field
from typing import Optional


class RecommendByIdRequest(BaseModel):
    """Request for recommendations by car ID."""
    car_id: str
    top_n: int = Field(10, ge=1, le=100)
    user_latitude: Optional[float] = Field(None, ge=-90, le=90)
    user_longitude: Optional[float] = Field(None, ge=-180, le=180)
    similarity_weight: Optional[float] = Field(None, ge=0, le=1)
    distance_weight: Optional[float] = Field(None, ge=0, le=1)
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_year: Optional[int] = None
    max_year: Optional[int] = None
    manufacturers: Optional[list[str]] = None
    types: Optional[list[str]] = None
    states: Optional[list[str]] = None

class RecommendByTextRequest(BaseModel):
    """Request for recommendations by text query."""
    query: str = Field(..., min_length=1)
    top_n: int = Field(10, ge=1, le=100)
    user_latitude: Optional[float] = Field(None, ge=-90, le=90)
    user_longitude: Optional[float] = Field(None, ge=-180, le=180)
    similarity_weight: Optional[float] = Field(0.7, ge=0, le=1)
    distance_weight: Optional[float] = Field(0.3, ge=0, le=1)
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_year: Optional[int] = None
    max_year: Optional[int] = None
    manufacturers: Optional[list[str]] = None
    types: Optional[list[str]] = None

class CarResponse(BaseModel):
    """Car response schema."""
    car_id: str
    url: Optional[str]
    price: float
    year: int
    manufacturer: str
    model: str
    condition: Optional[str]
    fuel: Optional[str]
    odometer: Optional[float]
    transmission: Optional[str]
    type: Optional[str]
    paint_color: Optional[str]
    state: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]


class RecommendationResponse(BaseModel):
    """Recommendation response schema."""
    car: CarResponse
    similarity_score: float
    distance_score: float
    final_score: float
    distance_km: Optional[float]
    rank: int


class RecommendationsResponse(BaseModel):
    """Multiple recommendations response."""
    recommendations: list[RecommendationResponse]
    total: int
    query_info: dict
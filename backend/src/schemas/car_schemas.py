from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class Location(BaseModel):
    """Location schema."""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    
    class Config:
        frozen = True

class Car(BaseModel):
    """Car entity schema."""
    car_id: str
    url: Optional[str] = None
    region: Optional[str] = None
    price: float = Field(..., gt=0)
    year: int
    manufacturer: str
    model: str
    condition: Optional[str] = None
    cylinders: Optional[str] = None
    fuel: Optional[str] = None
    odometer: Optional[float] = None
    title_status: Optional[str] = None
    transmission: Optional[str] = None
    vin: Optional[str] = None
    drive: Optional[str] = None
    size: Optional[str] = None
    type: Optional[str] = None
    paint_color: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    state: Optional[str] = None
    location: Optional[Location] = None
    posting_date: Optional[datetime] = None
    combined_text: Optional[str] = None

class CarFilters(BaseModel):
    """Car filtering criteria."""
    min_price: Optional[float] = Field(None, ge=0)
    max_price: Optional[float] = Field(None, ge=0)
    min_year: Optional[int] = Field(None, ge=1900)
    max_year: Optional[int] = Field(None, ge=1900)
    min_odometer: Optional[float] = Field(None, ge=0)
    max_odometer: Optional[float] = Field(None, ge=0)
    manufacturers: Optional[list[str]] = None
    types: Optional[list[str]] = None
    fuel_types: Optional[list[str]] = None
    transmissions: Optional[list[str]] = None
    states: Optional[list[str]] = None
    max_distance_km: Optional[float] = Field(None, ge=0)


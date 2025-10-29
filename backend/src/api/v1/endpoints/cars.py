from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from src.repositories.car_repository import CarRepository
from src.schemas.car_requests_schemas import CarResponse
from src.schemas.car_schemas import CarFilters
from src.api.deps import get_car_repository


router = APIRouter(prefix="/cars", tags=["cars"])


@router.get("/{car_id}", response_model=CarResponse)
def get_car(car_id: str):
    """Get car details by ID."""
    repo = get_car_repository()
    car = repo.find_by_id(car_id)
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    return CarResponse(
        car_id=car.car_id,
        url=car.url,
        price=car.price,
        year=car.year,
        manufacturer=car.manufacturer,
        model=car.model,
        condition=car.condition,
        fuel=car.fuel,
        odometer=car.odometer,
        transmission=car.transmission,
        type=car.type,
        paint_color=car.paint_color,
        state=car.state,
        latitude=car.location.latitude if car.location else None,
        longitude=car.location.longitude if car.location else None
    )



@router.get("/", response_model=list[CarResponse])
def list_cars(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    manufacturer: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None
):
    """List cars with optional filters."""
    repo = get_car_repository()
    
    filters = CarFilters(
        min_price=min_price,
        max_price=max_price,
        manufacturers=[manufacturer] if manufacturer else None
    )
    
    cars = repo.find_all(filters=filters, skip=skip, limit=limit)
    
    return [
        CarResponse(
            car_id=car.car_id,
            url=car.url,
            price=car.price,
            year=car.year,
            manufacturer=car.manufacturer,
            model=car.model,
            condition=car.condition,
            fuel=car.fuel,
            odometer=car.odometer,
            transmission=car.transmission,
            type=car.type,
            paint_color=car.paint_color,
            state=car.state,
            latitude=car.location.latitude if car.location else None,
            longitude=car.location.longitude if car.location else None
        )
        for car in cars
    ]


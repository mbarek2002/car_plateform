from fastapi import APIRouter , HTTPException , Depends
from src.services.recommendation_service import RecommendationService
from src.schemas.car_requests_schemas import (
    RecommendByIdRequest,
    RecommendByTextRequest,
    RecommendationResponse,
    RecommendationsResponse,
    CarResponse
)
from src.schemas.car_schemas import Location , CarFilters
from src.api.deps import get_recommendation_service

router = APIRouter(prefix="/recommendations" , tags=['recommendations'])

@router.post("/by-id", response_model = RecommendationsResponse)
def recommand_by_car_id(request:RecommendByIdRequest):
    """Get car recommendations based on a reference car ID."""
    try :
        service = get_recommendation_service()

        user_location = None
        if request.user_latitude and request.user_longitude:
            user_location = Location(
                latitude=request.user_latitude,
                longitude=request.user_longitude
            )

        filters = CarFilters(
            min_price=request.min_price,
            max_price=request.max_price,
            min_year=request.min_year,
            max_year=request.max_year,
            manufacturers=request.manufacturers,
            types=request.types,
            states=request.states
        )

        recommendations = service.recommend_by_car_id(
            car_id=request.car_id,
            top_n=request.top_n,
            user_location=user_location,
            filters=filters,
            similarity_weight=request.similarity_weight,
            distance_weight=request.distance_weight
        )

        response_recs = []
        for rec in recommendations:
            car_response = CarResponse(
                car_id = rec.car.car_id,
                url = rec.car.url,
                price = rec.car.price,
                year = rec.car.year,
                manufacturer = rec.car.manufacturer,
                model = rec.car.model,
                condition = rec.car.condition,
                fuel = rec.car.fuel,
                odometer=rec.car.odometer,
                transmission=rec.car.transmission,
                type=rec.car.type,
                paint_color=rec.car.paint_color,
                state=rec.car.state,
                latitude=rec.car.location.latitude if rec.car.location else None,
                longitude=rec.car.location.longitude if rec.car.location else None
            )

            response_recs.append(RecommendationResponse(
                car=car_response,
                similarity_score=rec.similarity_score,
                distance_score=rec.distance_score,
                final_score=rec.final_score,
                distance_km=rec.distance_km,
                rank=rec.rank
            ))

        return RecommendationsResponse(
            recommendations=response_recs,
            total = len(response_recs),
            query_info =  {
                "type" : "by_id",
                "car_id" : request.car_id,
                "user_location": user_location.model_dump() if user_location else None,
                "weights": {
                    "similarity": request.similarity_weight or 0.7,
                    "distance": request.distance_weight or 0.3
                }
            }
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

@router.post("/by-text", response_model=RecommendationsResponse)
def recommend_by_text(request: RecommendByTextRequest):
    """Get car recommendations based on a text query."""
    try:
        service = get_recommendation_service()

        user_location = None
        if request.user_latitude and request.user_longitude:
            user_location = Location(latitude=request.user_latitude, longitude=request.user_longitude)

        filters = CarFilters(
            min_price= request.min_price,
            max_price= request.max_price,
            min_year= request.min_year,
            max_year= request.max_year,
            manufacturers=request.manufacturers,
            types=request.types
        )

        recommendations = service.recommend_by_text(
            query_text=request.query,
            top_n=request.top_n,
            user_location=user_location,
            filters=filters,
            similarity_weight=request.similarity_weight,
            distance_weight=request.distance_weight
        )

        response_recs = []
        for rec in recommendations:
            car_response = CarResponse(
                car_id=rec.car.car_id,
                url=rec.car.url,
                price=rec.car.price,
                year=rec.car.year,
                manufacturer=rec.car.manufacturer,
                model=rec.car.model,
                condition=rec.car.condition,
                fuel=rec.car.fuel,
                odometer=rec.car.odometer,
                transmission=rec.car.transmission,
                type=rec.car.type,
                paint_color=rec.car.paint_color,
                state=rec.car.state,
                latitude=rec.car.location.latitude if rec.car.location else None,
                longitude=rec.car.location.longitude if rec.car.location else None
            )

            response_recs.append(RecommendationResponse(
                car=car_response,
                similarity_score=rec.similarity_score,
                distance_score=rec.distance_score,
                final_score=rec.final_score,
                distance_km=rec.distance_km,
                rank=rec.rank
            ))
        return RecommendationsResponse(
            recommendations=response_recs,
            total=len(response_recs),
            query_info={
                "type": "by_text",
                "query": request.query,
                "user_location": user_location.model_dump() if user_location else None,
                "weights": {
                    "similarity": request.similarity_weight,
                    "distance": request.distance_weight
                }
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "recommendations"}

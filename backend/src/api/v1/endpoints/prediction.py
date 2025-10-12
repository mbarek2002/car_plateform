from typing import List
from fastapi import Depends , APIRouter
from src.schemas.prediction_schema import PredictionInput , PredictionOutput
from src.services.prediction_service import PredictionService
from src.db.connection import get_database


router = APIRouter(prefix="/predict", tags=["predict"])

# ==================== ERROR HANDLERS ====================
@router.post("/", response_model=PredictionOutput ,  tags=["price prediction"])
def predict(data: PredictionInput, db=Depends(get_database)):
    print(data)
    service = PredictionService(db)
    return service.predict(data)

@router.get("/predictions", tags=["price prediction"])
def get_predictions(db=Depends(get_database)):
    service = PredictionService(db)
    return service.get_all_predictions()


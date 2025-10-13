from typing import List
from fastapi import Depends , APIRouter
from src.schemas.prediction_schema import PredictionInput , PredictionOutput
from src.services.prediction_service import PredictionService
from src.db.connection import get_database
from src.api.deps import get_prediction_service


router = APIRouter(prefix="/predict", tags=["predict"])

# ==================== ERROR HANDLERS ====================
@router.post("/", response_model=PredictionOutput )
def predict(
    data: PredictionInput,
    prediction_service: PredictionService = Depends(get_prediction_service)
      ):
    return prediction_service.predict(data)

@router.get("/predictions")
def get_predictions(
        prediction_service: PredictionService = Depends(get_prediction_service)):
    return prediction_service.get_all_predictions()


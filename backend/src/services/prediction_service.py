from src.repositories.prediction_repository import PredictionRepository
from src.schemas.prediction_schema import PredictionInput, PredictionOutput
import joblib
import numpy as np
from fastapi import HTTPException

class PredictionService:
    def __init__(self , db):
        self.repository = PredictionRepository(db)
        self.model = joblib.load("model.pkl")

    def predict(self , data : PredictionInput) -> PredictionOutput:
        try:
            features = np.array([[
                data.Milage_High,
                data.Accident_Impact,
                data.Age_Old,
                data.Milage_Medium,
                data.clean_title,
                data.Milage_Very_High,
                data.Vehicle_Age,
                data.hp,
                data.Age_Mid,
                data.engine_displacement,
                data.brand,
                data.fuel_type,
                data.Age_Very_Old,
                data.is_v_engine,
                data.Mileage_per_Year,
                data.transmission
            ]])
            
            prediction = self.model.predict(features)
            predicted_price = float(prediction[0])
            
            self.repository.save_prediction(data.dict(), predicted_price)
            
            return PredictionOutput(price=predicted_price)
        
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        
    def get_all_predictions(self):
        return self.repository.get_all_predictions()
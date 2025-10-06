from src.repositories.prediction_repository import PredictionRepository
from src.schemas.prediction_schema import PredictionInput, PredictionOutput
import joblib
import numpy as np
from fastapi import HTTPException
import os
import pandas as pd
import warnings
import pickle

class PredictionService:
    def __init__(self, db):
        self.repository = PredictionRepository(db)
        model_path = "src/models/model.pkl"
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file '{model_path}' not found")
        
        # self.model = joblib.load(model_path)
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)

    def predict(self , data : PredictionInput) -> PredictionOutput:
        try:
            features = [
                "Milage_High", "Accident_Impact", "Age_Old", "Milage_Medium",
                "clean_title", "Milage_Very High", "Vehicle_Age", "hp",
                "Age_Mid", "engine displacement", "brand", "fuel_type",
                "Age_Very Old", "is_v_engine", "Mileage_per_Year", "transmission"
                ]
            test_data = pd.DataFrame([{
                    "Milage_High": data.Milage_High,
                    "Accident_Impact": data.Accident_Impact,
                    "Age_Old": data.Age_Old,
                    "Milage_Medium": data.Milage_Medium,
                    "clean_title": data.clean_title,
                    "Milage_Very High": data.Milage_Very_High,
                    "Vehicle_Age": data.Vehicle_Age,
                    "hp": data.hp,
                    "Age_Mid": data.Age_Mid,
                    "engine displacement": data.engine_displacement,
                    "brand": data.brand,           # Encoded brand
                    "fuel_type": data.fuel_type,       # Encoded fuel type
                    "Age_Very Old": data.Age_Very_Old,
                    "is_v_engine": data.is_v_engine,
                    "Mileage_per_Year": data.Mileage_per_Year,
                    "transmission": data.transmission
                }])
            
            print(data)
            test_data = test_data[features]
            prediction = self.model.predict(test_data)
            predicted_price = float(np.expm1(prediction[0]))
            print(predicted_price)
            
            self.repository.save_prediction(data.dict(), predicted_price)
            
            return PredictionOutput(price=predicted_price)
        
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        
    def get_all_predictions(self):
        return self.repository.get_all_predictions()
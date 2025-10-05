from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PredictionInput(BaseModel):
    Milage_High: float
    Accident_Impact: float
    Age_Old: float
    Milage_Medium: float
    clean_title: float
    Milage_Very_High: float
    Vehicle_Age: float
    hp: float
    Age_Mid: float
    engine_displacement: float
    brand: float
    fuel_type: float
    Age_Very_Old: float
    is_v_engine: float
    Mileage_per_Year: float
    transmission: float

class PredictionOutput(BaseModel):
    price: float
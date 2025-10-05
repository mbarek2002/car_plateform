from pymongo import Database
from datetime import datetime
from typing import List , Dict

class PredictionRepository:
    def __init__(self, db: Database):
        self.collection = db["predictions"]

    def save_prediction(self, input_data:Dict , predicted_price:float )->Dict :
        document = {
            **input_data , 
            "predicted_price" : predicted_price,
            "created_at" : datetime.utcnow()
        }

        result = self.collection.insert_one(document)
        document['_id'] = str(result.inserted_id)
        return document
    
    def get_all_predictions(self)->List[Dict]:
        predictions = List(self.collection.find().sort("created_at",-1))
        for pred in predictions:
            pred["_id"] = str(pred["_id"])
        return predictions

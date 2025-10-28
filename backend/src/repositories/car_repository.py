from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from src.schemas.car import Car, CarFilters, Location
from src.config import get_settings
from geopy.distance import geodesic


class CarRepository:
    """Repository for car data operations."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.settings = get_settings()
        self.collection = db[self.settings.CARS_COLLECTION]
    
    async def find_by_id(self, car_id: str) -> Optional[Car]:
        """Find car by ID."""
        doc = await self.collection.find_one({"car_id": car_id})
        if doc:
            doc.pop("_id", None)
            return self._doc_to_car(doc)
        return None
    
    async def find_all(self, filters: Optional[CarFilters] = None, skip: int = 0, limit: int = 100) -> list[Car]:
        """Find all cars with filters."""
        query = self._build_query(filters) if filters else {}
        cursor = self.collection.find(query).skip(skip).limit(limit)
        cars = []
        async for doc in cursor:
            doc.pop("_id", None)
            cars.append(self._doc_to_car(doc))
        return cars
    
    async def count(self, filters: Optional[CarFilters] = None) -> int:
        """Count cars matching filters."""
        query = self._build_query(filters) if filters else {}
        return await self.collection.count_documents(query)
    
    async def create_many(self, cars: list[Car]) -> int:
        """Create multiple cars."""
        if not cars:
            return 0
        docs = [self._car_to_doc(car) for car in cars]
        result = await self.collection.insert_many(docs, ordered=False)
        return len(result.inserted_ids)
    
    def _build_query(self, filters: CarFilters) -> dict:
        """Build MongoDB query from filters."""
        query = {}
        if filters.min_price or filters.max_price:
            query["price"] = {}
            if filters.min_price:
                query["price"]["$gte"] = filters.min_price
            if filters.max_price:
                query["price"]["$lte"] = filters.max_price
        if filters.min_year or filters.max_year:
            query["year"] = {}
            if filters.min_year:
                query["year"]["$gte"] = filters.min_year
            if filters.max_year:
                query["year"]["$lte"] = filters.max_year
        if filters.manufacturers:
            query["manufacturer"] = {"$in": filters.manufacturers}
        if filters.types:
            query["type"] = {"$in": filters.types}
        if filters.states:
            query["state"] = {"$in": filters.states}
        return query
    
    def _doc_to_car(self, doc: dict) -> Car:
        """Convert MongoDB document to Car."""
        if "location" in doc and isinstance(doc["location"], dict):
            if doc["location"].get("type") == "Point":
                coords = doc["location"]["coordinates"]
                doc["location"] = Location(longitude=coords[0], latitude=coords[1])
        return Car(**doc)
    
    def _car_to_doc(self, car: Car) -> dict:
        """Convert Car to MongoDB document."""
        data = car.model_dump(exclude_none=True)
        if car.location:
            data["location"] = {
                "type": "Point",
                "coordinates": [car.location.longitude, car.location.latitude]
            }
        return data
import numpy as np
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from src.config import get_settings


class EmbeddingRepository:
    """Repository for embedding data operations."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.settings = get_settings()
        self.collection = db[self.settings.EMBEDDINGS_COLLECTION]
        self._cache = {}
    
    async def get_embedding(self, car_id: str) -> Optional[np.ndarray]:
        """Get embedding for a car."""
        if car_id in self._cache:
            return self._cache[car_id]
        doc = await self.collection.find_one({"car_id": car_id})
        if doc and "embedding" in doc:
            embedding = np.array(doc["embedding"], dtype=np.float32)
            self._cache[car_id] = embedding
            return embedding
        return None
    
    async def get_all_embeddings(self) -> dict[str, np.ndarray]:
        """Get all embeddings."""
        if self._cache:
            return self._cache
        embeddings = {}
        cursor = self.collection.find({})
        async for doc in cursor:
            car_id = doc["car_id"]
            embedding = np.array(doc["embedding"], dtype=np.float32)
            embeddings[car_id] = embedding
        self._cache = embeddings
        return embeddings
    
    async def save_many_embeddings(self, embeddings: dict[str, np.ndarray]) -> int:
        """Save multiple embeddings."""
        if not embeddings:
            return 0
        from pymongo import UpdateOne
        operations = [
            UpdateOne(
                {"car_id": car_id},
                {"$set": {"car_id": car_id, "embedding": emb.tolist()}},
                upsert=True
            )
            for car_id, emb in embeddings.items()
        ]
        result = await self.collection.bulk_write(operations)
        self._cache.update(embeddings)
        return result.upserted_count + result.modified_count


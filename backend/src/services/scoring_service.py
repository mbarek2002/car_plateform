import numpy as np
from typing import Optional
from sklearn.metrics.pairwise import cosine_similarity
from src.schemas.car_schemas import Location
from src.core.config import settings
from geopy.distance import geodesic


class ScoringService :
    """Service for calculating recommendation scores."""
    def __init__(self):
        self.settings = settings
        self.similarity_weight = self.settings.SIMILARITY_WEIGHT
        self.distance_weight = self.settings.DISTANCE_WEIGHT
        self.max_distance_km = self.settings.MAX_DISTANCE_KM

    def calculate_cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """
        Calculate cosine similarity between two vectors using sklearn.
        Returns value between 0 and 1.
        """
        # Reshape vectors to 2D arrays for sklearn
        vec1_2d = vec1.reshape(1,-1)
        vec2_2d = vec2.reshape(1,-1)

        # Calculate cosine similarity using sklearn
        similarity = cosine_similarity(vec1_2d,vec2_2d)[0][0]

        # Normalize to 0-1 range (cosine_similarity returns -1 to 1)
        # For embeddings, typically positive, but we ensure 0-1 range
        return max(0.0, min(1.0, (similarity + 1) / 2))
    
    def calculate_distance_score(self, distance_km: float, max_distance: Optional[float] = None) -> float:
        """Calculate distance score (inverse of distance)."""
        if max_distance is None:
            max_distance = self.max_distance_km
        if distance_km <= 0:
            return 1.0
        if distance_km >= max_distance:
            return 0.0
        return 1.0 - (distance_km / max_distance)
    
    def calculate_final_score(
        self,
        similarity_score: float,
        distance_score: float,
        custom_similarity_weight: Optional[float] = None,
        custom_distance_weight: Optional[float] = None
    ) -> float:
        """Calculate final weighted score."""
        sim_weight = custom_similarity_weight or self.similarity_weight
        dist_weight = custom_distance_weight or self.distance_weight
        final = (sim_weight * similarity_score) + (dist_weight * distance_score)
        return max(0.0, min(1.0, final))
    
    def calculate_distance(self, loc1: Location, loc2: Location) -> float:
        """Calculate distance between two locations in km."""
        point1 = (loc1.latitude, loc1.longitude)
        point2 = (loc2.latitude, loc2.longitude)
        return geodesic(point1, point2).kilometers       


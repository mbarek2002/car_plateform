from typing import Optional
from src.repositories.car_repository import CarRepository
from src.repositories.embedding_repository import EmbeddingRepository
from src.services.scoring_service import ScoringService
# from src.stores.embeddings.model import EmbeddingModel
from src.schemas.car_schemas import Location, CarFilters
from src.schemas.recommendation_schemas import Recommendation
from src.core.config import settings


class RecommendationService:
    """Service for generating car recommendations."""
    
    def __init__(
        self,
        car_repo: CarRepository,
        embedding_repo: EmbeddingRepository,
        scoring_service: ScoringService,
        # embedding_model: EmbeddingModel
    ):
        self.car_repo = car_repo
        self.embedding_repo = embedding_repo
        self.scoring_service = scoring_service
        # self.embedding_model = embedding_model
        self.settings = settings
        self.embedding_model = self.settings.rag_service.embedding
    
    def recommend_by_car_id(
        self,
        car_id: str,
        top_n: int = 10,
        user_location: Optional[Location] = None,
        filters: Optional[CarFilters] = None,
        similarity_weight: Optional[float] = None,
        distance_weight: Optional[float] = None
    ) -> list[Recommendation]:
        """Recommend similar cars based on car ID."""
        top_n = min(top_n , self.settings.MAX_TOP_N)
        query_embedding = self.embedding_repo.get_embedding(car_id)
        if query_embedding is None:
            raise ValueError(f"No embedding found for car_id: {car_id}")

        all_embeddings = self.embedding_repo.get_all_embeddings()
        similarities = {}

        for cid , embedding in all_embeddings.items():
            if cid == car_id:
                continue
            sim_score = self.scoring_service.calculate_cosine_similarity(query_embedding , embedding)
            if sim_score >= self.settings.SIMILARITY_THRESHOLD:
                similarities[cid]  = sim_score

        sorted_cars = sorted(similarities.items() , key = lambda x :x[1] , reverse=True)[:top_n*3]

        recommendations = self._build_recommendations(
            sorted_cars , user_location , filters , similarity_weight , distance_weight , top_n
        )
        return recommendations
    

    def recommend_by_text(
            self,
            query_text:str,
            top_n:int = 10,
            user_location:Optional[Location] = None,
            filters:Optional[CarFilters] = None,
            similarity_weight : Optional[float] = None,
            distance_weight : Optional[float] = None
    ) -> list[Recommendation]:
        """Recommend cars based on text query."""
        top_n = min(top_n , self.settings.MAX_TOP_N)
        query_embeddings = self.embedding_model.embed(query_text)
        all_embeddings = self.embedding_repo.get_all_embeddings()

        similarities = {}
        for car_id , embedding in all_embeddings.items():
            sim_score = self.scoring_service.calculate_cosine_similarity(query_embeddings , embedding)
            if sim_score >= self.settings.SIMILARITY_THRESHOLD:
                similarities[car_id] = sim_score

        sorted_cars = sorted(similarities.items() , key= lambda x:x[1],reverse=True)[:top_n * 3]
        recommendations = self._build_recommendations(
            sorted_cars, user_location, filters, similarity_weight, distance_weight, top_n
        )
        return recommendations
    
    def _build_recommendations(
        self,
        sorted_cars: list[tuple[str, float]],
        user_location: Optional[Location],
        filters: Optional[CarFilters],
        similarity_weight: Optional[float],
        distance_weight: Optional[float],
        top_n: int
    ) -> list[Recommendation]:
        """Build recommendation objects from sorted cars."""
        recommendations = []
        
        for car_id, sim_score in sorted_cars:
            car = self.car_repo.find_by_id(car_id)
            if car is None:
                continue
            if filters and not self._matches_filters(car, filters):
                continue
            
            distance_km = None
            dist_score = 1.0
            
            if user_location and car.location:
                distance_km = self.scoring_service.calculate_distance(user_location, car.location)
                dist_score = self.scoring_service.calculate_distance_score(distance_km)
            
            final_score = self.scoring_service.calculate_final_score(
                sim_score, dist_score, similarity_weight, distance_weight
            )
            
            recommendations.append({
                'car': car,
                'similarity_score': sim_score,
                'distance_score': dist_score,
                'final_score': final_score,
                'distance_km': distance_km
            })
            
            if len(recommendations) >= top_n:
                break
        
        # Sort by final score
        recommendations.sort(key=lambda x: x['final_score'], reverse=True)
        
        # Create Recommendation objects with proper ranks
        result = []
        for i, rec_data in enumerate(recommendations[:top_n], start=1):
            result.append(Recommendation(
                car=rec_data['car'],
                similarity_score=rec_data['similarity_score'],
                distance_score=rec_data['distance_score'],
                final_score=rec_data['final_score'],
                distance_km=rec_data['distance_km'],
                rank=i
            ))
        
        return result
    
    def _matches_filters(self, car, filters: CarFilters) -> bool:
        """Check if car matches filters."""
        if filters.min_price and car.price < filters.min_price:
            return False
        if filters.max_price and car.price > filters.max_price:
            return False
        if filters.min_year and car.year < filters.min_year:
            return False
        if filters.max_year and car.year > filters.max_year:
            return False
        if filters.manufacturers and car.manufacturer not in filters.manufacturers:
            return False
        if filters.types and car.type not in filters.types:
            return False
        if filters.states and car.state not in filters.states:
            return False
        return True


import json
import numpy as np
from typing import Optional
from pathlib import Path
from src.core.config import settings
import os
from pathlib import Path


class EmbeddingRepository:
    """Repository for embedding data operations - reads from JSON file."""
    
    _embeddings_cache = None
    _current_dir = Path.cwd()

    def __init__(self):
        self.settings = settings
        self.data_file = EmbeddingRepository._current_dir / self.settings.DATA_FILE_PATH
        if EmbeddingRepository._embeddings_cache is None:
            self._load_embeddings()

    def _load_embeddings(self):
        """Load embeddings from JSON file once."""
        print(f"📂 Loading embeddings from {self.data_file}...")
        with open(self.data_file,'r',encoding='utf-8')  as f:
            data = json.load(f)

        EmbeddingRepository._embeddings_cache = {}
        for car_id , car_data in data['embeddings'].items():
            embedding = np.array(car_data['embedding'],dtype=np.float32)
            EmbeddingRepository._embeddings_cache[car_id] = embedding
        
        print(f"✅ Loaded {len(EmbeddingRepository._embeddings_cache)} embeddings")

    def get_embedding(self , car_id:str) -> Optional[np.array]:
        """Get embedding for a car."""
        return EmbeddingRepository._embeddings_cache.get(car_id)
    
    def get_all_embeddings(self) ->dict[str, np.array]:
        """Get all embeddings."""
        print(self.data_file)
        return EmbeddingRepository._embeddings_cache
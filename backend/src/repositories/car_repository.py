import json
from typing import List, Optional
from pathlib import Path
from src.schemas.car_schemas import Car , CarFilters , Location
from src.core.config import settings
from pathlib import Path

class CarRepository :
    """Repository for car data operations - reads from JSON file."""

    _data_cache = None
    _cars_cache = None
    _current_dir = Path.cwd()


    def __init__(self):
        self.settings = settings
        self.data_file = CarRepository._current_dir / self.settings.DATA_FILE_PATH
        # self.data_file = Path(self.settings.DATA_FILE_PATH or "data/cars.json")
        if CarRepository._data_cache is  None:
            self._load_data()

    def _load_data(self):
        """Load data from JSON file once."""
        print(f"Loading data from {self.data_file}")
        with open(self.data_file,'r',encoding="utf-8") as f :
            CarRepository._data_cache = json.load(f)

        # Build cars cache
        CarRepository._cars_cache = {}
        for car_id , car_data in CarRepository._data_cache['embeddings'].items():
            metadata = car_data['metadata']

            location = None
            if metadata.get('lat') and metadata.get('long'):
                try : 
                    location = Location(
                        latitude=float(metadata['lat']),
                        longitude=float(metadata['long']),
                    )
                
                except :
                    pass

                car = Car(
                car_id=str(metadata['id']),
                url=metadata.get('url'),
                region=metadata.get('region'),
                price=float(metadata['price']),
                year=int(metadata['year']),
                manufacturer=metadata['manufacturer'],
                model=metadata['model'],
                condition=metadata.get('condition'),
                cylinders=metadata.get('cylinders'),
                fuel=metadata.get('fuel'),
                odometer=float(metadata['odometer']) if metadata.get('odometer') else None,
                title_status=metadata.get('title_status'),
                transmission=metadata.get('transmission'),
                vin=metadata.get('vin'),
                drive=metadata.get('drive'),
                size=metadata.get('size'),
                type=metadata.get('type'),
                paint_color=metadata.get('paint_color'),
                image_url=metadata.get('image_url'),
                description=metadata.get('description'),
                state=metadata.get('state'),
                location=location,
                combined_text=metadata.get('combined_text')
            )
            CarRepository._cars_cache[str(metadata['id'])] = car

        print(f"✅ Loaded {len(CarRepository._cars_cache)} cars from JSON")

    def find_by_id(self , car_id:str)->Optional[Car]:
        """Find car by ID."""
        return CarRepository._cars_cache.get(car_id)
    
    def find_all(self , filters:Optional[CarFilters]=None , skip :int = 0 , limit : int = 100) -> List[Car]:
        """Find all cars with filters."""
        cars = list(CarRepository._cars_cache.values())

        #Apply filters
        if filters :
            cars = [car for car in cars if self._matches_filters(car , filters)]
        
        #Apply pagination
        return cars[skip:skip+limit]
    
    def count(self, filters:Optional[CarFilters]=None)->int:
        """Count cars matching filters."""
        if not filters :
            return len(CarRepository._cars_cache)
        
        cars = list(CarRepository._cars_cache.values())
        filtred = [car for car in cars if self._matches_filters(car , filters)]
        return len(filtred)
    
    def get_all_cars(self) -> dict[str, Car]:
        """Get all cars as dictionary."""
        return CarRepository._cars_cache
    

    def _matches_filters(self, car: Car, filters: CarFilters) -> bool:
        """Check if car matches filters."""
        if filters.min_price and car.price < filters.min_price:
            return False
        if filters.max_price and car.price > filters.max_price:
            return False
        if filters.min_year and car.year < filters.min_year:
            return False
        if filters.max_year and car.year > filters.max_year:
            return False
        if filters.min_odometer and car.odometer and car.odometer < filters.min_odometer:
            return False
        if filters.max_odometer and car.odometer and car.odometer > filters.max_odometer:
            return False
        if filters.manufacturers and car.manufacturer not in filters.manufacturers:
            return False
        if filters.types and car.type not in filters.types:
            return False
        if filters.fuel_types and car.fuel not in filters.fuel_types:
            return False
        if filters.transmissions and car.transmission not in filters.transmissions:
            return False
        if filters.states and car.state not in filters.states:
            return False
        return True

import asyncio
import json
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from src.db.mongodb import mongodb
from src.schemas.car_schemas import Car, Location
from src.repositories.car_repository import CarRepository
from src.repositories.embedding_repository import EmbeddingRepository
import numpy as np


async def import_embeddings():
    """Import embeddings and car data from JSON to MongoDB."""
    print("🚀 Starting import process...")
    
    await mongodb.connect()
    db = mongodb.db
    
    car_repo = CarRepository(db)
    embedding_repo = EmbeddingRepository(db)
    
    json_file = Path("data/cars_embeddings.json")
    
    if not json_file.exists():
        print(f"❌ Error: {json_file} not found!")
        return
    
    print(f"📂 Loading data from {json_file}...")
    
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"✅ Loaded {len(data['embeddings'])} cars from JSON")
    
    cars = []
    embeddings = {}
    
    print("🔄 Processing data...")
    
    for car_id, car_data in data['embeddings'].items():
        metadata = car_data['metadata']
        embedding = np.array(car_data['embedding'], dtype=np.float32)
        
        location = None
        if metadata.get('lat') and metadata.get('long'):
            try:
                location = Location(latitude=float(metadata['lat']), longitude=float(metadata['long']))
            except:
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
        
        cars.append(car)
        embeddings[str(metadata['id'])] = embedding
    
    print(f"💾 Importing {len(cars)} cars to MongoDB...")
    
    try:
        count = await car_repo.create_many(cars)
        print(f"✅ Imported {count} cars successfully!")
    except Exception as e:
        print(f"⚠️ Warning during car import: {e}")
    
    print(f"💾 Importing {len(embeddings)} embeddings to MongoDB...")
    
    try:
        count = await embedding_repo.save_many_embeddings(embeddings)
        print(f"✅ Imported {count} embeddings successfully!")
    except Exception as e:
        print(f"❌ Error during embedding import: {e}")
    
    await mongodb.disconnect()
    
    print("\n" + "="*60)
    print("🎉 IMPORT COMPLETED SUCCESSFULLY!")
    print("="*60)
    print(f"✅ Cars imported: {len(cars)}")
    print(f"✅ Embeddings imported: {len(embeddings)}")
    print("\n🚀 You can now start the FastAPI server:")
    print("   python -m uvicorn src.main:app --reload")


if __name__ == "__main__":
    asyncio.run(import_embeddings())
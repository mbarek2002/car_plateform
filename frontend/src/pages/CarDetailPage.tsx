import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { carService, Car } from '../services/car-api';

const CarDetailPage: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCarDetails = async () => {
      if (!carId) return;
      
      try {
        setLoading(true);
        const data = await carService.getCarById(carId);
        setCar(data);
      } catch (err) {
        setError('Erreur lors du chargement des détails de la voiture');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [carId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || "Voiture non trouvée"}
        </div>
        <Link to="/cars" className="text-blue-500 hover:underline">
          &larr; Retour à la liste des voitures
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link to="/cars" className="text-blue-500 hover:underline">
          &larr; Retour à la liste des voitures
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{car.manufacturer} {car.model}</h1>
          <div className="text-2xl font-bold text-green-600 mb-4">{car.price.toLocaleString()} €</div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">Caractéristiques</h2>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Année</span>
                  <span className="font-medium">{car.year}</span>
                </li>
                {car.condition && (
                  <li className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">État</span>
                    <span className="font-medium">{car.condition}</span>
                  </li>
                )}
                {car.fuel && (
                  <li className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Carburant</span>
                    <span className="font-medium">{car.fuel}</span>
                  </li>
                )}
                {car.transmission && (
                  <li className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Transmission</span>
                    <span className="font-medium">{car.transmission}</span>
                  </li>
                )}
                {car.odometer !== undefined && (
                  <li className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Kilométrage</span>
                    <span className="font-medium">{car.odometer.toLocaleString()} km</span>
                  </li>
                )}
                {car.type && (
                  <li className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Type</span>
                    <span className="font-medium">{car.type}</span>
                  </li>
                )}
                {car.paint_color && (
                  <li className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Couleur</span>
                    <span className="font-medium">{car.paint_color}</span>
                  </li>
                )}
              </ul>
            </div>
            
            <div>
              {car.latitude && car.longitude && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Localisation</h2>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="mb-2">État: {car.state || "Non spécifié"}</p>
                    <p>Coordonnées: {car.latitude.toFixed(6)}, {car.longitude.toFixed(6)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <Link 
              to={`/recommendations/${car.car_id}`} 
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg inline-block"
            >
              Voir des voitures similaires
            </Link>
            
            {car.url && (
              <a 
                href={car.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="ml-4 text-blue-500 hover:underline"
              >
                Voir l'annonce originale
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailPage;
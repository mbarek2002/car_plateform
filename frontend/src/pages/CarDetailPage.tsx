import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { carService, Car } from '../services/car-api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

// Fix for default marker icon
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

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
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-ping"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-700">{error || "Voiture non trouvée"}</p>
            </div>
          </div>
        </div>
        <Link to="/cars" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour à la liste des voitures
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link to="/cars" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour à la liste des voitures
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{car.manufacturer} {car.model}</h1>
            <div className="text-3xl font-bold text-blue-600">{car.price.toLocaleString()} €</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Caractéristiques
              </h2>
              <ul className="space-y-3">
                <li className="flex justify-between items-center p-2 hover:bg-white rounded-lg transition-colors">
                  <span className="text-gray-600">Année</span>
                  <span className="font-medium text-gray-900">{car.year}</span>
                </li>
                {car.condition && (
                  <li className="flex justify-between items-center p-2 hover:bg-white rounded-lg transition-colors">
                    <span className="text-gray-600">État</span>
                    <span className="font-medium text-gray-900">{car.condition}</span>
                  </li>
                )}
                {car.fuel && (
                  <li className="flex justify-between items-center p-2 hover:bg-white rounded-lg transition-colors">
                    <span className="text-gray-600">Carburant</span>
                    <span className="font-medium text-gray-900">{car.fuel}</span>
                  </li>
                )}
                {car.transmission && (
                  <li className="flex justify-between items-center p-2 hover:bg-white rounded-lg transition-colors">
                    <span className="text-gray-600">Transmission</span>
                    <span className="font-medium text-gray-900">{car.transmission}</span>
                  </li>
                )}
                {car.odometer !== undefined && (
                  <li className="flex justify-between items-center p-2 hover:bg-white rounded-lg transition-colors">
                    <span className="text-gray-600">Kilométrage</span>
                    <span className="font-medium text-gray-900">{car.odometer.toLocaleString()} km</span>
                  </li>
                )}
                {car.type && (
                  <li className="flex justify-between items-center p-2 hover:bg-white rounded-lg transition-colors">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium text-gray-900">{car.type}</span>
                  </li>
                )}
                {car.paint_color && (
                  <li className="flex justify-between items-center p-2 hover:bg-white rounded-lg transition-colors">
                    <span className="text-gray-600">Couleur</span>
                    <span className="font-medium text-gray-900">{car.paint_color}</span>
                  </li>
                )}
              </ul>
            </div>
            
            <div>
              {car.latitude && car.longitude && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Localisation
                  </h2>
                  <div className="h-[400px] rounded-xl overflow-hidden shadow-lg">
                    <MapContainer
                      center={[car.latitude, car.longitude]}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                      className="z-0"
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker 
                        position={[car.latitude, car.longitude]} 
                        icon={defaultIcon}
                      >
                        <Popup>
                          <div className="text-center">
                            <strong>{car.manufacturer} {car.model}</strong>
                            <p>{car.state || "Location"}</p>
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                  <p className="mt-3 text-sm text-gray-600 flex items-center justify-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {car.state || "Location"}: {car.latitude.toFixed(6)}, {car.longitude.toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 border-t pt-8">
            <Link 
              to={`/recommendations/${car.car_id}`} 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Voir des voitures similaires
            </Link>
            
            {car.url && (
              <a 
                href={car.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
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
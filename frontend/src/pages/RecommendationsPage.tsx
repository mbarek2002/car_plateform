import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { carService, Car, Recommendation, RecommendationRequest } from '../services/car-api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';

// Correction pour les icônes Leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Icône personnalisée pour la voiture de référence
const referenceIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'reference-marker',
});

const RecommendationsPage: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const [searchParams] = useSearchParams();
  const [referenceCar, setReferenceCar] = useState<Car | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([48.8566, 2.3522]); // Paris par défaut
  const [showMap, setShowMap] = useState<boolean>(true);
  const mapRef = useRef<L.Map | null>(null);
  
  // Filtres pour les recommandations
  const [filters, setFilters] = useState<RecommendationRequest>({
    car_id: carId || '',
    top_n: parseInt(searchParams.get('topN') || '10'),
    similarity_weight: parseFloat(searchParams.get('similarityWeight') || '0.7'),
    distance_weight: parseFloat(searchParams.get('distanceWeight') || '0.3')
  });

  // Chargement des recommandations
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!carId) return;
      
      try {
        setLoading(true);
        
        // Charger les détails de la voiture de référence
        const carData = await carService.getCarById(carId);
        setReferenceCar(carData);
        
        // Définir le centre de la carte si la voiture a des coordonnées
        if (carData.latitude && carData.longitude) {
          setMapCenter([carData.latitude, carData.longitude]);
        }
        
        // Charger les recommandations
        const recommendationsData = await carService.getRecommendationsById({
          ...filters,
          car_id: carId
        });
        
        setRecommendations(recommendationsData.recommendations);
        setError(null);
        
        // Ajuster la vue de la carte pour inclure tous les points
        if (mapRef.current && recommendationsData.recommendations.length > 0) {
          const bounds = L.latLngBounds([]);
          
          // Ajouter la voiture de référence si elle a des coordonnées
          if (carData.latitude && carData.longitude) {
            bounds.extend([carData.latitude, carData.longitude]);
          }
          
          // Ajouter toutes les voitures recommandées qui ont des coordonnées
          recommendationsData.recommendations.forEach(rec => {
            if (rec.car.latitude && rec.car.longitude) {
              bounds.extend([rec.car.latitude, rec.car.longitude]);
            }
          });
          
          // Ajuster la vue si nous avons des points
          if (bounds.isValid()) {
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
          }
        }
      } catch (err) {
        setError('Erreur lors du chargement des recommandations');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carId, filters.top_n, filters.similarity_weight, filters.distance_weight]);

  // Gestion des filtres
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: name === 'top_n' ? parseInt(value) : parseFloat(value)
    }));
  };

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

  if (error || !referenceCar) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
            </svg>
            <p className="text-red-700">{error || "Voiture de référence non trouvée"}</p>
          </div>
        </div>
        <Link to="/cars" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link to={`/cars/${carId}`} className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-2">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour aux détails
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Voitures Similaires</h1>
        </div>
      </div>

      {/* Reference Car Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
        <h2 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Voiture de référence
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-2xl font-bold text-gray-900">{referenceCar.manufacturer} {referenceCar.model}</span>
          <div className="flex items-center gap-4 text-gray-600">
            <span className="px-3 py-1 bg-blue-50 rounded-full">{referenceCar.year}</span>
            <span className="font-semibold text-blue-600">{referenceCar.price.toLocaleString()} €</span>
            {referenceCar.odometer && (
              <span className="px-3 py-1 bg-blue-50 rounded-full">{referenceCar.odometer.toLocaleString()} km</span>
            )}
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
        <h2 className="text-xl font-semibold text-blue-600 mb-6 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Paramètres de recherche
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre de recommandations</label>
            <select
              name="top_n"
              value={filters.top_n}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Poids de similarité</label>
            <input
              type="range"
              name="similarity_weight"
              min="0"
              max="1"
              step="0.1"
              value={filters.similarity_weight}
              onChange={handleFilterChange}
              className="w-full"
            />
            <div className="text-center">{filters.similarity_weight}</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Poids de distance</label>
            <input
              type="range"
              name="distance_weight"
              min="0"
              max="1"
              step="0.1"
              value={filters.distance_weight}
              onChange={handleFilterChange}
              className="w-full"
            />
            <div className="text-center">{filters.distance_weight}</div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      {showMap && (
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="p-6 pb-0">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-blue-600 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Localisation des véhicules
              </h2>
              <button
                onClick={() => setShowMap(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="h-[500px] w-full">
            <MapContainer
               center={mapCenter}
               zoom={10}
               style={{ height: '100%', width: '100%' }}
             >
               <MapRefSetter onMap={(m) => { mapRef.current = m; }} />
               <TileLayer
                 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
               />
              {referenceCar?.latitude && referenceCar?.longitude && (
                <Marker
                  position={[referenceCar.latitude, referenceCar.longitude]}
                  icon={referenceIcon as L.Icon}
                >
                  <Popup>
                    <div>
                      <h3 className="font-bold">Voiture de référence</h3>
                      <p>{referenceCar.manufacturer} {referenceCar.model} ({referenceCar.year})</p>
                      <p>{referenceCar.price.toLocaleString()} €</p>
                    </div>
                  </Popup>
                </Marker>
              )}
              {recommendations.map((rec) => (
                rec.car.latitude && rec.car.longitude ? (
                  <Marker
                    key={rec.car.car_id}
                    position={[rec.car.latitude, rec.car.longitude]}
                  >
                    <Popup>
                      <div>
                        <h3 className="font-bold">{rec.car.manufacturer} {rec.car.model}</h3>
                        <p>{rec.car.year} • {rec.car.price.toLocaleString()} €</p>
                        <p>Score: {((rec.final_score ?? 0) * 100).toFixed(1)}%</p>
                        <Link to={`/cars/${rec.car.car_id}`} className="text-blue-600 hover:underline">Voir détails</Link>
                      </div>
                    </Popup>
                  </Marker>
                ) : null
              ))}
            </MapContainer>
          </div>
        </div>
      )}

      {/* Recommendations Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Recommandations ({recommendations.length})
        </h2>

        {recommendations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-blue-100">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl text-gray-600">Aucune recommandation trouvée</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((recommendation) => (
              <Link to={`/cars/${recommendation.car.car_id}`} key={recommendation.car.car_id} className="block">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold">{recommendation.car.manufacturer} {recommendation.car.model}</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                        Score: {((recommendation.final_score ?? 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600 dark:text-gray-300">{recommendation.car.year}</span>
                      <span className="font-bold text-green-600">{recommendation.car.price.toLocaleString()} €</span>
                    </div>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {recommendation.car.fuel && <span className="mr-2">{recommendation.car.fuel}</span>}
                      {recommendation.car.transmission && <span className="mr-2">{recommendation.car.transmission}</span>}
                      {recommendation.car.odometer && <span>{recommendation.car.odometer.toLocaleString()} km</span>}
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between text-xs">
                        <span>Similarité: {(recommendation.similarity_score * 100).toFixed(0)}%</span>
                        {recommendation.distance_km && (
                          <span>Distance: {recommendation.distance_km.toFixed(0)} km</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MapRefSetter: React.FC<{ onMap: (map: L.Map) => void }> = ({ onMap }) => {
  const map = useMap();
  useEffect(() => {
    onMap(map as unknown as L.Map);
  }, [map, onMap]);
  return null;
};

export default RecommendationsPage;
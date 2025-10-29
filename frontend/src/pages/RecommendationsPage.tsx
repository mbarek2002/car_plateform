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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !referenceCar) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || "Voiture de référence non trouvée"}
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
        <Link to={`/cars/${carId}`} className="text-blue-500 hover:underline">
          &larr; Retour aux détails de la voiture
        </Link>
      </div>

      {/* Voiture de référence */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-3">Voiture de référence</h2>
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <h3 className="text-lg font-medium">{referenceCar.manufacturer} {referenceCar.model}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {referenceCar.year} • {referenceCar.price.toLocaleString()} €
              {referenceCar.odometer && ` • ${referenceCar.odometer.toLocaleString()} km`}
            </p>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-3">Paramètres de recommandation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Carte des voitures */}
      {showMap && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Carte des voitures</h2>
            <button
              onClick={() => setShowMap(false)}
              className="text-gray-600 dark:text-gray-300 hover:underline"
            >
              Masquer la carte
            </button>
          </div>
          <div className="h-96 w-full rounded-lg overflow-hidden">
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
      {!showMap && (
        <div className="mb-6">
          <button onClick={() => setShowMap(true)} className="text-blue-600 hover:underline">
            Afficher la carte
          </button>
        </div>
      )}

      {/* Liste des recommandations */}
      <h2 className="text-2xl font-bold mb-4">Voitures similaires recommandées</h2>
      
      {recommendations.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <p className="text-xl">Aucune recommandation trouvée</p>
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
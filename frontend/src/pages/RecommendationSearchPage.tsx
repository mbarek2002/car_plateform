import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { carService, RecommendationRequest, TextRecommendationRequest } from '../services/car-api';

const RecommendationSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState<'by-id' | 'by-text'>('by-id');
  const [carId, setCarId] = useState<string>('');
  const [textQuery, setTextQuery] = useState<string>('');
  const [topN, setTopN] = useState<number>(10);
  const [similarityWeight, setSimilarityWeight] = useState<number>(0.7);
  const [distanceWeight, setDistanceWeight] = useState<number>(0.3);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Obtenir la localisation de l'utilisateur
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          setError("Impossible d'obtenir votre position. Veuillez l'entrer manuellement.");
        }
      );
    } else {
      setError("La géolocalisation n'est pas prise en charge par votre navigateur.");
    }
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (searchType === 'by-id' && carId) {
        // Rediriger vers la page de recommandations avec les paramètres
        navigate(`/recommendations/${carId}?topN=${topN}&similarityWeight=${similarityWeight}&distanceWeight=${distanceWeight}`);
      } else if (searchType === 'by-text' && textQuery) {
        // Pour les recommandations par texte, nous devons d'abord obtenir les résultats
        const request: TextRecommendationRequest = {
          query: textQuery,
          top_n: topN,
          similarity_weight: similarityWeight,
          distance_weight: distanceWeight
        };
        
        if (userLocation) {
          request.user_location = {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude
          };
        }
        
        const results = await carService.getRecommendationsByText(request);
        // Rediriger vers une page de résultats avec les données
        // Pour simplifier, nous utiliserons la même page de recommandations
        if (results.recommendations.length > 0) {
          const firstCarId = results.recommendations[0].car.car_id;
          navigate(`/recommendations/${firstCarId}?topN=${topN}&similarityWeight=${similarityWeight}&distanceWeight=${distanceWeight}&fromText=true`);
        } else {
          setError("Aucune recommandation trouvée pour cette recherche.");
        }
      } else {
        setError("Veuillez fournir un ID de voiture ou une requête textuelle.");
      }
    } catch (err) {
      console.error(err);
      setError("Une erreur s'est produite lors de la recherche de recommandations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Recherche de recommandations</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex space-x-4 mb-6">
          <button
            className={`px-4 py-2 rounded-md ${searchType === 'by-id' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setSearchType('by-id')}
          >
            Recherche par ID
          </button>
          <button
            className={`px-4 py-2 rounded-md ${searchType === 'by-text' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setSearchType('by-text')}
          >
            Recherche par texte
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {searchType === 'by-id' ? (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">ID de la voiture</label>
              <input
                type="text"
                value={carId}
                onChange={(e) => setCarId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Entrez l'ID de la voiture"
              />
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Description textuelle</label>
              <textarea
                value={textQuery}
                onChange={(e) => setTextQuery(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="Décrivez la voiture que vous recherchez..."
              />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">Nombre de recommandations</label>
              <input
                type="number"
                value={topN}
                onChange={(e) => setTopN(parseInt(e.target.value))}
                min="1"
                max="50"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Poids de similarité</label>
              <input
                type="range"
                value={similarityWeight}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setSimilarityWeight(value);
                  setDistanceWeight(parseFloat((1 - value).toFixed(1)));
                }}
                min="0"
                max="1"
                step="0.1"
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>0</span>
                <span>{similarityWeight.toFixed(1)}</span>
                <span>1</span>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Poids de distance</label>
            <input
              type="range"
              value={distanceWeight}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setDistanceWeight(value);
                setSimilarityWeight(parseFloat((1 - value).toFixed(1)));
              }}
              min="0"
              max="1"
              step="0.1"
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>0</span>
              <span>{distanceWeight.toFixed(1)}</span>
              <span>1</span>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <label className="block text-gray-700">Votre localisation</label>
              <button
                type="button"
                onClick={getUserLocation}
                className="text-blue-600 hover:text-blue-800"
              >
                Utiliser ma position actuelle
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              <input
                type="number"
                value={userLocation?.latitude || ''}
                onChange={(e) => setUserLocation({
                  ...userLocation || { longitude: 0 },
                  latitude: parseFloat(e.target.value)
                })}
                placeholder="Latitude"
                className="w-full px-3 py-2 border rounded-md"
              />
              <input
                type="number"
                value={userLocation?.longitude || ''}
                onChange={(e) => setUserLocation({
                  ...userLocation || { latitude: 0 },
                  longitude: parseFloat(e.target.value)
                })}
                placeholder="Longitude"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              disabled={loading || (searchType === 'by-id' && !carId) || (searchType === 'by-text' && !textQuery)}
            >
              {loading ? 'Recherche...' : 'Rechercher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecommendationSearchPage;
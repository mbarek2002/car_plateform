import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { carService, TextRecommendationRequest } from '../services/car-api';

const RecommendationSearchPage: React.FC = () => {
  const navigate = useNavigate();
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
      if (results.recommendations.length > 0) {
        const firstCarId = results.recommendations[0].car.car_id;
        navigate(`/recommendations/${firstCarId}?topN=${topN}&similarityWeight=${similarityWeight}&distanceWeight=${distanceWeight}&fromText=true`);
      } else {
        setError("Aucune recommandation trouvée pour cette recherche.");
      }
    } catch (err) {
      console.error(err);
      setError("Une erreur s'est produite lors de la recherche de recommandations.");
    } finally {
      setLoading(false);
    }
  };

  // Hero header
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div className="relative rounded-3xl p-8 md:p-12 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 shadow-sm text-center">
        <div className="absolute inset-0 -z-10 blur-3xl bg-blue-100/30 rounded-[2rem]"></div>
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700">Recherche de Voiture</h1>
        <p className="mt-3 text-gray-700 text-lg">Trouvez la voiture parfaite en décrivant vos préférences</p>
        <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
          <span className="px-3 py-1.5 rounded-full bg-white/70 border border-blue-200 text-sm text-blue-700">Recherche texte</span>
          <span className="px-3 py-1.5 rounded-full bg-white/70 border border-blue-200 text-sm text-blue-700">Basée sur la localisation</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
          <div className="px-3 py-2 rounded-full bg-white/70 border border-blue-200 text-sm text-blue-700">Ex: SUV familial économique</div>
          <div className="px-3 py-2 rounded-full bg-white/70 border border-blue-200 text-sm text-blue-700">Ex: Sportive rouge &lt; 50k km</div>
          <div className="px-3 py-2 rounded-full bg-white/70 border border-blue-200 text-sm text-blue-700">Ex: Hybride, automatique, 2018+</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <label className="block text-lg font-medium text-blue-600">Description de la voiture souhaitée</label>
            <textarea
              value={textQuery}
              onChange={(e) => setTextQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
              rows={4}
              placeholder="Ex: Je recherche une voiture sportive rouge avec moins de 50000 km..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-blue-600">Nombre de recommandations</label>
              <input
                type="number"
                value={topN}
                onChange={(e) => setTopN(parseInt(e.target.value))}
                min="1"
                max="50"
                className="w-full px-4 py-2 rounded-full border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-blue-600">
                  Poids de similarité ({similarityWeight.toFixed(1)})
                </label>
                <input
                  type="range"
                  value={similarityWeight}
                  onChange={(e) => setSimilarityWeight(parseFloat(e.target.value))}
                  min="0"
                  max="1"
                  step="0.1"
                  className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>0.0</span>
                  <span>0.5</span>
                  <span>1.0</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-blue-600">
                  Poids de distance ({distanceWeight.toFixed(1)})
                </label>
                <input
                  type="range"
                  value={distanceWeight}
                  onChange={(e) => setDistanceWeight(parseFloat(e.target.value))}
                  min="0"
                  max="1"
                  step="0.1"
                  className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>0.0</span>
                  <span>0.5</span>
                  <span>1.0</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-blue-600">Votre localisation</label>
              <button
                type="button"
                onClick={getUserLocation}
                className="inline-flex items-center px-3 py-1.5 rounded-full border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Utiliser ma position
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                value={userLocation?.latitude || ''}
                onChange={(e) => setUserLocation(prev => ({
                  ...prev || { longitude: 0 },
                  latitude: parseFloat(e.target.value)
                }))}
                placeholder="Latitude"
                className="w-full px-4 py-2 rounded-full border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
              <input
                type="number"
                value={userLocation?.longitude || ''}
                onChange={(e) => setUserLocation(prev => ({
                  ...prev || { latitude: 0 },
                  longitude: parseFloat(e.target.value)
                }))}
                placeholder="Longitude"
                className="w-full px-4 py-2 rounded-full border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading || !textQuery.trim()}
              className="w-full py-4 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Recherche en cours...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Rechercher des recommandations</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecommendationSearchPage;
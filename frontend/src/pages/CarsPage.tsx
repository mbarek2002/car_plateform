import React, { useState, useEffect } from 'react';
import { carService, Car, CarFilters } from '../services/car-api';
import { Link } from 'react-router-dom';

const CarsPage: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CarFilters>({});
  const [skip, setSkip] = useState<number>(0);
  const [limit] = useState<number>(20);

  // Chargement des voitures
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const data = await carService.getCars(filters, skip, limit);
        setCars(data);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des voitures');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [filters, skip, limit]);

  // Gestion des filtres
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setSkip(0); // Réinitialiser la pagination lors du changement de filtre
  };

  // Pagination
  const handleNextPage = () => {
    setSkip(prev => prev + limit);
  };

  const handlePrevPage = () => {
    setSkip(prev => Math.max(0, prev - limit));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Catalogue de Voitures</h1>
      
      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Filtres</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Fabricant</label>
            <input
              type="text"
              name="manufacturer"
              value={filters.manufacturer || ''}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
              placeholder="Ex: Toyota, BMW..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prix minimum</label>
            <input
              type="number"
              name="min_price"
              value={filters.min_price || ''}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
              placeholder="Prix min"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prix maximum</label>
            <input
              type="number"
              name="max_price"
              value={filters.max_price || ''}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
              placeholder="Prix max"
            />
          </div>
        </div>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Chargement */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Liste des voitures */}
          {cars.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xl">Aucune voiture trouvée</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <Link to={`/cars/${car.car_id}`} key={car.car_id} className="block">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-2">{car.manufacturer} {car.model}</h3>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600 dark:text-gray-300">{car.year}</span>
                        <span className="font-bold text-green-600">{car.price.toLocaleString()} €</span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {car.fuel && <span className="mr-2">{car.fuel}</span>}
                        {car.transmission && <span className="mr-2">{car.transmission}</span>}
                        {car.odometer && <span>{car.odometer.toLocaleString()} km</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handlePrevPage}
              disabled={skip === 0}
              className={`px-4 py-2 rounded ${
                skip === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Précédent
            </button>
            <span>Page {Math.floor(skip / limit) + 1}</span>
            <button
              onClick={handleNextPage}
              disabled={cars.length < limit}
              className={`px-4 py-2 rounded ${
                cars.length < limit ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Suivant
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CarsPage;
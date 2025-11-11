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
      } catch (err: any) {
        const status = err?.response?.status;
        const detail = err?.response?.data?.detail || err?.message;
        setError(detail || 'Erreur lors du chargement des voitures');
        console.error('Cars fetch error', { status, detail, err });
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">
          Explore Our Cars
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Find your perfect car from our extensive collection of quality vehicles
        </p>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl border border-blue-100">
        <h2 className="text-2xl font-semibold text-blue-600 mb-6 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter Cars
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-blue-600">Manufacturer</label>
            <input
              type="text"
              name="manufacturer"
              value={filters.manufacturer || ''}
              onChange={handleFilterChange}
              className="w-full p-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="Ex: Toyota, BMW..."
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-blue-600">Minimum Price</label>
            <input
              type="number"
              name="min_price"
              value={filters.min_price || ''}
              onChange={handleFilterChange}
              className="w-full p-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="Min price"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-blue-600">Maximum Price</label>
            <input
              type="number"
              name="max_price"
              value={filters.max_price || ''}
              onChange={handleFilterChange}
              className="w-full p-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="Max price"
            />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-amber-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.721-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.981-1.742 2.981H4.42c-1.53 0-2.493-1.647-1.743-2.981l5.58-9.92zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-2a1 1 0 01-1-1V7a1 1 0 112 0v3a1 1 0 01-1 1z" clipRule="evenodd" />
            </svg>
            <span className="text-amber-800">{error}</span>
          </div>
          <button
            onClick={() => {
              // trigger refetch by nudging skip (and restoring)
              setSkip((s) => s);
            }}
            className="ml-4 px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 text-sm"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="relative w-20 h-20">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Cars Grid */}
          {cars.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-xl text-gray-600">No cars found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cars.map((car) => (
                <Link to={`/cars/${car.car_id}`} key={car.car_id} 
                  className="group block transform transition-all duration-300 hover:-translate-y-1">
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-50 group-hover:shadow-xl transition-shadow">
                    <div className="p-6 space-y-4">
                      <h3 className="text-2xl font-bold text-blue-900 group-hover:text-blue-600 transition-colors">
                        {car.manufacturer} {car.model}
                      </h3>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 bg-blue-50 px-3 py-1 rounded-full text-sm">
                          {car.year}
                        </span>
                        <span className="text-2xl font-bold text-blue-600">
                          {car.price.toLocaleString()}€
                        </span>
                      </div>
                      <div className="flex gap-3 text-sm text-gray-600">
                        {car.fuel && (
                          <span className="bg-gray-100 px-3 py-1 rounded-full">
                            {car.fuel}
                          </span>
                        )}
                        {car.transmission && (
                          <span className="bg-gray-100 px-3 py-1 rounded-full">
                            {car.transmission}
                          </span>
                        )}
                        {car.odometer && (
                          <span className="bg-gray-100 px-3 py-1 rounded-full">
                            {car.odometer.toLocaleString()} km
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              onClick={handlePrevPage}
              disabled={skip === 0}
              className="px-6 py-3 rounded-xl bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
              Previous
            </button>
            <span className="text-lg font-medium text-blue-900">
              Page {Math.floor(skip / limit) + 1}
            </span>
            <button
              onClick={handleNextPage}
              disabled={cars.length < limit}
              className="px-6 py-3 rounded-xl bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CarsPage;
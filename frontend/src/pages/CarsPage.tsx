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

  const clearFilters = () => {
    setFilters({});
    setSkip(0);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section */}
      <div className="mb-10">
        <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="px-6 md:px-10 py-10 md:py-14 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-blue-900">Find Your Next Car</h1>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">Browse hand‑picked listings with clean UI and smooth filters.</p>
            <div className="mt-6 flex justify-center gap-4">
              <button onClick={clearFilters} className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">Clear filters</button>
              <a href="#cars" className="px-4 py-2 rounded-full bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors">Browse cars</a>
            </div>
          </div>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-200/40 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-indigo-200/40 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl border border-blue-100 md:sticky md:top-6">
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
        <div id="cars" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-blue-100 bg-white p-6 animate-pulse">
              <div className="h-24 bg-gradient-to-r from-blue-100 via-indigo-100 to-blue-50 rounded-xl mb-5"></div>
              <div className="h-6 bg-blue-100 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-blue-50 rounded w-1/3 mb-3"></div>
              <div className="flex gap-3">
                <div className="h-6 bg-gray-100 rounded w-20"></div>
                <div className="h-6 bg-gray-100 rounded w-24"></div>
                <div className="h-6 bg-gray-100 rounded w-28"></div>
              </div>
            </div>
          ))}
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
                <Link to={`/cars/${car.car_id}`} key={car.car_id} className="group block">
                  <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden transition-all duration-300 group-hover:shadow-md group-hover:border-blue-200">
                    <div className="h-24 bg-gradient-to-r from-blue-100 via-indigo-100 to-blue-50"></div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-xl md:text-2xl font-semibold text-blue-900 group-hover:text-blue-700 transition-colors">
                          {car.manufacturer} {car.model}
                        </h3>
                        <span className="inline-flex items-center rounded-full bg-blue-600 text-white px-3 py-1 text-sm font-medium shadow-sm">
                          {car.price.toLocaleString()}€
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{car.year}</span>
                        {car.fuel && (
                          <span className="bg-gray-100 px-3 py-1 rounded-full">{car.fuel}</span>
                        )}
                        {car.transmission && (
                          <span className="bg-gray-100 px-3 py-1 rounded-full">{car.transmission}</span>
                        )}
                        {car.odometer && (
                          <span className="bg-gray-100 px-3 py-1 rounded-full">{car.odometer.toLocaleString()} km</span>
                        )}
                      </div>
                      <div className="pt-2">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 text-blue-700 bg-white hover:bg-blue-50 transition-colors">
                          <span>View details</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
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
              className="px-6 py-3 rounded-full bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:hover:bg-white transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <span className="text-lg font-medium text-blue-900">
              Page {Math.floor(skip / limit) + 1}
            </span>
            <button
              onClick={handleNextPage}
              disabled={cars.length < limit}
              className="px-6 py-3 rounded-full bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:hover:bg-white transition-colors inline-flex items-center gap-2"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CarsPage;
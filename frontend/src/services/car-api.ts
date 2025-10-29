import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_V1_URL = `${API_URL}/v1`;

// Interfaces pour les voitures
export interface Car {
  car_id: string;
  url?: string;
  price: number;
  year: number;
  manufacturer: string;
  model: string;
  condition?: string;
  fuel?: string;
  odometer?: number;
  transmission?: string;
  type?: string;
  paint_color?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
}

export interface CarFilters {
  manufacturer?: string;
  min_price?: number;
  max_price?: number;
}

// Interface pour la localisation
export interface Location {
  latitude: number;
  longitude: number;
}

// Interfaces pour les recommandations
export interface RecommendationRequest {
  car_id: string;
  top_n?: number;
  user_latitude?: number;
  user_longitude?: number;
  similarity_weight?: number;
  distance_weight?: number;
  min_price?: number;
  max_price?: number;
  min_year?: number;
  max_year?: number;
  manufacturers?: string[];
  types?: string[];
  states?: string[];
  user_location?: Location;
}

export interface TextRecommendationRequest {
  query: string;
  top_n?: number;
  user_latitude?: number;
  user_longitude?: number;
  similarity_weight?: number;
  distance_weight?: number;
  min_price?: number;
  max_price?: number;
  min_year?: number;
  max_year?: number;
  manufacturers?: string[];
  types?: string[];
  user_location?: Location;
}

export interface Recommendation {
  car: Car;
  similarity_score: number;
  distance_score: number;
  final_score: number;
  distance_km?: number;
  rank: number;
}

export interface RecommendationsResponse {
  recommendations: Recommendation[];
  total: number;
  query_info: {
    type: string;
    car_id?: string;
    query?: string;
    user_location?: {
      latitude: number;
      longitude: number;
    } | null;
    weights: {
      similarity: number;
      distance: number;
    };
  };
}

// Services API
const carApiClient = axios.create({
  baseURL: API_V1_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Intercepteur pour ajouter le token d'authentification
carApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Service pour les voitures
export const carService = {
  // Récupérer une voiture par son ID
  getCarById: async (carId: string): Promise<Car> => {
    const response = await carApiClient.get(`/cars/${carId}`);
    return response.data;
  },

  // Récupérer la liste des voitures avec filtres optionnels
  getCars: async (filters?: CarFilters, skip: number = 0, limit: number = 20): Promise<Car[]> => {
    const params = {
      skip,
      limit,
      ...filters
    };
    const response = await carApiClient.get('/cars', { params });
    return response.data;
  },

  // Obtenir des recommandations basées sur un ID de voiture
  getRecommendationsById: async (request: RecommendationRequest): Promise<RecommendationsResponse> => {
    const response = await carApiClient.post('/recommendations/by-id', request);
    return response.data;
  },

  // Obtenir des recommandations basées sur une requête textuelle
  getRecommendationsByText: async (request: TextRecommendationRequest): Promise<RecommendationsResponse> => {
    const response = await carApiClient.post('/recommendations/by-text', request);
    return response.data;
  }
};
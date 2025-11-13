import React, { useState, useEffect } from 'react';
import { apiService, PredictionInputApi, PredictionOutputApi, PredictionHistoryItem } from '../services/api';

interface PredictionRequest {
  carModel: string;
  year: number;
  mileage: number;
  condition: string;
  features: string[];
  engineDisplacement?: number;
  horsepower?: number;
  transmission?: 'automatic' | 'manual';
  fuelType?: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  isVEngine?: boolean;
}

interface PredictionResponse {
  predictedPrice: number;
}

const PricePredictPage: React.FC = () => {
  const [predictionRequest, setPredictionRequest] = useState<PredictionRequest>({
    carModel: '',
    year: new Date().getFullYear(),
    mileage: 0,
    condition: 'excellent',
    features: []
  });

  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [availableFeatures] = useState([
    'Leather Seats',
    'Sunroof',
    'Navigation System',
    'Backup Camera',
    'Bluetooth',
    'Heated Seats',
    'Remote Start',
    'Premium Sound',
    'All-Wheel Drive',
    'Turbo Engine'
  ]);

  const handleInputChange = (field: keyof PredictionRequest, value: any) => {
    setPredictionRequest(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setPredictionRequest(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handlePredict = async () => {
    if (!predictionRequest.carModel.trim()) {
      setError('Please enter a car model');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: PredictionInputApi = mapUiToPredictionPayload(predictionRequest);
      const res: PredictionOutputApi = await apiService.predictPrice(payload);
      setPrediction({ predictedPrice: res.price });
      loadHistory();
    } catch (err: any) {
      console.error('Prediction error:', err);
      setError('Failed to get price prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setPredictionRequest({
      carModel: '',
      year: new Date().getFullYear(),
      mileage: 0,
      condition: 'excellent',
      features: [],
      engineDisplacement: undefined,
      horsepower: undefined,
      transmission: undefined,
      fuelType: undefined,
      isVEngine: undefined,
    });
    setPrediction(null);
    setError(null);
  };

  const loadHistory = async () => {
    try {
      const items = await apiService.listPredictions();
      setHistory(items);
    } catch (e) {
      console.error('Failed to load predictions history', e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const mapUiToPredictionPayload = (req: PredictionRequest): PredictionInputApi => {
    const vehicleAgeYears = Math.max(0, new Date().getFullYear() - (req.year || new Date().getFullYear()));
    const mileagePerYear = req.mileage && vehicleAgeYears > 0 ? req.mileage / vehicleAgeYears : req.mileage;

    const brandScore = deriveBrandEncoding(req.carModel);
    const fuelTypeScore = deriveFuelTypeEncoding(req.fuelType);
    const transmissionScore = deriveTransmissionEncoding(req.transmission);

    const milageVeryHigh = req.mileage > 150000 ? 1 : 0;
    const milageHigh = req.mileage > 100000 && req.mileage <= 150000 ? 1 : 0;
    const milageMedium = req.mileage > 50000 && req.mileage <= 100000 ? 1 : 0;

    const ageVeryOld = vehicleAgeYears > 15 ? 1 : 0;
    const ageOld = vehicleAgeYears > 10 && vehicleAgeYears <= 15 ? 1 : 0;
    const ageMid = vehicleAgeYears > 5 && vehicleAgeYears <= 10 ? 1 : 0;

    const cleanTitle = req.condition === 'excellent' || req.condition === 'very-good' ? 1 : 0;

    const engineDisplacement = req.engineDisplacement !== undefined ? req.engineDisplacement : 1800;
    const hp = req.horsepower ?? 150;
    const isVEngine = req.isVEngine ? 1 : 0;

    const payload: PredictionInputApi = {
      Milage_High: milageHigh,
      Accident_Impact: 0,
      Age_Old: ageOld,
      Milage_Medium: milageMedium,
      clean_title: cleanTitle,
      Milage_Very_High: milageVeryHigh,
      Vehicle_Age: vehicleAgeYears,
      hp: hp,
      Age_Mid: ageMid,
      engine_displacement: engineDisplacement,
      brand: brandScore,
      fuel_type: fuelTypeScore,
      Age_Very_Old: ageVeryOld,
      is_v_engine: isVEngine,
      Mileage_per_Year: mileagePerYear || 0,
      transmission: transmissionScore,
    };
    return payload;
  };

  const deriveBrandEncoding = (model: string | undefined): number => {
    if (!model) return 0;
    const m = model.toLowerCase();
    if (m.includes('toyota')) return 1;
    if (m.includes('honda')) return 2;
    if (m.includes('ford')) return 3;
    if (m.includes('bmw')) return 4;
    if (m.includes('mercedes') || m.includes('benz')) return 5;
    if (m.includes('audi')) return 6;
    if (m.includes('hyundai')) return 7;
    if (m.includes('kia')) return 8;
    if (m.includes('volkswagen') || m.includes('vw')) return 9;
    return 0;
  };

  const deriveFuelTypeEncoding = (fuel?: PredictionRequest['fuelType']): number => {
    switch (fuel) {
      case 'gasoline': return 1;
      case 'diesel': return 2;
      case 'hybrid': return 3;
      case 'electric': return 4;
      default: return 0;
    }
  };

  const deriveTransmissionEncoding = (t?: PredictionRequest['transmission']): number => {
    switch (t) {
      case 'automatic': return 1;
      case 'manual': return 2;
      default: return 0;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const InfoPill: React.FC<{ label: string; value: number | string | undefined }> = ({ label, value }) => (
    <div className="px-3 py-2 rounded-lg bg-blue-50/50 border border-blue-200 flex items-center justify-between hover:bg-blue-50 transition-colors">
      <span className="text-xs font-medium text-blue-600">{label}</span>
      <span className="font-semibold text-blue-900 ml-2">{value ?? '-'}</span>
    </div>
  );

  const Tag: React.FC<{ text: string }> = ({ text }) => (
    <span className="text-[11px] px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 font-medium hover:bg-blue-100 transition-all duration-200">
      {text}
    </span>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
      {/* Hero Section */}
      <div className="relative rounded-3xl p-8 md:p-12 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 shadow-sm text-center">
        <div className="absolute inset-0 -z-10 blur-3xl bg-blue-100/30 rounded-[2rem]"></div>
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700">Car Price Predictor</h1>
        <p className="mt-3 text-gray-700 text-lg">Get instant AI-powered price predictions for your vehicle</p>
        <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
          <span className="px-3 py-1.5 rounded-full bg-white/70 border border-blue-200 text-sm text-blue-700">Fast</span>
          <span className="px-3 py-1.5 rounded-full bg-white/70 border border-blue-200 text-sm text-blue-700">Model-agnostic</span>
          <span className="px-3 py-1.5 rounded-full bg-white/70 border border-blue-200 text-sm text-blue-700">No signup</span>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-blue-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-200 flex items-center justify-center">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-blue-600">Vehicle Details</h2>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Car Model */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-blue-500">Car Model *</label>
            <input
              type="text"
              value={predictionRequest.carModel}
              onChange={(e) => handleInputChange('carModel', e.target.value)}
              placeholder="e.g., Toyota Camry, BMW 3 Series"
              className="w-full px-4 py-2 rounded-full bg-white border border-blue-500/20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-black placeholder-gray-500"
            />
            <div className="flex flex-wrap gap-2">
              {['Toyota Corolla','Honda Civic','BMW 3 Series','Ford Focus'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleInputChange('carModel', m)}
                  className="px-3 py-1.5 text-xs rounded-full border border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Year */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-blue-500">Model Year</label>
            <input
              type="number"
              value={predictionRequest.year}
              onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
              min="1990"
              max={new Date().getFullYear() + 1}
              className="w-full px-4 py-2 rounded-full bg-white border border-blue-500/20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-black placeholder-gray-500"
            />
          </div>

          {/* Mileage */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-blue-500">Mileage (miles)</label>
            <input
              type="number"
              value={predictionRequest.mileage}
              onChange={(e) => handleInputChange('mileage', parseInt(e.target.value))}
              min="0"
              className="w-full px-4 py-2 rounded-full bg-white border border-blue-500/20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-black placeholder-gray-500"
            />
          </div>

          {/* Condition */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-blue-500">Condition</label>
            <select
              value={predictionRequest.condition}
              onChange={(e) => handleInputChange('condition', e.target.value)}
              className="w-full px-4 py-2 rounded-full bg-white border border-blue-500/20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-black"
            >
              <option value="excellent">Excellent</option>
              <option value="very-good">Very Good</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-blue-600 mb-4">Features & Options</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {availableFeatures.map((feature) => (
              <label key={feature} className="relative group">
                <input
                  type="checkbox"
                  checked={predictionRequest.features.includes(feature)}
                  onChange={() => handleFeatureToggle(feature)}
                  className="peer sr-only"
                />
                <div className="p-4 rounded-xl bg-white border border-blue-200 shadow-sm hover:shadow peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all duration-200 cursor-pointer">
                  <span className="text-sm font-medium text-blue-900 group-hover:text-blue-600 transition-colors">{feature}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Advanced Options */}
        <div className="mt-10">
          <button
            type="button"
            onClick={() => setShowAdvanced(v => !v)}
            className="inline-flex items-center px-4 py-2 rounded-full border border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            {showAdvanced ? 'Hide advanced options' : 'Show advanced options'}
          </button>
          {showAdvanced && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-500">Engine Displacement (cc)</label>
                <input
                  type="number"
                  value={predictionRequest.engineDisplacement ?? ''}
                  onChange={(e) => handleInputChange('engineDisplacement', parseInt(e.target.value))}
                  className="w-full px-4 py-2 rounded-full bg-white border border-blue-500/20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-black"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-500">Horsepower (hp)</label>
                <input
                  type="number"
                  value={predictionRequest.horsepower ?? ''}
                  onChange={(e) => handleInputChange('horsepower', parseInt(e.target.value))}
                  className="w-full px-4 py-2 rounded-full bg-white border border-blue-500/20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-black"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-500">Transmission</label>
                <select
                  value={predictionRequest.transmission ?? ''}
                  onChange={(e) => handleInputChange('transmission', e.target.value as PredictionRequest['transmission'])}
                  className="w-full px-4 py-2 rounded-full bg-white border border-blue-500/20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-black"
                >
                  <option value="">Select</option>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-500">Fuel Type</label>
                <select
                  value={predictionRequest.fuelType ?? ''}
                  onChange={(e) => handleInputChange('fuelType', e.target.value as PredictionRequest['fuelType'])}
                  className="w-full px-4 py-2 rounded-full bg-white border border-blue-500/20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-black"
                >
                  <option value="">Select</option>
                  <option value="gasoline">Gasoline</option>
                  <option value="diesel">Diesel</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="electric">Electric</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-blue-500">V Engine</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange('isVEngine', true)}
                    className={`px-4 py-2 rounded-full border ${predictionRequest.isVEngine ? 'bg-blue-600 text-white border-blue-600' : 'border-blue-200 text-blue-700 hover:bg-blue-50'}`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('isVEngine', false)}
                    className={`px-4 py-2 rounded-full border ${predictionRequest.isVEngine === false ? 'bg-blue-600 text-white border-blue-600' : 'border-blue-200 text-blue-700 hover:bg-blue-50'}`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('isVEngine', undefined)}
                    className="px-4 py-2 rounded-full border border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-12 flex flex-wrap items-center gap-4 justify-center">
          <button
            onClick={handlePredict}
            disabled={loading || !predictionRequest.carModel.trim()}
            className="px-10 py-4 bg-blue-600 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              'Get Prediction'
            )}
          </button>
          <button
            type="button"
            onClick={clearForm}
            className="px-6 py-3 rounded-full border border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            Clear form
          </button>
        </div>
      </div>

      {/* Prediction Result */}
      {prediction && (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-semibold text-blue-600">Predicted Market Value</h3>
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-blue-50 border border-blue-200">
              <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zm1 17h-2v-2h2v2zm0-4h-2V7h2v7z" />
              </svg>
              <span className="text-4xl md:text-6xl font-bold tracking-tight text-blue-700">
                {formatPrice(prediction.predictedPrice)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* History Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-blue-600">Recent Predictions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {history.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl border border-blue-100 transition-all">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-xs font-medium opacity-70">
                    {new Date(item.created_at).toLocaleString()}
                  </div>
                  <div className="text-3xl font-bold mt-1 text-blue-700">
                    {formatPrice(item.predicted_price)}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 13h18l-1.5-3.75a4 4 0 0 0-3.7-2.5H8.2a4 4 0 0 0-3.7 2.5L3 13z" />
                  </svg>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                <InfoPill label="Veh. Age" value={item.Vehicle_Age} />
                <InfoPill label="HP" value={item.hp} />
                <InfoPill label="Eng. cc" value={item.engine_displacement} />
                <InfoPill label="MPY" value={item.Mileage_per_Year} />
              </div>
              <div className="flex flex-wrap gap-2">
                {item.Milage_Very_High ? <Tag text="Very High Mileage" /> : null}
                {item.Milage_High ? <Tag text="High Mileage" /> : null}
                {item.Milage_Medium ? <Tag text="Medium Mileage" /> : null}
                {item.Age_Very_Old ? <Tag text="Very Old" /> : null}
                {item.Age_Old ? <Tag text="Old" /> : null}
                {item.Age_Mid ? <Tag text="Mid Age" /> : null}
                {item.clean_title ? <Tag text="Clean Title" /> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricePredictPage;

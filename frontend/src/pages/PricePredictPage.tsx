import React, { useState, useEffect } from 'react';
import { apiService, PredictionInputApi, PredictionOutputApi, PredictionHistoryItem } from '../services/api';

interface PredictionRequest {
  // UI fields we collect; will be mapped to model features
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
      // Map UI fields to backend PredictionInputApi
      const payload: PredictionInputApi = mapUiToPredictionPayload(predictionRequest);
      const res: PredictionOutputApi = await apiService.predictPrice(payload);
      setPrediction({ predictedPrice: res.price });
      // refresh history after new prediction
      loadHistory();
    } catch (err: any) {
      console.error('Prediction error:', err);
      setError('Failed to get price prediction. Please try again.');
    } finally {
      setLoading(false);
    }
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

  // Map UI model to backend expected numerical features
  const mapUiToPredictionPayload = (req: PredictionRequest): PredictionInputApi => {
    // Placeholder simple mappings; in real app, these would be derived from UI selections
    const vehicleAgeYears = Math.max(0, new Date().getFullYear() - (req.year || new Date().getFullYear()));
    const mileagePerYear = req.mileage && vehicleAgeYears > 0 ? req.mileage / vehicleAgeYears : req.mileage;

    // Categorical encodings (temporary simple heuristics)
    const brandScore = deriveBrandEncoding(req.carModel);
    const fuelTypeScore = deriveFuelTypeEncoding(req.fuelType);
    const transmissionScore = deriveTransmissionEncoding(req.transmission);

    // Mileage buckets
    const milageVeryHigh = req.mileage > 150000 ? 1 : 0;
    const milageHigh = req.mileage > 100000 && req.mileage <= 150000 ? 1 : 0;
    const milageMedium = req.mileage > 50000 && req.mileage <= 100000 ? 1 : 0;

    // Age buckets
    const ageVeryOld = vehicleAgeYears > 15 ? 1 : 0;
    const ageOld = vehicleAgeYears > 10 && vehicleAgeYears <= 15 ? 1 : 0;
    const ageMid = vehicleAgeYears > 5 && vehicleAgeYears <= 10 ? 1 : 0;

    // Title/condition
    const cleanTitle = req.condition === 'excellent' || req.condition === 'very-good' ? 1 : 0;

    // Engine
    // Backend example shows engine displacement in cc (e.g., 1800)
    const engineDisplacement = req.engineDisplacement !== undefined
      ? req.engineDisplacement
      : 1800;
    const hp = req.horsepower ?? 150;
    const isVEngine = req.isVEngine ? 1 : 0;

    const payload: PredictionInputApi = {
      Milage_High: milageHigh,
      Accident_Impact: 0, // not captured
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
    <div className="px-2 py-1 rounded bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-gray-200 ml-2">{value ?? '-'}</span>
    </div>
  );

  const Tag: React.FC<{ text: string }> = ({ text }) => (
    <span className="text-[11px] px-2 py-1 rounded-full bg-slate-800/60 border border-slate-700/60 text-gray-200">
      {text}
    </span>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 animate-pulse-slow">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold gradient-text">
          Car Price Predictor
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Get AI-powered price predictions for your vehicle based on market data and trends
        </p>
      </div>

      {/* Prediction Form */}
      <div className="card glass p-8 animate-slide-in-right">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-white">Vehicle Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Car Model */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">
              Car Model *
            </label>
            <input
              type="text"
              value={predictionRequest.carModel}
              onChange={(e) => handleInputChange('carModel', e.target.value)}
              placeholder="e.g., Toyota Camry, BMW 3 Series"
              className="input-primary hover-lift"
            />
          </div>

          {/* Year */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">
              Model Year
            </label>
            <input
              type="number"
              value={predictionRequest.year}
              onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
              min="1990"
              max={new Date().getFullYear() + 1}
              className="input-primary hover-lift"
            />
          </div>

          {/* Mileage */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">
              Mileage (miles)
            </label>
            <input
              type="number"
              value={predictionRequest.mileage}
              onChange={(e) => handleInputChange('mileage', parseInt(e.target.value))}
              min="0"
              className="input-primary hover-lift"
            />
          </div>

          {/* Condition */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">
              Condition
            </label>
            <select
              value={predictionRequest.condition}
              onChange={(e) => handleInputChange('condition', e.target.value)}
              className="input-primary hover-lift"
            >
              <option value="excellent">Excellent</option>
              <option value="very-good">Very Good</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 space-y-3">
          <label className="block text-sm font-medium text-gray-200">
            Features & Options
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableFeatures.map((feature) => (
              <label
                key={feature}
                className="flex items-center space-x-3 p-3 rounded-lg bg-steel/30 border border-steel hover:bg-steel/50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={predictionRequest.features.includes(feature)}
                  onChange={() => handleFeatureToggle(feature)}
                  className="w-4 h-4 text-brand bg-steel border-steel rounded focus:ring-brand focus:ring-2"
                />
                <span className="text-sm text-gray-200">{feature}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Predict Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handlePredict}
            disabled={loading || !predictionRequest.carModel.trim()}
            className="btn-primary px-12 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
          >
            {loading ? (
              <div className="flex items-center space-x-3">
                <div className="spinner" />
                <span>Analyzing Market Data...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Get Price Prediction</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Prediction Results */}
      {prediction && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Main Prediction Card */}
          <div className="card glass p-8 bg-gradient-to-br from-blue-500/10 to-purple-600/10 border-blue-500/30">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-white">Predicted Market Value</h3>
              </div>
              <div className="text-6xl font-bold gradient-text">
                {prediction.predictedPrice.toFixed(2)}
                {/* {formatPrice(prediction.predictedPrice)} */}
              </div>
              <div className="flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center space-x-2 bg-slate-800/50 px-4 py-2 rounded-full">
                  <span className="text-gray-300">This is a statistical model estimate.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-yellow-200 text-sm">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium">Disclaimer</p>
                <p>This prediction is generated by a trained model on your inputs. Actual prices may vary based on local market conditions, vehicle history, and other factors not considered in this analysis.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Predictions History */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-teal-500 rounded-lg grid place-items-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M5 11h14M5 19h14M5 15h14" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold">Recent Predictions</h3>
        </div>
        {history.length === 0 ? (
          <div className="card glass p-6 text-gray-300">No predictions yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {history.map((item) => (
              <div key={item._id} className="card glass p-5 border border-slate-700/50 hover-lift">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-gray-400">{new Date(item.created_at).toLocaleString()}</div>
                    <div className="text-2xl font-bold gradient-text mt-1">
                      {item.predicted_price.toFixed(2)}
                      {/* {formatPrice(item.predicted_price)} */}

                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 grid place-items-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 13h18l-1.5-3.75a4 4 0 0 0-3.7-2.5H8.2a4 4 0 0 0-3.7 2.5L3 13z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-300">
                  <InfoPill label="Veh. Age" value={item.Vehicle_Age} />
                  <InfoPill label="HP" value={item.hp} />
                  <InfoPill label="Eng. cc" value={item.engine_displacement} />
                  <InfoPill label="MPY" value={item.Mileage_per_Year} />
                  <InfoPill label="Brand" value={item.brand} />
                  <InfoPill label="Fuel" value={item.fuel_type} />
                  <InfoPill label="Trans" value={item.transmission} />
                  <InfoPill label="V-Engine" value={item.is_v_engine} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
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
        )}
      </div>
    </div>
  );
};

export default PricePredictPage;

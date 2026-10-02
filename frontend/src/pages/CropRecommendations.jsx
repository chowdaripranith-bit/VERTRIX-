import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Sprout, Award, AlertTriangle, Droplets, Banknote, Clock, 
  ArrowRight, Filter, CheckCircle2, RefreshCw, Cpu
} from 'lucide-react';
import { getRecommendations, optimizePlan } from '../services/api';

export default function CropRecommendations() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [recommendations, setRecommendations] = useState([]);
  const [selectedCrops, setSelectedCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [farmData, setFarmData] = useState(null);

  useEffect(() => {
    // Load cached recommendations if available, otherwise fetch default recommendations
    const cachedRecs = sessionStorage.getItem('veltrix_recommendations');
    const cachedFarm = sessionStorage.getItem('veltrix_farm_data');

    if (cachedFarm) {
      setFarmData(JSON.parse(cachedFarm));
    }

    if (cachedRecs) {
      try {
        const parsed = JSON.parse(cachedRecs);
        setRecommendations(parsed.recommended_crops || []);
        setSelectedCrops((parsed.recommended_crops || []).slice(0, 4).map(c => c.crop_name));
      } catch (e) {
        console.error(e);
      }
    } else {
      fetchDefaultRecommendations();
    }
  }, []);

  const fetchDefaultRecommendations = async () => {
    setLoading(true);
    try {
      const res = await getRecommendations({
        nitrogen: 90.0,
        phosphorus: 42.0,
        potassium: 43.0,
        soil_ph: 6.5,
        soil_type: "Alluvial",
        season: "kharif",
        top_k: 6
      });
      setRecommendations(res.data.recommended_crops || []);
      setSelectedCrops((res.data.recommended_crops || []).slice(0, 4).map(c => c.crop_name));
    } catch (err) {
      console.error('Failed to load crop recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCropSelection = (cropName) => {
    setSelectedCrops(prev => 
      prev.includes(cropName)
        ? prev.filter(c => c !== cropName)
        : [...prev, cropName]
    );
  };

  const handleProceedToOptimization = async () => {
    if (selectedCrops.length === 0) {
      alert("Please select at least one crop for resource optimization.");
      return;
    }

    setOptimizing(true);
    try {
      const farm = farmData || {
        farm_area: 5.0,
        available_water: 16000.0,
        available_fertilizer: 1100.0,
        budget: 140000.0,
        objective: 'max_profit'
      };

      const optRes = await optimizePlan({
        farm_area: farm.farm_area,
        available_water: farm.available_water,
        available_fertilizer: farm.available_fertilizer,
        budget: farm.budget,
        objective: farm.objective,
        candidate_crops: selectedCrops
      });

      sessionStorage.setItem('veltrix_optimization_plan', JSON.stringify(optRes.data));
      navigate('/optimization');
    } catch (err) {
      console.error('Optimization error:', err);
      navigate('/optimization');
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-stone-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 border border-emerald-300 text-emerald-800 text-xs font-semibold mb-2">
              <Cpu className="w-3.5 h-3.5 text-emerald-700" />
              <span>Random Forest ML Pipeline • 93.06% Evaluation Accuracy</span>
            </div>
            <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-extrabold text-stone-900">
              Crop Suitability Intelligence
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-2xl">
              Crops evaluated against your specific soil chemistry (N, P, K, pH) and agro-climatic conditions.
              Select candidate crops below to run the mathematical land & resource allocator.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleProceedToOptimization}
              disabled={optimizing || selectedCrops.length === 0}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 shadow-md transition-all disabled:opacity-50"
            >
              {optimizing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Solving PuLP Model...</span>
                </>
              ) : (
                <>
                  <span>Optimize {selectedCrops.length} Selected Crops</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
            <p className="text-stone-600 text-sm font-medium">Evaluating regional crop suitability models...</p>
          </div>
        )}

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((crop) => {
            const isSelected = selectedCrops.includes(crop.crop_name);

            return (
              <div 
                key={crop.crop_name}
                className={`agri-card p-6 flex flex-col justify-between border-2 transition-all cursor-pointer ${
                  isSelected ? 'border-emerald-600 bg-white shadow-md' : 'border-transparent bg-white/90 hover:border-stone-300'
                }`}
                onClick={() => toggleCropSelection(crop.crop_name)}
              >
                <div>
                  
                  {/* Top Bar: Name, Category, Checkbox */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-['Outfit'] font-bold text-xl text-stone-900 flex items-center gap-2">
                        <span>{crop.crop_name}</span>
                      </h3>
                      <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">
                        {crop.season_fit} • {crop.soil_fit}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${
                        crop.suitability_score >= 80 ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {crop.suitability_score}% Match
                      </span>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => {}} // handled by parent div click
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Explanation */}
                  <p className="text-xs text-stone-600 leading-relaxed mb-4">
                    {crop.suitability_explanation}
                  </p>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs mb-4">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-semibold block">Expected Yield</span>
                      <span className="font-bold text-stone-900">{crop.expected_yield_per_acre} Q/acre</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-semibold block">Market Price</span>
                      <span className="font-bold text-emerald-700">₹{crop.market_price_per_quintal.toLocaleString()} /Q</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-semibold block">Water Demand</span>
                      <span className="font-medium text-stone-700">{crop.water_req_per_acre} m³/acre</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-semibold block">Cultivation Cost</span>
                      <span className="font-medium text-stone-700">₹{crop.cultivation_cost_per_acre.toLocaleString()} /acre</span>
                    </div>
                  </div>

                  {/* Key Advantages */}
                  <div className="space-y-1.5 mb-3">
                    {crop.key_advantages?.slice(0, 2).map((adv, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-stone-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{adv}</span>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-stone-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>~{crop.duration_days} Days Cycle</span>
                  </span>
                  <span className={`font-semibold ${isSelected ? 'text-emerald-700' : 'text-stone-400'}`}>
                    {isSelected ? '✓ Selected for Optimization' : '+ Tap to Select'}
                  </span>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

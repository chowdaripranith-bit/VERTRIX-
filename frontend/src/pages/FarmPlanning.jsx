import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Sprout, MapPin, TestTube, Droplets, Target, 
  ArrowRight, ArrowLeft, Sparkles, AlertCircle, CheckCircle2,
  HelpCircle, RefreshCw
} from 'lucide-react';
import { createFarmProfile, optimizePlan, getRecommendations } from '../services/api';

const INDIAN_STATES = [
  "Andhra Pradesh", "Telangana", "Karnataka", "Tamil Nadu", "Kerala", 
  "Maharashtra", "Punjab", "Haryana", "Uttar Pradesh", "Madhya Pradesh", "Gujarat", "Rajasthan"
];

const SOIL_TYPES = [
  "Alluvial", "Black (Regur)", "Red & Yellow", "Laterite", "Clayey Loam", "Sandy Loam"
];

export default function FarmPlanning() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    farmer_name: 'Aditya Rao',
    phone: '9848012345',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    village: 'Amaravathi',
    farm_area: 5.0,
    area_unit: 'acres',
    season: 'kharif',
    irrigation_type: 'canal',
    
    // Soil Parameters
    soil_type: 'Alluvial',
    soil_ph: 6.6,
    nitrogen: 92.0,
    phosphorus: 44.0,
    potassium: 46.0,
    soil_moisture: 45.0,
    organic_carbon: 0.58,
    electrical_conductivity: 0.75,
    
    // Resources
    available_water: 16000.0,
    water_unit: 'm3',
    available_fertilizer: 1100.0,
    budget: 140000.0,
    
    // Target Objective
    objective: 'max_profit'
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (parseFloat(value) || 0) : value
    }));
  };

  const loadDemoData = () => {
    setFormData({
      farmer_name: 'K. Venkateswara Rao',
      phone: '9876543210',
      state: 'Andhra Pradesh',
      district: 'Guntur',
      village: 'Amaravathi Mandalam',
      farm_area: 6.0,
      area_unit: 'acres',
      season: 'kharif',
      irrigation_type: 'canal',
      soil_type: 'Alluvial',
      soil_ph: 6.5,
      nitrogen: 95.0,
      phosphorus: 45.0,
      potassium: 48.0,
      soil_moisture: 50.0,
      organic_carbon: 0.62,
      electrical_conductivity: 0.7,
      available_water: 18000.0,
      water_unit: 'm3',
      available_fertilizer: 1250.0,
      budget: 160000.0,
      objective: 'max_profit'
    });
    setErrorMsg('');
  };

  const validateStep = (step) => {
    setErrorMsg('');
    if (step === 1) {
      if (!formData.farm_area || formData.farm_area <= 0) {
        setErrorMsg('Please enter a valid farm area greater than 0.');
        return false;
      }
    } else if (step === 2) {
      if (formData.soil_ph < 3.5 || formData.soil_ph > 9.5) {
        setErrorMsg('Soil pH should be between 3.5 and 9.5.');
        return false;
      }
    } else if (step === 3) {
      if (formData.available_water < 100) {
        setErrorMsg('Available irrigation water must be at least 100 m³.');
        return false;
      }
      if (formData.budget < 5000) {
        setErrorMsg('Operational budget must be at least ₹5,000.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Create farm profile
      const profileRes = await createFarmProfile(formData);

      // 2. Fetch ML Crop Recommendations
      const recRes = await getRecommendations({
        nitrogen: formData.nitrogen,
        phosphorus: formData.phosphorus,
        potassium: formData.potassium,
        soil_ph: formData.soil_ph,
        soil_type: formData.soil_type,
        season: formData.season,
        top_k: 5
      });

      // 3. Run Mathematical Resource Optimization Solver
      const optRes = await optimizePlan({
        farm_area: formData.farm_area,
        available_water: formData.available_water,
        available_fertilizer: formData.available_fertilizer,
        budget: formData.budget,
        objective: formData.objective,
        season: formData.season,
        soil_ph: formData.soil_ph,
        nitrogen: formData.nitrogen,
        phosphorus: formData.phosphorus,
        potassium: formData.potassium
      });

      // Cache session data for dashboard and comparison views
      sessionStorage.setItem('veltrix_farm_data', JSON.stringify(formData));
      sessionStorage.setItem('veltrix_recommendations', JSON.stringify(recRes.data));
      sessionStorage.setItem('veltrix_optimization_plan', JSON.stringify(optRes.data));

      navigate('/dashboard');
    } catch (err) {
      console.error('Error generating farm plan:', err);
      setErrorMsg(err.response?.data?.detail || 'Unable to connect to optimizer service. Please verify your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Title & Demo Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
              Interactive Planning Assistant
            </span>
            <h1 className="font-['Outfit'] text-3xl font-extrabold text-stone-900 mt-2">
              {t('form.title')}
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm mt-1">
              Provide your farm location, soil test metrics, and resource limits to calculate mathematically optimal crop acreage.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDemoData}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 shadow-sm transition-colors self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('form.btn_demo')}</span>
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-white rounded-2xl p-4 mb-8 border border-stone-200 shadow-sm">
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-medium">
            
            <div className={`flex items-center gap-2 justify-center pb-2 border-b-2 ${currentStep >= 1 ? 'border-emerald-600 text-emerald-900 font-bold' : 'border-stone-200 text-stone-400'}`}>
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">1. {t('form.step_a')}</span>
            </div>

            <div className={`flex items-center gap-2 justify-center pb-2 border-b-2 ${currentStep >= 2 ? 'border-emerald-600 text-emerald-900 font-bold' : 'border-stone-200 text-stone-400'}`}>
              <TestTube className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">2. {t('form.step_b')}</span>
            </div>

            <div className={`flex items-center gap-2 justify-center pb-2 border-b-2 ${currentStep >= 3 ? 'border-emerald-600 text-emerald-900 font-bold' : 'border-stone-200 text-stone-400'}`}>
              <Droplets className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">3. {t('form.step_c')}</span>
            </div>

            <div className={`flex items-center gap-2 justify-center pb-2 border-b-2 ${currentStep >= 4 ? 'border-emerald-600 text-emerald-900 font-bold' : 'border-stone-200 text-stone-400'}`}>
              <Target className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">4. {t('form.step_d')}</span>
            </div>

          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-800 text-xs font-medium animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm">
          
          {/* STEP 1: Location & Land */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="font-['Outfit'] text-lg font-bold text-stone-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-700" />
                  <span>Step A: Location & Land Details</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">Specify geography and total land under management.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">{t('form.farmer_name')}</label>
                  <input
                    type="text"
                    name="farmer_name"
                    value={formData.farmer_name}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">{t('form.state')}</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">{t('form.district')}</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">{t('form.village')}</label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">{t('form.farm_area')}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="farm_area"
                      step="0.1"
                      min="0.5"
                      value={formData.farm_area}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                      required
                    />
                    <select
                      name="area_unit"
                      value={formData.area_unit}
                      onChange={handleChange}
                      className="px-3 py-2.5 rounded-xl border border-stone-300 text-xs bg-stone-50 font-medium"
                    >
                      <option value="acres">Acres</option>
                      <option value="hectares">Hectares</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">{t('form.season')}</label>
                  <select
                    name="season"
                    value={formData.season}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                  >
                    <option value="kharif">Kharif (Monsoon: Jun - Oct)</option>
                    <option value="rabi">Rabi (Winter: Nov - Mar)</option>
                    <option value="zaid">Zaid (Summer: Mar - Jun)</option>
                    <option value="year_round">Year-Round / Perennial</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">{t('form.irrigation')}</label>
                  <select
                    name="irrigation_type"
                    value={formData.irrigation_type}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="canal">Canal Network (Surface Gravity)</option>
                    <option value="borewell">Borewell / Tube Well (Submersible)</option>
                    <option value="drip">Drip Irrigation (Micro / High Efficiency)</option>
                    <option value="sprinkler">Sprinkler System</option>
                    <option value="rainfed">Rainfed (Dependent on Monsoon)</option>
                  </select>
                </div>

              </div>
            </div>
          )}

          {/* STEP 2: Soil Parameters */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="font-['Outfit'] text-lg font-bold text-stone-900 flex items-center gap-2">
                  <TestTube className="w-5 h-5 text-emerald-700" />
                  <span>Step B: Soil Health & Nutrient Profile</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">Values typically found on your Soil Health Card.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">{t('form.soil_type')}</label>
                  <select
                    name="soil_type"
                    value={formData.soil_type}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('form.soil_ph')} <span className="text-stone-400 font-normal">(Optimal: 6.0 - 7.5)</span>
                  </label>
                  <input
                    type="number"
                    name="soil_ph"
                    step="0.1"
                    min="3.5"
                    max="9.5"
                    value={formData.soil_ph}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">{t('form.nitrogen')}</label>
                  <input
                    type="number"
                    name="nitrogen"
                    step="1"
                    min="0"
                    value={formData.nitrogen}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">{t('form.phosphorus')}</label>
                  <input
                    type="number"
                    name="phosphorus"
                    step="1"
                    min="0"
                    value={formData.phosphorus}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">{t('form.potassium')}</label>
                  <input
                    type="number"
                    name="potassium"
                    step="1"
                    min="0"
                    value={formData.potassium}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Organic Carbon (%)</label>
                  <input
                    type="number"
                    name="organic_carbon"
                    step="0.05"
                    min="0"
                    max="5"
                    value={formData.organic_carbon}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Resource Availability */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="font-['Outfit'] text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-emerald-700" />
                  <span>Step C: Farm Resource Quota & Budget</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">The optimization solver strictly enforces these limits as mathematical constraints.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">{t('form.water_avail')}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="available_water"
                      step="500"
                      min="500"
                      value={formData.available_water}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                      required
                    />
                    <span className="px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-xs font-medium text-stone-600 flex items-center">
                      m³
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1">1 acre-inch ≈ 102.8 m³ (Standard irrigation metric)</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">{t('form.fert_avail')}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="available_fertilizer"
                      step="50"
                      min="50"
                      value={formData.available_fertilizer}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                      required
                    />
                    <span className="px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-xs font-medium text-stone-600 flex items-center">
                      kg
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">{t('form.budget')}</label>
                  <div className="flex gap-2">
                    <span className="px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-xs font-bold text-stone-700 flex items-center">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="budget"
                      step="5000"
                      min="5000"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-emerald-900"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1">
                    Covers seed, land preparation, fertilizers, pesticides, and operational farm labor costs.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Objective */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="font-['Outfit'] text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-700" />
                  <span>Step D: Optimization Objective</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">Choose how the mathematical solver prioritizes resource allocation.</p>
              </div>

              <div className="space-y-3">
                
                {/* Option 1: Maximize Profit */}
                <label className={`block p-4 rounded-xl border cursor-pointer transition-all ${formData.objective === 'max_profit' ? 'border-emerald-600 bg-emerald-50/70 shadow-sm' : 'border-stone-200 hover:border-stone-300'}`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="objective"
                      value="max_profit"
                      checked={formData.objective === 'max_profit'}
                      onChange={handleChange}
                      className="mt-1 text-emerald-700 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-stone-900">{t('form.obj_profit')}</div>
                      <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                        Allocates acreage to maximize net financial profit (Total Revenue minus Total Cultivation Costs) subject to available water, fertilizer, and budget constraints.
                      </p>
                    </div>
                  </div>
                </label>

                {/* Option 2: Water Efficient */}
                <label className={`block p-4 rounded-xl border cursor-pointer transition-all ${formData.objective === 'min_water' ? 'border-emerald-600 bg-emerald-50/70 shadow-sm' : 'border-stone-200 hover:border-stone-300'}`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="objective"
                      value="min_water"
                      checked={formData.objective === 'min_water'}
                      onChange={handleChange}
                      className="mt-1 text-emerald-700 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-stone-900">{t('form.obj_water')}</div>
                      <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                        Prioritizes groundwater and canal water conservation while meeting essential farm revenue benchmarks, favoring drought-resilient pulses and oilseeds.
                      </p>
                    </div>
                  </div>
                </label>

                {/* Option 3: Balanced */}
                <label className={`block p-4 rounded-xl border cursor-pointer transition-all ${formData.objective === 'balanced' ? 'border-emerald-600 bg-emerald-50/70 shadow-sm' : 'border-stone-200 hover:border-stone-300'}`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="objective"
                      value="balanced"
                      checked={formData.objective === 'balanced'}
                      onChange={handleChange}
                      className="mt-1 text-emerald-700 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-stone-900">{t('form.obj_balanced')}</div>
                      <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                        Uses a normalized multi-objective formulation: 70% profit optimization combined with 30% resource preservation and crop diversification to minimize climate risks.
                      </p>
                    </div>
                  </div>
                </label>

              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-stone-100">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('form.btn_prev')}</span>
              </button>
            ) : <div />}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 shadow-md transition-colors"
              >
                <span>{t('form.btn_next')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-950/20 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Running Mathematical LP Solver...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>{t('form.btn_submit')}</span>
                  </>
                )}
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Calculator, Droplets, TrendingUp, ShieldCheck, CheckCircle2, 
  ArrowRight, Layers, AlertCircle, FileText, BarChart2
} from 'lucide-react';
import { optimizePlan } from '../services/api';

export default function ResourceOptimization() {
  const { t } = useTranslation();

  const [comparisonData, setComparisonData] = useState(null);
  const [selectedTab, setSelectedTab] = useState('profit_focused');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cachedPlan = sessionStorage.getItem('veltrix_optimization_plan');
    if (cachedPlan) {
      try {
        setComparisonData(JSON.parse(cachedPlan));
      } catch (e) {
        console.error(e);
      }
    } else {
      fetchDefaultOptimization();
    }
  }, []);

  const fetchDefaultOptimization = async () => {
    setLoading(true);
    try {
      const res = await optimizePlan({
        farm_area: 5.0,
        available_water: 16000.0,
        available_fertilizer: 1100.0,
        budget: 140000.0,
        objective: 'max_profit',
        candidate_crops: ["Rice (Paddy)", "Maize (Corn)", "Chickpea (Gram)", "Groundnut (Peanut)"]
      });
      setComparisonData(res.data);
      sessionStorage.setItem('veltrix_optimization_plan', JSON.stringify(res.data));
    } catch (err) {
      console.error('Failed to run optimization:', err);
    } finally {
      setLoading(false);
    }
  };

  const plans = comparisonData?.alternative_plans || {};
  const currentPlan = plans[selectedTab] || comparisonData?.selected_plan;

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-stone-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 border border-emerald-300 text-emerald-800 text-xs font-semibold mb-2">
              <Calculator className="w-3.5 h-3.5 text-emerald-700" />
              <span>PuLP Linear Programming (LP) Engine • Mathematical Optimality</span>
            </div>
            <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-extrabold text-stone-900">
              Farm Resource Optimization
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-2xl">
              Unlike generic advice, the system mathematically calculates exact acreage allocation to satisfy 
              water quotas, fertilizer limits, and capital budget without violating constraints.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 shadow-md transition-all"
            >
              <BarChart2 className="w-4 h-4" />
              <span>View Analytics Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Plan Archetype Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          
          {/* Plan A: Profit Focused */}
          <button
            type="button"
            onClick={() => setSelectedTab('profit_focused')}
            className={`p-5 rounded-2xl text-left border-2 transition-all ${
              selectedTab === 'profit_focused'
                ? 'bg-white border-emerald-600 shadow-lg shadow-emerald-950/5'
                : 'bg-stone-50 border-stone-200 hover:border-stone-300 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Plan A</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-['Outfit'] font-bold text-lg text-stone-900">Profit-Focused</h3>
            <p className="text-xs text-stone-500 mt-1">Maximizes financial return subject to resource limits.</p>
            {plans.profit_focused && (
              <div className="mt-3 text-base font-extrabold text-emerald-700 font-['Outfit']">
                ₹{plans.profit_focused.total_expected_profit.toLocaleString()} Profit
              </div>
            )}
          </button>

          {/* Plan B: Water Efficient */}
          <button
            type="button"
            onClick={() => setSelectedTab('water_efficient')}
            className={`p-5 rounded-2xl text-left border-2 transition-all ${
              selectedTab === 'water_efficient'
                ? 'bg-white border-sky-600 shadow-lg shadow-sky-950/5'
                : 'bg-stone-50 border-stone-200 hover:border-stone-300 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-800">Plan B</span>
              <Droplets className="w-4 h-4 text-sky-600" />
            </div>
            <h3 className="font-['Outfit'] font-bold text-lg text-stone-900">Water-Efficient</h3>
            <p className="text-xs text-stone-500 mt-1">Conserves groundwater, favoring drought-hardy pulses.</p>
            {plans.water_efficient && (
              <div className="mt-3 text-base font-extrabold text-sky-700 font-['Outfit']">
                {plans.water_efficient.water_savings_vs_max}% Water Saved
              </div>
            )}
          </button>

          {/* Plan C: Balanced */}
          <button
            type="button"
            onClick={() => setSelectedTab('balanced')}
            className={`p-5 rounded-2xl text-left border-2 transition-all ${
              selectedTab === 'balanced'
                ? 'bg-white border-amber-600 shadow-lg shadow-amber-950/5'
                : 'bg-stone-50 border-stone-200 hover:border-stone-300 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Plan C</span>
              <Layers className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-['Outfit'] font-bold text-lg text-stone-900">Balanced Plan</h3>
            <p className="text-xs text-stone-500 mt-1">Diversified risk profile balancing income & conservation.</p>
            {plans.balanced && (
              <div className="mt-3 text-base font-extrabold text-amber-700 font-['Outfit']">
                ₹{plans.balanced.total_expected_profit.toLocaleString()} • {plans.balanced.water_savings_vs_max}% Saved
              </div>
            )}
          </button>

        </div>

        {/* Selected Plan Details Card */}
        {currentPlan && (
          <div className="agri-card p-6 sm:p-8 bg-white border border-stone-200 shadow-sm mb-10">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  {currentPlan.solver_status === 'Optimal' ? '✓ Globally Optimal (CBC Solver)' : currentPlan.solver_status}
                </span>
                <h2 className="font-['Outfit'] text-2xl font-bold text-stone-900 mt-2">
                  {currentPlan.objective_title}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">{currentPlan.solver_methodology}</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 font-semibold uppercase block">Net Expected Profit</span>
                  <span className="font-['Outfit'] text-2xl font-extrabold text-emerald-700">
                    ₹{currentPlan.total_expected_profit.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* KPI Summary Numbers */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-stone-100">
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80">
                <span className="text-[11px] font-semibold text-stone-500 uppercase block">Land Allocated</span>
                <span className="font-['Outfit'] text-xl font-bold text-stone-900">{currentPlan.total_allocated_land} Acres</span>
                <span className="text-[10px] text-stone-400 block mt-0.5">{currentPlan.remaining_land} acres buffer</span>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80">
                <span className="text-[11px] font-semibold text-stone-500 uppercase block">Water Consumption</span>
                <span className="font-['Outfit'] text-xl font-bold text-sky-700">{currentPlan.total_water_used.toLocaleString()} m³</span>
                <span className="text-[10px] text-sky-600 font-medium block mt-0.5">{currentPlan.water_savings_vs_max}% saved vs quota</span>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80">
                <span className="text-[11px] font-semibold text-stone-500 uppercase block">Cultivation Cost</span>
                <span className="font-['Outfit'] text-xl font-bold text-stone-900">₹{currentPlan.total_cultivation_cost.toLocaleString()}</span>
                <span className="text-[10px] text-stone-400 block mt-0.5">₹{currentPlan.remaining_budget.toLocaleString()} unutilized budget</span>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80">
                <span className="text-[11px] font-semibold text-stone-500 uppercase block">Expected Revenue</span>
                <span className="font-['Outfit'] text-xl font-bold text-emerald-800">₹{currentPlan.total_expected_revenue.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">From {currentPlan.total_expected_yield} Q production</span>
              </div>
            </div>

            {/* Crop Allocation Table */}
            <div className="pt-6">
              <h3 className="font-['Outfit'] text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
                <span>Crop Acreage Allocation & Financial Breakdown</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-600 font-semibold border-y border-stone-200">
                    <tr>
                      <th className="py-3 px-4">Crop Name</th>
                      <th className="py-3 px-3">Allocated Area</th>
                      <th className="py-3 px-3">Land Share</th>
                      <th className="py-3 px-3">Expected Yield</th>
                      <th className="py-3 px-3">Cultivation Cost</th>
                      <th className="py-3 px-3">Expected Revenue</th>
                      <th className="py-3 px-3">Net Profit</th>
                      <th className="py-3 px-4">ROI %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {currentPlan.allocations.map((alloc) => (
                      <tr key={alloc.crop_name} className="hover:bg-emerald-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-stone-900">{alloc.crop_name}</td>
                        <td className="py-3.5 px-3 font-semibold text-emerald-800">{alloc.allocated_area} Acres</td>
                        <td className="py-3.5 px-3 text-stone-600">{alloc.land_share_percentage}%</td>
                        <td className="py-3.5 px-3 text-stone-700">{alloc.expected_yield} Q</td>
                        <td className="py-3.5 px-3 text-stone-600">₹{alloc.cultivation_cost.toLocaleString()}</td>
                        <td className="py-3.5 px-3 text-stone-700">₹{alloc.expected_revenue.toLocaleString()}</td>
                        <td className="py-3.5 px-3 font-bold text-emerald-700">₹{alloc.expected_profit.toLocaleString()}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-semibold">
                            +{alloc.roi_percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Warnings & Solver Assumptions */}
            {currentPlan.warnings?.length > 0 && (
              <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>Solver Diagnostic & Assumptions:</span>
                </div>
                <ul className="list-disc list-inside text-[11px] text-amber-800 space-y-0.5">
                  {currentPlan.warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

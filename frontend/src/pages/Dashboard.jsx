import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  TrendingUp, Droplets, Banknote, MapPin, Printer, 
  Download, Edit3, RefreshCw, AlertCircle, CheckCircle2,
  Calendar, Layers, ShieldCheck
} from 'lucide-react';
import { optimizePlan } from '../services/api';

const PIE_COLORS = ['#238656', '#0284C7', '#D97706', '#9333EA', '#E11D48', '#14B8A6'];

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [planData, setPlanData] = useState(null);
  const [farmData, setFarmData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cachedPlan = sessionStorage.getItem('veltrix_optimization_plan');
    const cachedFarm = sessionStorage.getItem('veltrix_farm_data');

    if (cachedFarm) {
      setFarmData(JSON.parse(cachedFarm));
    }

    if (cachedPlan) {
      try {
        const parsed = JSON.parse(cachedPlan);
        setPlanData(parsed.selected_plan || parsed);
      } catch (e) {
        console.error(e);
      }
    } else {
      fetchDefaultPlan();
    }
  }, []);

  const fetchDefaultPlan = async () => {
    setLoading(true);
    try {
      const defaultFarm = {
        farm_area: 5.0,
        available_water: 16000.0,
        available_fertilizer: 1100.0,
        budget: 140000.0,
        objective: 'max_profit',
        farmer_name: 'Aditya Rao',
        district: 'Guntur',
        state: 'Andhra Pradesh',
        season: 'kharif'
      };
      setFarmData(defaultFarm);

      const res = await optimizePlan(defaultFarm);
      setPlanData(res.data.selected_plan);
      sessionStorage.setItem('veltrix_optimization_plan', JSON.stringify(res.data));
    } catch (err) {
      console.error('Error loading default plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (loading || !planData) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-stone-600 text-sm font-medium">Loading Farm Intelligence Dashboard...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const allocations = planData.allocations || [];
  const pieData = allocations.map(a => ({
    name: a.crop_name,
    value: a.allocated_area
  }));

  const barData = allocations.map(a => ({
    name: a.crop_name,
    Revenue: a.expected_revenue,
    Cost: a.cultivation_cost,
    Profit: a.expected_profit
  }));

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-10 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header & Farmer Profile Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                Official Farm Plan
              </span>
              <span className="text-[11px] text-stone-500 font-medium">
                {farmData?.season ? farmData.season.toUpperCase() : 'KHARIF'} 2026
              </span>
            </div>
            <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-extrabold text-stone-900">
              Farmer Precision Dashboard
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm mt-0.5">
              Target: <span className="font-semibold text-emerald-800">{planData.objective_title}</span> • Solver: {planData.solver_status}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 print:hidden">
            <Link
              to="/planning"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 shadow-sm transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-stone-500" />
              <span>Edit Inputs</span>
            </Link>

            <Link
              to="/optimization"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 shadow-sm transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Compare Plans</span>
            </Link>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-stone-500" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* KPI SUMMARY CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Profit */}
          <div className="agri-card p-5 bg-white border border-stone-200">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span className="font-semibold uppercase text-[10px] tracking-wider">Estimated Net Profit</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-700 font-['Outfit']">
              ₹{planData.total_expected_profit?.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-800 mt-1 flex items-center gap-1 font-medium">
              <span>Revenue: ₹{planData.total_expected_revenue?.toLocaleString()}</span>
            </div>
          </div>

          {/* Land Allocation */}
          <div className="agri-card p-5 bg-white border border-stone-200">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span className="font-semibold uppercase text-[10px] tracking-wider">Land Allocated</span>
              <MapPin className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-stone-900 font-['Outfit']">
              {planData.total_allocated_land} Acres
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              Buffer remaining: {planData.remaining_land} acres
            </div>
          </div>

          {/* Water Quota & Savings */}
          <div className="agri-card p-5 bg-white border border-stone-200">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span className="font-semibold uppercase text-[10px] tracking-wider">Water Used</span>
              <Droplets className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-extrabold text-sky-800 font-['Outfit']">
              {planData.total_water_used?.toLocaleString()} m³
            </div>
            <div className="text-[11px] text-sky-700 mt-1 font-semibold">
              {planData.water_savings_vs_max}% conserved vs limit
            </div>
          </div>

          {/* Cultivation Cost */}
          <div className="agri-card p-5 bg-white border border-stone-200">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span className="font-semibold uppercase text-[10px] tracking-wider">Cultivation Cost</span>
              <Banknote className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-stone-900 font-['Outfit']">
              ₹{planData.total_cultivation_cost?.toLocaleString()}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              Remaining budget: ₹{planData.remaining_budget?.toLocaleString()}
            </div>
          </div>

        </div>

        {/* CHARTS ROW (Using Recharts) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Chart 1: Land Allocation Pie */}
          <div className="lg:col-span-5 agri-card p-6 bg-white border border-stone-200">
            <h3 className="font-['Outfit'] font-bold text-base text-stone-900 mb-1">
              Acreage Allocation Distribution
            </h3>
            <p className="text-xs text-stone-500 mb-4">Proportion of farm land assigned per crop by solver</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} Acres`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Revenue vs Cost Bar */}
          <div className="lg:col-span-7 agri-card p-6 bg-white border border-stone-200">
            <h3 className="font-['Outfit'] font-bold text-base text-stone-900 mb-1">
              Financial Breakdown: Revenue vs Cultivation Cost
            </h3>
            <p className="text-xs text-stone-500 mb-4">Comparison of expected monetary revenue, input cost, and profit</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Bar dataKey="Revenue" fill="#238656" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Cost" fill="#D97706" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Profit" fill="#0284C7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* DETAILED RESULTS TABLE */}
        <div className="agri-card p-6 bg-white border border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-['Outfit'] font-bold text-base text-stone-900">
              Crop Production & Resource Consumption Breakdown
            </h3>
            <span className="text-xs text-stone-500">
              Total Production: <strong className="text-stone-900">{planData.total_expected_yield} Quintals</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 font-semibold border-y border-stone-200">
                <tr>
                  <th className="py-3 px-3">Crop Name</th>
                  <th className="py-3 px-3">Area (Acres)</th>
                  <th className="py-3 px-3">Share</th>
                  <th className="py-3 px-3">Expected Yield</th>
                  <th className="py-3 px-3">Water (m³)</th>
                  <th className="py-3 px-3">Fertilizer (kg)</th>
                  <th className="py-3 px-3">Cost (₹)</th>
                  <th className="py-3 px-3">Revenue (₹)</th>
                  <th className="py-3 px-3">Net Profit (₹)</th>
                  <th className="py-3 px-3">ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {allocations.map((a) => (
                  <tr key={a.crop_name} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-stone-900">{a.crop_name}</td>
                    <td className="py-3.5 px-3 font-semibold text-emerald-800">{a.allocated_area}</td>
                    <td className="py-3.5 px-3 text-stone-600">{a.land_share_percentage}%</td>
                    <td className="py-3.5 px-3 text-stone-800">{a.expected_yield} Q</td>
                    <td className="py-3.5 px-3 text-sky-700">{a.water_required.toLocaleString()}</td>
                    <td className="py-3.5 px-3 text-stone-700">{a.fertilizer_required}</td>
                    <td className="py-3.5 px-3 text-stone-600">₹{a.cultivation_cost.toLocaleString()}</td>
                    <td className="py-3.5 px-3 text-stone-700">₹{a.expected_revenue.toLocaleString()}</td>
                    <td className="py-3.5 px-3 font-bold text-emerald-700">₹{a.expected_profit.toLocaleString()}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-semibold">
                        +{a.roi_percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Sources and Official Disclaimers */}
        <div className="p-4 rounded-xl bg-stone-100/70 border border-stone-200 text-xs text-stone-600 space-y-1">
          <div className="font-bold text-stone-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Benchmark Data Sources & Calibrations:</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Market rates sourced from Commission for Agricultural Costs and Prices (CACP MSP 2024-25) & Agmarknet modal prices. 
            Water requirements calibrated using ICAR Irrigation Water Management benchmarks. 
            Actual field returns depend on local weather deviations, pest incidents, and seed germination quality.
          </p>
        </div>

      </div>
    </div>
  );
}

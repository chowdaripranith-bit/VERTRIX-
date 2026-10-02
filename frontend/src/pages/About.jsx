import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, Cpu, Brain, Leaf, Calculator, Shield, Globe, Mic, BookOpen, Award, 
  BarChart3, FlaskConical, Database, Code2, GitBranch, ExternalLink
} from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">

        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-300 text-emerald-800 text-xs font-semibold mb-4">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Final Year Engineering Capstone Project (2026)</span>
          </div>
          <h1 className="font-['Outfit'] text-4xl sm:text-5xl font-extrabold text-stone-900 leading-tight">
            AI-Based Crop & Agricultural<br />
            <span className="text-emerald-700">Resource Optimization System</span>
          </h1>
          <p className="text-stone-600 text-sm sm:text-base mt-4 max-w-2xl mx-auto leading-relaxed">
            VELTRIX is a complete, functional agricultural decision support platform that goes beyond simple crop recommendations — 
            combining Machine Learning, Mathematical Linear Programming, Multilingual AI, and a Verified Knowledge Base 
            to generate scientifically-grounded, resource-feasible farm plans.
          </p>
        </div>

        {/* Project Objectives */}
        <div className="agri-card bg-white border border-stone-200 p-8 sm:p-10">
          <h2 className="font-['Outfit'] text-2xl font-extrabold text-stone-900 mb-6 flex items-center gap-3">
            <Brain className="w-6 h-6 text-emerald-700" />
            Core Project Objectives & Innovation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
            {[
              { title: "ML Crop Suitability Intelligence", desc: "Trained Random Forest Classifier (93.06% evaluation accuracy) on synthetic agronomic benchmark data to recommend the most compatible crops for a given soil type, nutrient profile, pH, and agro-climatic season.", icon: <Brain className="w-5 h-5 text-emerald-700" /> },
              { title: "Mathematical LP Resource Optimization", desc: "Formulates and solves Linear Programming (PuLP, CBC Solver) models to allocate exact acreage across candidate crops — strictly satisfying water quotas, fertilizer limits, and operational budget constraints.", icon: <Calculator className="w-5 h-5 text-emerald-700" /> },
              { title: "Yield Prediction & Revenue Modelling", desc: "Gradient Boosting Regressor (R² = 0.9946) estimates yield per acre with confidence intervals, combined with real CACP MSP 2024-25 market prices to produce verifiable income and profit projections.", icon: <BarChart3 className="w-5 h-5 text-emerald-700" /> },
              { title: "Farmer Feedback Knowledge Loop", desc: "Feedback from voice assistant interactions is stored as candidate solutions, reviewed by agricultural extension officers, and reused as evidence-backed verified solutions for future similar farm contexts.", icon: <BookOpen className="w-5 h-5 text-emerald-700" /> },
              { title: "Multilingual Indian Language Support", desc: "Complete interface localization in Telugu, Hindi, Tamil, Kannada, and Malayalam using i18next — including form labels, navigation, crop results, dashboard metrics, knowledge hub, and voice assistant transcripts.", icon: <Globe className="w-5 h-5 text-emerald-700" /> },
              { title: "Browser Voice I/O with Multilingual STT/TTS", desc: "Web Speech API integration allows farmers to ask questions in their mother tongue by voice. Server-side NLP classifies the query intent, retrieves relevant ICAR documentation, and returns a localized text answer.", icon: <Mic className="w-5 h-5 text-emerald-700" /> }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3.5 p-4 rounded-xl bg-stone-50 border border-stone-200/70">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-200 shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <div>
          <h2 className="font-['Outfit'] text-2xl font-extrabold text-stone-900 mb-6 flex items-center gap-3">
            <Code2 className="w-6 h-6 text-emerald-700" />
            Full Technology Stack
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm">
              <h3 className="font-bold text-base text-stone-900 mb-4 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-600" />
                Frontend Stack
              </h3>
              <ul className="space-y-2 text-xs text-stone-700">
                {[
                  "React 19 (Vite 8, HMR enabled)",
                  "Tailwind CSS v4 (@tailwindcss/vite)",
                  "React Router DOM v7 — client-side routing",
                  "i18next + react-i18next — 6 languages",
                  "Recharts — analytics visualization",
                  "Lucide React — consistent icon system",
                  "Axios — HTTP API client with timeout",
                  "Web Speech API — browser-native STT/TTS"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm">
              <h3 className="font-bold text-base text-stone-900 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                Backend Stack
              </h3>
              <ul className="space-y-2 text-xs text-stone-700">
                {[
                  "Python 3.11 + FastAPI (OpenAPI docs auto-generated)",
                  "SQLAlchemy ORM + SQLite (designed for PostgreSQL)",
                  "Pydantic v2 — request/response validation",
                  "Scikit-learn — RandomForestClassifier + GradientBoostingRegressor",
                  "PuLP (CBC Solver) — Linear Programming optimization",
                  "Pandas + NumPy — data preprocessing pipeline",
                  "Joblib — model serialization & inference",
                  "Pytest + FastAPI TestClient — automated test suite"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Data Sources */}
        <div className="agri-card bg-white border border-stone-200 p-8">
          <h2 className="font-['Outfit'] text-2xl font-extrabold text-stone-900 mb-6 flex items-center gap-3">
            <FlaskConical className="w-6 h-6 text-emerald-700" />
            Agricultural Data References & Benchmarks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {[
              { name: "CACP MSP 2024-25", desc: "Minimum Support Prices sourced from Commission for Agricultural Costs and Prices for accurate revenue projections." },
              { name: "ICAR Agronomic Guidelines", desc: "Irrigation water requirements and crop nutritional benchmarks calibrated using Indian Council of Agricultural Research manuals." },
              { name: "Soil Health Card (SHC) Portal", desc: "Soil NPK, pH, organic carbon, EC parameters align with the Government of India's SHC format for seamless input compatibility." },
              { name: "TNAU Agritech Portal & ANGRAU", desc: "Verified pest and disease management protocols from Tamil Nadu Agricultural University and Acharya N.G. Ranga Agricultural University." },
              { name: "ICAR-NRRI, ICAR-CICR, ICAR-IIHR", desc: "Specialized advisory data for Rice Blast (NRRI Cuttack), Cotton IPM (CICR Nagpur), and Vegetable Diseases (IIHR Bengaluru)." },
              { name: "Agmarknet Market Portal", desc: "Wholesale modal market prices for baseline revenue estimates beyond statutory MSP coverage for horticultural crops." }
            ].map((src, i) => (
              <div key={i} className="p-4 rounded-xl bg-stone-50 border border-stone-200/70">
                <div className="font-semibold text-emerald-800 mb-1">{src.name}</div>
                <p className="text-stone-600 leading-relaxed">{src.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Model Evaluation */}
        <div className="p-8 rounded-2xl bg-emerald-950 text-white">
          <h2 className="font-['Outfit'] text-2xl font-extrabold mb-6 flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            Verified ML Model Evaluation Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">Crop Recommendation Model</div>
              <div className="text-sm font-medium text-stone-300 mb-3">RandomForestClassifier (100 estimators, depth 12)</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-stone-400 text-xs">Test Accuracy</span>
                  <span className="font-bold text-emerald-400">93.06%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400 text-xs">Training Samples</span>
                  <span className="font-bold text-white">2,160 (12 crops × 180)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400 text-xs">Feature Set</span>
                  <span className="font-bold text-white">N, P, K, Temp, Humidity, pH, Rainfall</span>
                </div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">Yield Prediction Model</div>
              <div className="text-sm font-medium text-stone-300 mb-3">GradientBoostingRegressor (120 estimators, lr=0.08)</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-stone-400 text-xs">R² Score</span>
                  <span className="font-bold text-emerald-400">0.9946</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400 text-xs">MAE (Quintals/acre)</span>
                  <span className="font-bold text-white">3.254</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400 text-xs">RMSE</span>
                  <span className="font-bold text-white">6.694</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation to Features */}
        <div className="text-center pt-4">
          <Link
            to="/planning"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 shadow-lg text-sm"
          >
            Start Planning Your Farm Now
          </Link>
        </div>

      </div>
    </div>
  );
}

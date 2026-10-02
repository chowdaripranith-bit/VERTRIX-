import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, ArrowRight, CheckCircle2, Droplets, 
  TrendingUp, Leaf, Shield, Cpu, Mic, BookOpen, Layers,
  Compass, ChevronRight
} from 'lucide-react';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-stone-900 text-white min-h-[92vh] flex flex-col justify-between">
        
        {/* Background Image with Aerial Farm Landscape & Dark Green Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero_agricultural_landscape.jpg" 
            alt="Aerial Agricultural Landscape" 
            className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
          />
          {/* Multi-stage artistic gradient for superior text contrast and smooth transition */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-emerald-950/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F5] via-transparent to-stone-950/50" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 flex-1 flex flex-col justify-center">
          
          <div className="max-w-3xl space-y-6">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-500/30 backdrop-blur-md text-emerald-300 text-xs font-medium shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('hero.badge')}</span>
            </div>

            {/* Main Heading */}
            <h1 className="font-['Outfit'] text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              {t('hero.heading')}
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg lg:text-xl text-stone-200/90 max-w-2xl font-light leading-relaxed">
              {t('hero.subheading')}
            </p>

            {/* Call to Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/planning"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:to-teal-600 shadow-xl shadow-emerald-950/30 hover:scale-[1.02] transition-all"
              >
                <span>{t('hero.cta_primary')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-medium text-stone-200 bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md transition-colors"
              >
                <span>{t('hero.cta_secondary')}</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
            </div>

          </div>

          {/* DASHBOARD PREVIEW OVERLAY (Integrated into bottom of Hero) */}
          <div className="mt-14 pt-8">
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300/80 mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Live Application Intelligence Preview</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              
              {/* Card 1: Soil */}
              <div className="p-4 rounded-xl bg-stone-900/85 backdrop-blur-md border border-emerald-500/20 shadow-lg text-left">
                <div className="flex items-center justify-between text-xs text-stone-300 mb-1">
                  <span className="font-medium text-emerald-400">{t('hero.preview_soil')}</span>
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-lg font-bold text-white font-['Outfit']">pH 6.5 • NPK Rich</div>
                <div className="text-[11px] text-stone-400 mt-0.5">Optimal for 8 Kharif crops</div>
              </div>

              {/* Card 2: Crop Recommendation */}
              <div className="p-4 rounded-xl bg-stone-900/85 backdrop-blur-md border border-emerald-500/20 shadow-lg text-left">
                <div className="flex items-center justify-between text-xs text-stone-300 mb-1">
                  <span className="font-medium text-emerald-400">{t('hero.preview_crop')}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-lg font-bold text-white font-['Outfit']">Rice • Maize • Gram</div>
                <div className="text-[11px] text-stone-400 mt-0.5">93.1% RF ML Match</div>
              </div>

              {/* Card 3: Water Optimization */}
              <div className="p-4 rounded-xl bg-stone-900/85 backdrop-blur-md border border-emerald-500/20 shadow-lg text-left">
                <div className="flex items-center justify-between text-xs text-stone-300 mb-1">
                  <span className="font-medium text-emerald-400">{t('hero.preview_water')}</span>
                  <Droplets className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <div className="text-lg font-bold text-white font-['Outfit']">28.4% Water Saved</div>
                <div className="text-[11px] text-stone-400 mt-0.5">Linear Solver (PuLP LP)</div>
              </div>

              {/* Card 4: Profitability */}
              <div className="p-4 rounded-xl bg-stone-900/85 backdrop-blur-md border border-emerald-500/20 shadow-lg text-left">
                <div className="flex items-center justify-between text-xs text-stone-300 mb-1">
                  <span className="font-medium text-emerald-400">{t('hero.preview_profit')}</span>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-lg font-bold text-white font-['Outfit']">₹1,42,800 Net</div>
                <div className="text-[11px] text-stone-400 mt-0.5">+32% ROI vs Mono-crop</div>
              </div>

            </div>
          </div>

        </div>

        {/* Curved Landscape Layer Transition */}
        <div className="relative w-full overflow-hidden leading-none z-10 -mb-[1px]">
          <svg 
            className="w-full h-12 sm:h-20 text-[#FAF9F5] fill-current" 
            viewBox="0 0 1440 120" 
            preserveAspectRatio="none"
          >
            <path d="M0,32L60,42.7C120,53,240,75,360,80C480,85,600,75,720,58.7C840,43,960,21,1080,21.3C1200,21,1320,43,1380,53.3L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"></path>
          </svg>
        </div>

      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-20 bg-[#FAF9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-100/60 px-3 py-1 rounded-full border border-emerald-200">
              System Architecture & Workflow
            </span>
            <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-extrabold text-stone-900 mt-3">
              {t('workflow.title')}
            </h2>
            <p className="text-stone-600 text-sm sm:text-base mt-2">
              Combining Machine Learning for biological prediction with Mathematical Optimization for resource constraints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="agri-card p-6 bg-white flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 font-['Outfit'] font-bold text-lg flex items-center justify-center border border-emerald-200 mb-4">
                  01
                </div>
                <h3 className="font-['Outfit'] font-bold text-lg text-stone-900 mb-2">
                  {t('workflow.step1')}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {t('workflow.step1_desc')}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-stone-100 text-[11px] font-medium text-emerald-700">
                Soil Health Card & Quota Inputs →
              </div>
            </div>

            {/* Step 2 */}
            <div className="agri-card p-6 bg-white flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 font-['Outfit'] font-bold text-lg flex items-center justify-center border border-emerald-200 mb-4">
                  02
                </div>
                <h3 className="font-['Outfit'] font-bold text-lg text-stone-900 mb-2">
                  {t('workflow.step2')}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {t('workflow.step2_desc')}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-stone-100 text-[11px] font-medium text-emerald-700">
                Random Forest ML (93.1% Acc) →
              </div>
            </div>

            {/* Step 3 */}
            <div className="agri-card p-6 bg-white flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 font-['Outfit'] font-bold text-lg flex items-center justify-center border border-emerald-200 mb-4">
                  03
                </div>
                <h3 className="font-['Outfit'] font-bold text-lg text-stone-900 mb-2">
                  {t('workflow.step3')}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {t('workflow.step3_desc')}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-stone-100 text-[11px] font-medium text-emerald-700">
                PuLP Linear Programming Engine →
              </div>
            </div>

            {/* Step 4 */}
            <div className="agri-card p-6 bg-white flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 font-['Outfit'] font-bold text-lg flex items-center justify-center border border-emerald-200 mb-4">
                  04
                </div>
                <h3 className="font-['Outfit'] font-bold text-lg text-stone-900 mb-2">
                  {t('workflow.step4')}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {t('workflow.step4_desc')}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-stone-100 text-[11px] font-medium text-emerald-700">
                Print & Download Farm Plan →
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section className="py-20 bg-stone-100/70 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-100/60 px-3 py-1 rounded-full border border-emerald-200">
              Why VELTRIX is Unique
            </span>
            <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-extrabold text-stone-900 mt-3">
              {t('features.title')}
            </h2>
            <p className="text-stone-600 text-sm sm:text-base mt-2">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="font-['Outfit'] font-bold text-base text-stone-900 mb-2">
                {t('features.card1_title')}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t('features.card1_desc')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-['Outfit'] font-bold text-base text-stone-900 mb-2">
                {t('features.card2_title')}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t('features.card2_desc')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="font-['Outfit'] font-bold text-base text-stone-900 mb-2">
                {t('features.card3_title')}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t('features.card3_desc')}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-['Outfit'] font-bold text-base text-stone-900 mb-2">
                {t('features.card4_title')}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t('features.card4_desc')}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="py-16 bg-gradient-to-br from-emerald-950 via-forest-900 to-teal-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-extrabold text-white">
              Ready to optimize your next harvest season?
            </h2>
            <p className="text-stone-300 text-sm mt-2">
              Enter your soil test parameters, water volume, and budget to generate a mathematically feasible farm plan in seconds.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/planning"
              className="px-6 py-3 rounded-xl font-semibold text-sm bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-lg shadow-emerald-900/50 transition-all"
            >
              Start Free Farm Planning
            </Link>
            <Link
              to="/assistant"
              className="px-5 py-3 rounded-xl font-medium text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
            >
              <Mic className="w-4 h-4 text-emerald-400" />
              <span>Voice Assistant</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

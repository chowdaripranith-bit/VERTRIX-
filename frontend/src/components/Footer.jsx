import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sprout, ShieldCheck, Heart, Award, ExternalLink } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5 text-emerald-100" />
              </div>
              <span className="font-['Outfit'] font-bold text-xl tracking-tight text-white">
                VELTRIX <span className="text-emerald-400 font-semibold text-sm">AGRI</span>
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              {t('footer.desc')}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-800/60 rounded-lg px-2.5 py-1.5 w-fit">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>College Final Year Engineering Capstone Project</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-['Outfit'] text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Core Modules
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li><Link to="/planning" className="hover:text-emerald-400 transition-colors">Multi-Step Farm Resource Form</Link></li>
              <li><Link to="/recommendations" className="hover:text-emerald-400 transition-colors">AI Crop Matcher (Random Forest)</Link></li>
              <li><Link to="/optimization" className="hover:text-emerald-400 transition-colors">Mathematical Solver (PuLP LP)</Link></li>
              <li><Link to="/dashboard" className="hover:text-emerald-400 transition-colors">Farmer Analytics & PDF Reports</Link></li>
              <li><Link to="/assistant" className="hover:text-emerald-400 transition-colors">Multilingual AI Voice Assistant</Link></li>
              <li><Link to="/knowledge" className="hover:text-emerald-400 transition-colors">Verified Knowledge Hub (ICAR)</Link></li>
            </ul>
          </div>

          {/* Agricultural Data References */}
          <div>
            <h4 className="font-['Outfit'] text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Data & Standards
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li className="flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3 text-stone-500" />
                <a href="https://icar.org.in/" target="_blank" rel="noreferrer" className="hover:text-emerald-400">
                  Indian Council of Agricultural Research (ICAR)
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3 text-stone-500" />
                <a href="https://soilhealth.dac.gov.in/" target="_blank" rel="noreferrer" className="hover:text-emerald-400">
                  Soil Health Card Portal (DAC&FW)
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3 text-stone-500" />
                <a href="https://data.gov.in/" target="_blank" rel="noreferrer" className="hover:text-emerald-400">
                  Open Government Data (OGD) India
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3 text-stone-500" />
                <a href="https://agmarknet.gov.in/" target="_blank" rel="noreferrer" className="hover:text-emerald-400">
                  Agmarknet Agricultural Market Portal
                </a>
              </li>
            </ul>
          </div>

          {/* Supported Languages */}
          <div>
            <h4 className="font-['Outfit'] text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Supported Languages
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <span className="bg-stone-800/80 px-2.5 py-1.5 rounded-lg border border-stone-700/60 text-stone-300">తెలుగు (Telugu)</span>
              <span className="bg-stone-800/80 px-2.5 py-1.5 rounded-lg border border-stone-700/60 text-stone-300">हिन्दी (Hindi)</span>
              <span className="bg-stone-800/80 px-2.5 py-1.5 rounded-lg border border-stone-700/60 text-stone-300">தமிழ் (Tamil)</span>
              <span className="bg-stone-800/80 px-2.5 py-1.5 rounded-lg border border-stone-700/60 text-stone-300">ಕನ್ನಡ (Kannada)</span>
              <span className="bg-stone-800/80 px-2.5 py-1.5 rounded-lg border border-stone-700/60 text-stone-300">മലയാളം (Malayalam)</span>
              <span className="bg-stone-800/80 px-2.5 py-1.5 rounded-lg border border-stone-700/60 text-stone-300">English (India)</span>
            </div>
          </div>

        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p className="max-w-2xl text-[11px] leading-relaxed">
            {t('footer.disclaimer')}
          </p>
          <div className="flex items-center gap-1 shrink-0 text-stone-400">
            <span>Built with precision for Indian Farmers</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
          </div>
        </div>

      </div>
    </footer>
  );
}

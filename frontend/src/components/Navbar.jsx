import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Sprout, Globe, Menu, X, ChevronDown, 
  BarChart3, Sparkles, BookOpen, Info, Compass, Calculator
} from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' }
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('veltrix_lang', code);
    setLangDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/planning', label: t('nav.planning') },
    { to: '/recommendations', label: t('nav.recommendations') },
    { to: '/optimization', label: t('nav.optimization') },
    { to: '/dashboard', label: t('nav.dashboard') },
    { to: '/assistant', label: t('nav.assistant'), isSpecial: true },
    { to: '/knowledge', label: t('nav.knowledge') },
    { to: '/about', label: t('nav.about') }
  ];

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  return (
    <header className="sticky top-0 z-50 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-900 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <span className="font-['Outfit'] font-bold text-xl tracking-tight text-emerald-950 flex items-center gap-1.5">
                VELTRIX <span className="text-emerald-600 font-semibold text-sm px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">AGRI</span>
              </span>
              <p className="text-[10px] text-stone-500 font-medium tracking-wide uppercase">AI & Linear Optimization</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'text-emerald-800 bg-emerald-100/70 font-semibold' 
                      : 'text-stone-600 hover:text-emerald-800 hover:bg-stone-100/80'
                  } ${link.isSpecial ? 'flex items-center gap-1.5 text-emerald-700' : ''}`}
                >
                  {link.isSpecial && <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Language Selector & CTA */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200/80 border border-stone-200 transition-colors"
                title="Select Language"
              >
                <Globe className="w-4 h-4 text-emerald-700" />
                <span>{currentLang.native}</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white shadow-xl border border-stone-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider border-b border-stone-100">
                    Indian Languages
                  </div>
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => changeLanguage(l.code)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                        i18n.language === l.code ? 'text-emerald-800 font-bold bg-emerald-50/50' : 'text-stone-700'
                      }`}
                    >
                      <span>{l.native}</span>
                      <span className="text-[10px] text-stone-400 font-normal">{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CTA Button */}
            <Link
              to="/planning"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-950/15 hover:shadow-lg transition-all"
            >
              {t('nav.plan_my_farm')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="p-2 rounded-lg text-stone-600 bg-stone-100 border border-stone-200"
            >
              <Globe className="w-4 h-4 text-emerald-700" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-700 hover:bg-stone-100"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-stone-200 px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-2 gap-1.5 pb-3 border-b border-stone-100">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => changeLanguage(l.code)}
                className={`px-3 py-2 rounded-lg text-xs font-medium text-left border ${
                  i18n.language === l.code ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'border-stone-100 text-stone-600'
                }`}
              >
                {l.native}
              </button>
            ))}
          </div>
          
          <div className="space-y-1 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                  location.pathname === link.to
                    ? 'text-emerald-800 bg-emerald-50 font-semibold'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-3">
            <Link
              to="/planning"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center py-3 rounded-xl text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-700 shadow-md"
            >
              {t('nav.plan_my_farm')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

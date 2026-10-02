import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '../src/i18n/index.js';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import FarmPlanning from './pages/FarmPlanning';
import CropRecommendations from './pages/CropRecommendations';
import ResourceOptimization from './pages/ResourceOptimization';
import Dashboard from './pages/Dashboard';
import AIAssistant from './pages/AIAssistant';
import KnowledgeHub from './pages/KnowledgeHub';
import About from './pages/About';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#FAF9F5]">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/planning" element={<FarmPlanning />} />
            <Route path="/recommendations" element={<CropRecommendations />} />
            <Route path="/optimization" element={<ResourceOptimization />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assistant" element={<AIAssistant />} />
            <Route path="/knowledge" element={<KnowledgeHub />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

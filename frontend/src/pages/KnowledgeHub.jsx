import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BookOpen, Search, Filter, ShieldCheck, Clock, 
  ThumbsUp, UserCheck, PlusCircle, AlertCircle, X, CheckCircle2
} from 'lucide-react';
import { getKnowledgeSolutions, submitKnowledgeSolution, reviewKnowledgeSolution } from '../services/api';

export default function KnowledgeHub() {
  const { t } = useTranslation();

  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Submit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [formCrop, setFormCrop] = useState('Rice (Paddy)');
  const [formCategory, setFormCategory] = useState('pest_disease');
  const [formQuestion, setFormQuestion] = useState('');
  const [formSolution, setFormSolution] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState('');

  useEffect(() => {
    fetchSolutions();
  }, []);

  const fetchSolutions = async () => {
    setLoading(true);
    try {
      const res = await getKnowledgeSolutions();
      setSolutions(res.data || []);
    } catch (err) {
      console.error('Failed to load solutions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSolution = async (e) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formSolution.trim()) return;

    setSubmitting(true);
    try {
      await submitKnowledgeSolution({
        question: formQuestion,
        crop: formCrop,
        region: "Farmer Field Contribution",
        problem_category: formCategory,
        solution_text: formSolution,
        evidence_sources: "Farmer Field Submission (Pending Agronomist Verification)"
      });

      setModalOpen(false);
      setFormQuestion('');
      setFormSolution('');
      setFeedbackNotice("Your field experience has been recorded as a 'Candidate' solution for agronomic review.");
      fetchSolutions();
    } catch (err) {
      console.error('Error submitting solution:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (id, newStatus) => {
    try {
      await reviewKnowledgeSolution(id, {
        status: newStatus,
        verified_by: "Agricultural Extension Officer",
        verification_notes: "Evaluated according to ICAR package of practices."
      });
      fetchSolutions();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Filter solutions
  const filteredSolutions = solutions.filter(s => {
    const matchesSearch = (s.question + " " + s.solution_text + " " + s.crop).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || s.problem_category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-stone-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 border border-emerald-300 text-emerald-800 text-xs font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
              <span>Traceable Agricultural Repository • ICAR Standardized</span>
            </div>
            <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-extrabold text-stone-900">
              {t('knowledge.title')}
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-2xl">
              {t('knowledge.subtitle')} Preserving successful field treatments and verifying them through agricultural extension officers.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 shadow-md transition-all self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('knowledge.btn_submit_solution')}</span>
          </button>
        </div>

        {/* Feedback Notice */}
        {feedbackNotice && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{feedbackNotice}</span>
            </div>
            <button onClick={() => setFeedbackNotice('')} className="text-stone-400 hover:text-stone-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search & Category Filter Bar */}
        <div className="bg-white rounded-2xl p-4 mb-8 border border-stone-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
          
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search solutions by disease, pest, nutrient, or crop (e.g. blast, pink bollworm, AWD)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 text-xs bg-stone-50 font-medium text-stone-700"
            >
              <option value="all">{t('knowledge.filter_all')}</option>
              <option value="pest_disease">{t('knowledge.filter_pest')}</option>
              <option value="soil_water">{t('knowledge.filter_water')}</option>
              <option value="fertilizer">{t('knowledge.filter_fert')}</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 text-xs bg-stone-50 font-medium text-stone-700"
            >
              <option value="all">All Verification Statuses</option>
              <option value="verified">Verified by Agronomist</option>
              <option value="candidate">Candidate (Community)</option>
              <option value="needs_review">Needs Review</option>
            </select>
          </div>

        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center text-stone-500 text-sm">
            Loading agricultural knowledge solutions...
          </div>
        )}

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSolutions.map((sol) => (
            <div key={sol.id} className="agri-card p-6 bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
              
              <div>
                {/* Status Badges & Crop */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    {sol.crop}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {sol.status === 'verified' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{t('knowledge.status_verified')}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-medium border border-amber-300">
                        <Clock className="w-3 h-3 text-amber-700" />
                        <span>Candidate Solution</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Problem Question */}
                <h3 className="font-['Outfit'] font-bold text-base text-stone-900 mb-2 leading-snug">
                  {sol.question}
                </h3>

                {/* Solution Text */}
                <p className="text-xs text-stone-700 leading-relaxed mb-4 whitespace-pre-line bg-stone-50/80 p-3.5 rounded-xl border border-stone-100">
                  {sol.solution_text}
                </p>

                {/* Verification Authority Details */}
                {sol.verified_by && (
                  <div className="text-[11px] text-stone-600 mb-3 flex items-start gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Verified by:</strong> {sol.verified_by} • <em>{sol.verification_notes}</em>
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer: Sources & Community Approval */}
              <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
                <span className="truncate max-w-[280px]">
                  Ref: {sol.evidence_sources}
                </span>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{sol.success_count || 1} Farmers benefited</span>
                  </span>

                  {/* Review Actions if Candidate */}
                  {sol.status !== 'verified' && (
                    <button
                      onClick={() => handleReview(sol.id, 'verified')}
                      className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[10px]"
                    >
                      Approve (Verify)
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Modal: Contribute Field Solution */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
              
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
                <h3 className="font-['Outfit'] font-bold text-lg text-stone-900">
                  {t('knowledge.modal_title')}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSolution} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Crop Name</label>
                  <input
                    type="text"
                    value={formCrop}
                    onChange={(e) => setFormCrop(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Problem Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="pest_disease">Pests & Diseases</option>
                    <option value="soil_water">Soil & Irrigation Management</option>
                    <option value="fertilizer">Nutrient & Fertilizer Schedule</option>
                    <option value="general">General Agricultural Practice</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Problem Description</label>
                  <input
                    type="text"
                    placeholder="e.g. How did you manage stem borer in corn?"
                    value={formQuestion}
                    onChange={(e) => setFormQuestion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Action & Solution Followed</label>
                  <textarea
                    rows={4}
                    placeholder="Describe exact biological, cultural, or organic treatment applied, dosages, and observed outcome..."
                    value={formSolution}
                    onChange={(e) => setFormSolution(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-stone-700 hover:bg-stone-100 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl text-white bg-emerald-800 hover:bg-emerald-700 font-bold disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit for Verification'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

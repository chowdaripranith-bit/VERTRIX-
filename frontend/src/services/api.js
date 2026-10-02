import axios from 'axios';

// In browsers, relative '/api' routes to current domain/port automatically (localhost, tunnel, or cloud)
const API_BASE_URL = typeof window !== 'undefined' 
  ? '/api' 
  : (import.meta.env.VITE_API_BASE_URL || '/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export const checkHealth = () => api.get('/health');

export const getCrops = (params) => api.get('/crops', { params });

export const createFarmProfile = (profileData) => api.post('/farm-profiles', profileData);

export const getRecommendations = (data) => api.post('/recommendations/crops', data);

export const predictYield = (data) => api.post('/predictions/yield', data);

export const optimizePlan = (data) => api.post('/optimization/plan', data);

export const getPlanDetails = (planId) => api.get(`/optimization/plans/${planId}`);

export const askVoiceAssistant = (data) => api.post('/assistant/ask', data);

export const getAssistantHistory = (sessionId) => api.get(`/assistant/history/${sessionId}`);

export const clearAssistantHistory = (sessionId) => api.delete(`/assistant/history/${sessionId}`);

export const submitAssistantFeedback = (data) => api.post('/assistant/feedback', data);

export const getKnowledgeSolutions = (params) => api.get('/knowledge/solutions', { params });

export const submitKnowledgeSolution = (data) => api.post('/knowledge/solutions', data);

export const reviewKnowledgeSolution = (solutionId, data) => api.post(`/knowledge/solutions/${solutionId}/review`, data);

export const getModelMetrics = () => api.get('/model/metrics');

export default api;

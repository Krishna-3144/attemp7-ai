import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// Log outgoing requests in dev for debugging
api.interceptors.request.use((config) => {
  if (import.meta.env.DEV) {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data);
  }
  return config;
});

export async function analyzeInput(input) {
  if (!input || input.trim().length < 3) {
    throw new Error('Please enter a topic or URL (at least 3 characters).');
  }
  const res = await api.post('/analyze', { input: input.trim() });
  return res.data;
}

export async function compareArticles(article1, article2) {
  const res = await api.post('/compare', { article1, article2 });
  return res.data;
}

export async function submitVote(side, analysisId, topic) {
  const res = await api.post('/votes', { side, analysisId, topic });
  return res.data;
}

export async function getVotes(id) {
  const res = await api.get(`/votes/${id}`);
  return res.data;
}

export async function getTrending(category = 'general') {
  const res = await api.get(`/trending?category=${category}`);
  return res.data;
}

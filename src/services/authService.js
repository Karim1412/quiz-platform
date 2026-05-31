import axios from 'axios';

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';

const api = axios.create({
  baseURL: `${BACKEND}/api`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('qc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap error messages cleanly
api.interceptors.response.use(
  res => res,
  err => {
    const message = err.response?.data?.message || err.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export const authService = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  async register(name, email, password, role, grade = '') {
    const { data } = await api.post('/auth/register', { name, email, password, role, grade });
    return data;
  },
  async me() {
    const { data } = await api.get('/auth/me');
    return data.user;
  },
};

export const quizService = {
  async list()   { const { data } = await api.get('/quizzes');       return data.quizzes; },
  async get(id)  { const { data } = await api.get(`/quizzes/${id}`); return data.quiz; },
  async create(payload) { const { data } = await api.post('/quizzes', payload); return data.quiz; },
  async remove(id)      { await api.delete(`/quizzes/${id}`); },
  async togglePublish(id) { const { data } = await api.patch(`/quizzes/${id}/publish`); return data.quiz; },
};

export const resultService = {
  async submit({ quizId, answers, timeTaken }) {
    const { data } = await api.post('/results', { quizId, answers, timeTaken });
    return data;
  },
  async myHistory() { const { data } = await api.get('/results/me');               return data.results; },
  async forQuiz(id) { const { data } = await api.get(`/results/quiz/${id}`);       return data; },
};

export const leaderboardService = {
  async global(limit = 20)  { const { data } = await api.get('/leaderboard',             { params: { limit } }); return data.leaderboard; },
  async forQuiz(quizId)     { const { data } = await api.get(`/leaderboard/quiz/${quizId}`);                     return data.leaderboard; },
};

export const userService = {
  async students() { const { data } = await api.get('/users/students'); return data.students; },
  async updateMe(updates) { const { data } = await api.patch('/users/me', updates); return data.user; },
};

export default api;

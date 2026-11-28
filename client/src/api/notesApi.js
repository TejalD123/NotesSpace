import axios from 'axios';

const TOKEN_KEY = 'auth_token';

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
export const setToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage blocked */
  }
};
export const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage blocked */
  }
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 120000, // AI generation la veL lagto
});

// Pratyek request la login token jodto
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const isCredentialCall = (url = '') => /\/auth\/(login|register)/.test(url);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;

    // Token expire/invalid zala -> logout (login/register chya chukicha password ne nahi)
    if (status === 401 && !isCredentialCall(err.config?.url)) {
      clearToken();
      window.dispatchEvent(new Event('auth:expired'));
    }

    let message = err.response?.data?.message;
    if (!message) {
      if (err.code === 'ECONNABORTED') message = 'The request timed out. Please try again.';
      else if (err.message === 'Network Error')
        message = 'Cannot reach the server. Check that the backend is running.';
      else message = err.message || 'Something went wrong';
    }
    const error = new Error(message);
    error.status = status;
    return Promise.reject(error);
  }
);

// ---------- Auth ----------
export const register = (name, email, password) =>
  api.post('/auth/register', { name, email, password }).then((r) => r.data);
export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then((r) => r.data);
export const getMe = () => api.get('/auth/me').then((r) => r.data.user);

// ---------- Notes ----------
export const createFromTopic = (topic, depth) =>
  api.post('/notes/topic', { topic, depth }).then((r) => r.data);

export const createFromUrl = (url, depth) =>
  api.post('/notes/url', { url, depth }).then((r) => r.data);

export const createFromImage = (file, depth) => {
  const form = new FormData();
  form.append('depth', depth);
  form.append('image', file);
  return api.post('/notes/image', form).then((r) => r.data);
};

export const getNotes = () => api.get('/notes').then((r) => r.data);
export const getNote = (id) => api.get(`/notes/${id}`).then((r) => r.data);
export const deleteNote = (id) => api.delete(`/notes/${id}`).then((r) => r.data);

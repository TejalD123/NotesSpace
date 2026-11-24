import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 120000, // AI generation la veL lagto
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    let message = err.response?.data?.message;
    if (!message) {
      if (err.code === 'ECONNABORTED') message = 'The request timed out. Please try again.';
      else if (err.message === 'Network Error')
        message = 'Cannot reach the server. Check that the backend is running.';
      else message = err.message || 'Something went wrong';
    }
    return Promise.reject(new Error(message));
  }
);

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

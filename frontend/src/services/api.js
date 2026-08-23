import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const apiBaseUrl = typeof window !== 'undefined' && window.location.hostname === '127.0.0.1'
  ? configuredApiUrl.replace('localhost', '127.0.0.1')
  : configuredApiUrl;

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;

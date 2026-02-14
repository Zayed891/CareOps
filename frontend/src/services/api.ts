import axios from 'axios';
import { toast } from '../utils/toastEvent';

const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        } else if (error.response?.status === 429) {
            const retryAfter = error.response.headers?.['retry-after'];
            const message = retryAfter
                ? `Rate limit exceeded. Please try again in ${retryAfter} seconds.`
                : 'Rate limit exceeded. Please slow down.';
            toast.error(message);
        }
        return Promise.reject(error);
    }
);

export default api;

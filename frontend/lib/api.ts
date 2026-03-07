import axios from 'axios';
import { getToken, removeToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add JWT token to requests from cookies
apiClient.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle HTTP errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const method = error.config?.method?.toUpperCase() ?? 'UNKNOWN';
        const url = error.config?.url ?? 'UNKNOWN';
        const message = error.response?.data?.message ?? error.message;

        if (status === 401) {
            removeToken();
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        } else {
            // Structured error log — replace console.error with Sentry/DataDog in production
            console.error(`[API Error] ${method} ${url} → HTTP ${status ?? 'N/A'}: ${message}`);
        }

        return Promise.reject(error);
    }
);

export default apiClient;

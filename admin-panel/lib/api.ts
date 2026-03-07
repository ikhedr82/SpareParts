import axios from 'axios';
import Cookies from 'js-cookie';

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for Auth and Correlation
api.interceptors.request.use((config) => {
    const token = Cookies.get('auth-token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Add X-Tenant header for dev/scoped testing if needed
    // In production, this is usually handled by subdomain middleware on the backend
    
    return config;
});

// Response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.message;
        console.error('[API Error]:', {
            path: error.config?.url,
            message,
            status: error.response?.status
        });
        
        if (error.response?.status === 401) {
            // Handle unauthorized - potentially redirect to login
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

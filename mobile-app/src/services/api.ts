import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';

/**
 * Partivo Mobile API Client
 * - Auto-attaches JWT from SecureStore
 * - Token expiry detection (401 → triggers logout callback)
 * - No hardcoded URLs — uses environment variable
 */
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

// Auth token interceptor
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    try {
        let token: string | null = null;
        if (Platform.OS !== 'web') {
            token = await SecureStore.getItemAsync(TOKEN_KEY);
        } else {
            token = localStorage.getItem(TOKEN_KEY);
        }
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (err) {
        // Silently continue without token
    }
    return config;
});

// Logout callback — set by the app to handle 401s
let onUnauthorized: (() => void) | null = null;
export function setOnUnauthorized(cb: () => void) {
    onUnauthorized = cb;
}

// Error interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401 && onUnauthorized) {
            onUnauthorized();
        }
        // Never log tokens
        const safeError = {
            status: error.response?.status,
            url: error.config?.url,
            method: error.config?.method,
            message: (error.response?.data as any)?.message || error.message,
        };
        console.warn('[API Error]', JSON.stringify(safeError));
        return Promise.reject(error);
    }
);

export default apiClient;

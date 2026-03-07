import api from './api';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_info';

interface AuthResponse {
    accessToken: string;
    expiresIn: number;
}

interface JwtPayload {
    sub: string;
    email: string;
    roles: string[];
    tenantId: string;
    branchId?: string | null;
    isPlatformUser: boolean;
    iat?: number;
    exp?: number;
}

export const authService = {
    async login(email: string, password: string) {
        try {
            console.log(`[AuthService] Attempting login to ${api.defaults.baseURL}/auth/login`);

            const response = await api.post<AuthResponse>('/auth/login', { email, password });
            const { accessToken } = response.data;

            if (!accessToken) {
                throw new Error('No access token received');
            }

            // Decode token to get user info
            const decoded: JwtPayload = jwtDecode(accessToken);
            console.log('[AuthService] Decoded token:', decoded);

            const user = {
                id: decoded.sub,
                email: decoded.email,
                name: decoded.email.split('@')[0], // Fallback name from email
                role: decoded.roles[0] || 'USER',
                tenantId: decoded.tenantId,
                branchId: decoded.branchId
            };

            if (Platform.OS !== 'web') {
                await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
                await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
            } else {
                // Fallback for web (if needed)
                localStorage.setItem(TOKEN_KEY, accessToken);
                localStorage.setItem(USER_KEY, JSON.stringify(user));
            }

            // Set default header for future requests
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            return { access_token: accessToken, user };
        } catch (error: any) {
            console.error('[AuthService] Login error:', error);
            if (error.response) {
                console.error('[AuthService] Response data:', error.response.data);
                throw new Error(error.response.data.message || 'Login failed');
            }
            throw error;
        }
    },

    async logout() {
        if (Platform.OS !== 'web') {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(USER_KEY);
        } else {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        }
        delete api.defaults.headers.common['Authorization'];
    },

    async getUser() {
        if (Platform.OS !== 'web') {
            const user = await SecureStore.getItemAsync(USER_KEY);
            return user ? JSON.parse(user) : null;
        } else {
            const user = localStorage.getItem(USER_KEY);
            return user ? JSON.parse(user) : null;
        }
    },

    async getToken() {
        if (Platform.OS !== 'web') {
            return await SecureStore.getItemAsync(TOKEN_KEY);
        } else {
            return localStorage.getItem(TOKEN_KEY);
        }
    }
};

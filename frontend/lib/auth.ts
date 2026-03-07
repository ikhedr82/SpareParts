import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

export interface JWTPayload {
    sub: string;
    email: string;
    tenantId: string | null;
    branchId: string | null;
    roles: string[];
    isPlatformUser: boolean;
    exp: number;
}

const TOKEN_KEY = 'auth-token';

export function getToken(): string | null {
    return Cookies.get(TOKEN_KEY) || null;
}

export function setToken(token: string): void {
    // Set cookie that expires in 1 day, same as backend JWT usually
    Cookies.set(TOKEN_KEY, token, { expires: 1, path: '/' });
}

export function removeToken(): void {
    Cookies.remove(TOKEN_KEY, { path: '/' });
}

export function decodeToken(): JWTPayload | null {
    const token = getToken();
    if (!token) return null;

    try {
        return jwtDecode<JWTPayload>(token);
    } catch (error) {
        return null;
    }
}

export function isAuthenticated(): boolean {
    const payload = decodeToken();
    if (!payload) return false;

    // Check if token is expired
    const now = Date.now() / 1000;
    return payload.exp > now;
}

export function getUserRole(): 'platform' | 'tenant' | 'branch' | null {
    const payload = decodeToken();
    if (!payload) return null;

    if (payload.isPlatformUser) return 'platform';
    if (payload.branchId) return 'branch';
    if (payload.tenantId) return 'tenant';

    return null;
}

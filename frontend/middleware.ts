import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth-token')?.value;
    const path = request.nextUrl.pathname;

    // Public routes - allow root and auth
    const publicPaths = ['/login', '/signup', '/privacy', '/terms'];
    
    // Redirect legacy multi-page routes to SPA anchors
    const legacyRedirects: Record<string, string> = {
        '/features': '/#features',
        '/pricing': '/#pricing',
        '/about': '/#about',
        '/contact': '/#contact',
        '/docs': '/#faq',
    };

    if (legacyRedirects[path]) {
        return NextResponse.redirect(new URL(legacyRedirects[path], request.url));
    }

    const isPublicRoute = 
        path === '/' || 
        publicPaths.some(p => path === p || path.startsWith(p + '/'));

    if (isPublicRoute) {
        return NextResponse.next();
    }

    // Protect all other routes
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

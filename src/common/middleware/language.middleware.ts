import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * LanguageMiddleware — Resolves the language for every request.
 *
 * Resolution order (strict):
 * 1. `x-language` header (explicit override)
 * 2. Tenant.defaultLanguage (from TenantMiddleware)
 * 3. Hardcoded fallback: 'EN'
 *
 * Attaches `req.language` to the request object.
 * Echoes the resolved language in the `X-Language` response header.
 *
 * Must run AFTER TenantMiddleware (so tenant context is available).
 */
@Injectable()
export class LanguageMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void {
        const FALLBACK = 'EN';

        // Priority 1: Explicit header
        const headerLang = req.headers['x-language'] as string;

        // Priority 2: Tenant default
        const tenantLang = (req as any).tenant?.defaultLanguage;

        // Resolve: header → tenant → fallback
        let resolved = FALLBACK;

        if (headerLang && this.isValid(headerLang)) {
            resolved = headerLang.toUpperCase();
        } else if (tenantLang) {
            resolved = tenantLang;
        }

        // Attach to request
        (req as any).language = resolved;

        // Echo on response
        res.setHeader('X-Language', resolved);

        next();
    }

    private isValid(lang: string): boolean {
        return ['EN', 'AR'].includes(lang.toUpperCase());
    }
}

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * LanguageResponseInterceptor
 * 
 * Global interceptor that automatically localizes API responses.
 * When the request language is Arabic (AR), it:
 *   - Swaps `name` → `nameAr` (if nameAr exists and is non-empty)
 *   - Swaps `description` → `descriptionAr` (if descriptionAr exists and is non-empty)
 *   - Cleans up raw Arabic fields from the response
 * 
 * Applies to: Product, Brand, ProductCategory, and any entity with *Ar fields.
 * Zero-trust: Developers never need to manually localize response fields.
 */
@Injectable()
export class LanguageResponseInterceptor implements NestInterceptor {

    /** Fields eligible for Arabic swap: [originalField, arabicField] */
    private static readonly SWAP_PAIRS: [string, string][] = [
        ['name', 'nameAr'],
        ['description', 'descriptionAr'],
    ];

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const language: string = request?.language || 'EN';

        return next.handle().pipe(
            map((data) => {
                if (language.toUpperCase() === 'AR') {
                    return this.localizeResponse(data);
                }
                // For non-AR: just strip the raw Arabic fields to keep payloads clean
                return this.stripArabicFields(data);
            }),
        );
    }

    private localizeResponse(data: any): any {
        if (data === null || data === undefined) return data;

        // Handle arrays
        if (Array.isArray(data)) {
            return data.map((item) => this.localizeResponse(item));
        }

        // Handle Date, Decimal, and other non-plain objects
        if (typeof data !== 'object' || data === null || data instanceof Date) {
            return data;
        }

        // Convert Prisma Decimal to primitive Number globally to prevent React {s, e, d} crashes
        if (typeof (data as any).toNumber === 'function') {
            return (data as any).toNumber();
        }

        if (typeof (data as any).toJSON === 'function') {
            return (data as any).toJSON();
        }

        const result: Record<string, any> = {};

        for (const [key, value] of Object.entries(data)) {
            // Skip Arabic suffix fields — they'll be merged into the base field
            if (key.endsWith('Ar') && LanguageResponseInterceptor.SWAP_PAIRS.some(([, ar]) => ar === key)) {
                continue;
            }

            // Check if this key has an Arabic counterpart
            const swapPair = LanguageResponseInterceptor.SWAP_PAIRS.find(([base]) => base === key);
            if (swapPair) {
                const [, arKey] = swapPair;
                const arValue = (data as any)[arKey];
                // Use Arabic value if it exists and is non-empty, otherwise keep original
                result[key] = (arValue && String(arValue).trim()) ? arValue : value;
            } else {
                // Recurse into nested objects
                result[key] = typeof value === 'object' && value !== null && !(value instanceof Date) && typeof (value as any).toJSON !== 'function'
                    ? this.localizeResponse(value)
                    : value;
            }
        }

        return result;
    }

    private stripArabicFields(data: any): any {
        if (data === null || data === undefined) return data;

        if (Array.isArray(data)) {
            return data.map((item) => this.stripArabicFields(item));
        }

        if (typeof data !== 'object' || data === null || data instanceof Date) {
            return data;
        }

        if (typeof (data as any).toNumber === 'function') {
            return (data as any).toNumber();
        }

        if (typeof (data as any).toJSON === 'function') {
            return (data as any).toJSON();
        }

        const result: Record<string, any> = {};

        for (const [key, value] of Object.entries(data)) {
            // Skip Arabic-specific fields for non-AR responses
            if (key.endsWith('Ar') && LanguageResponseInterceptor.SWAP_PAIRS.some(([, ar]) => ar === key)) {
                continue;
            }

            result[key] = typeof value === 'object' && value !== null && !(value instanceof Date) && typeof (value as any).toJSON !== 'function'
                ? this.stripArabicFields(value)
                : value;
        }

        return result;
    }
}

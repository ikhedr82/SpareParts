import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class LanguageResponseInterceptor implements NestInterceptor {
    private static readonly SWAP_PAIRS;
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private localizeResponse;
    private stripArabicFields;
}

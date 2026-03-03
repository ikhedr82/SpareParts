import { Logger } from '@nestjs/common';
export interface RetryOptions {
    maxAttempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
}
export declare function withRetry<T>(operation: () => Promise<T>, options?: RetryOptions, logger?: Logger): Promise<T>;

import { Logger } from '@nestjs/common';

export interface RetryOptions {
    maxAttempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
}

/**
 * HC-5: Retry Control Hardening
 *
 * Implements exponential backoff with jitter.
 */
export async function withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = { maxAttempts: 3, baseDelayMs: 100, maxDelayMs: 2000 },
    logger?: Logger,
): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (err) {
            lastError = err;

            if (attempt === options.maxAttempts) break;

            // Exponential backoff: base * 2^attempt
            const delay = Math.min(
                options.maxDelayMs,
                options.baseDelayMs * Math.pow(2, attempt),
            );

            // Jitter: +/- 20% to avoid thundering herd
            const jitter = delay * 0.2 * (Math.random() * 2 - 1);
            const finalDelay = delay + jitter;

            if (logger) {
                logger.warn(`Attempt ${attempt} failed. Retrying in ${Math.round(finalDelay)}ms... (Error: ${err.message})`);
            }

            await new Promise(resolve => setTimeout(resolve, finalDelay));
        }
    }

    throw lastError;
}

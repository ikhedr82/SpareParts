"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withRetry = withRetry;
async function withRetry(operation, options = { maxAttempts: 3, baseDelayMs: 100, maxDelayMs: 2000 }, logger) {
    let lastError;
    for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
        try {
            return await operation();
        }
        catch (err) {
            lastError = err;
            if (attempt === options.maxAttempts)
                break;
            const delay = Math.min(options.maxDelayMs, options.baseDelayMs * Math.pow(2, attempt));
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
//# sourceMappingURL=retry.helper.js.map
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * G-10: Correlation-ID Middleware
 * Reads or generates X-Correlation-ID header, attaches to request
 * and echoes it back on the response for end-to-end traceability.
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const incoming = req.headers['x-correlation-id'] as string;
        const correlationId = incoming || randomUUID();

        // Attach to request for downstream use (audit logs, services)
        (req as any).correlationId = correlationId;

        // Echo on response
        res.setHeader('X-Correlation-ID', correlationId);

        next();
    }
}

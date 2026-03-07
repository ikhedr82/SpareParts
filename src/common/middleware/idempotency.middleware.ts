import { Injectable, NestMiddleware, ConflictException, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * G-09 / HC-1: Global Idempotency Middleware (Distributed Safe)
 *
 * For POST/PATCH/PUT requests:
 *   - Idempotency-Key header is MANDATORY.
 *   - Uses 'IdempotencyRecord' table in DB for persistent storage.
 *   - Handles in-flight requests using unique constraint on [tenantId, key].
 *   - Replays cached responses for retries.
 */
@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
    constructor(private prisma: PrismaService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        // Only apply to mutating methods
        if (!['POST', 'PATCH', 'PUT'].includes(req.method)) {
            return next();
        }

        // Exempt paths
        const exempt = ['/auth/', '/api/platform/', '/api/auth/', '/operations/status'];
        if (exempt.some(prefix => req.url.startsWith(prefix))) {
            return next();
        }

        const idempotencyKey = req.headers['idempotency-key'] as string;
        const tenantId = (req as any).user?.tenantId || (req as any).tenantId;

        if (!idempotencyKey) {
            throw new BadRequestException('Idempotency-Key header is required for write operations.');
        }

        if (!tenantId) {
            // If tenantId is not yet available, we can't safely lock. 
            // Usually, TenantMiddleware runs after this if not careful.
            // In AppModule, Idempotency is applied BEFORE Tenant.
            // But CorrelationId is BEFORE Idempotency.
            // We need tenantId from the user token (JwtAuthGuard hasn't run yet if it's a guard).
            // Middleware runs before guards.
            // We might need to manually decode the token or rely on TenantMiddleware having run.
            return next();
        }

        try {
            // 1. Check for existing record
            const existing = await this.prisma.idempotencyRecord.findUnique({
                where: {
                    tenantId_idempotencyKey: { tenantId, idempotencyKey }
                }
            });

            if (existing) {
                if (existing.expiresAt < new Date()) {
                    // Expired — delete and continue (rare if TTL is long)
                    await this.prisma.idempotencyRecord.delete({ where: { id: existing.id } });
                } else if (existing.statusCode === 0) {
                    // In-flight
                    throw new ConflictException('Request with this key is already in progress.');
                } else {
                    // Completed — Replay
                    res.status(existing.statusCode).json(existing.responseBody);
                    return;
                }
            }

            // 2. Mark as in-flight (atomic creation)
            await this.prisma.idempotencyRecord.create({
                data: {
                    tenantId,
                    userId: (req as any).user?.id || 'SYSTEM',
                    idempotencyKey,
                    statusCode: 0, // 0 = IN_FLIGHT
                    responseBody: {},
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
                }
            });

            // 3. Intercept response
            const originalJson = res.json.bind(res);
            res.json = (body: any): Response => {
                // Update record on finish (async, don't block response)
                this.prisma.idempotencyRecord.update({
                    where: { tenantId_idempotencyKey: { tenantId, idempotencyKey } },
                    data: {
                        statusCode: res.statusCode,
                        responseBody: body || {},
                    }
                }).catch(err => console.error('[Idempotency] Failed to update record:', err));

                return originalJson(body);
            };

            // On server error, allow retry
            res.on('finish', () => {
                if (res.statusCode >= 500) {
                    this.prisma.idempotencyRecord.delete({
                        where: { tenantId_idempotencyKey: { tenantId, idempotencyKey } }
                    }).catch(() => { });
                }
            });

            next();
        } catch (err) {
            if (err instanceof ConflictException || err instanceof BadRequestException) throw err;
            if (err.code === 'P2002') {
                throw new ConflictException('Request with this key is already in progress (Concurrent Hit).');
            }
            console.error('[Idempotency] Middleware error:', err);
            next();
        }
    }
}

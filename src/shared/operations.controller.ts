import { Controller, Get, Query, NotFoundException, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

/**
 * HC-1 / Async Polling: GET /operations/status
 *
 * Allows clients to poll the status of an asynchronous or timed-out operation
 * identified by its Idempotency-Key.
 */
@Controller('operations')
@UseGuards(JwtAuthGuard)
export class OperationsController {
    constructor(private prisma: PrismaService) { }

    @Get('status')
    async getStatus(@Req() req, @Query('idempotencyKey') key: string) {
        if (!key) {
            return { error: 'idempotencyKey query param is required' };
        }

        const tenantId = req.user.tenantId;

        const record = await this.prisma.idempotencyRecord.findUnique({
            where: {
                tenantId_idempotencyKey: { tenantId, idempotencyKey: key }
            }
        });

        if (!record || record.expiresAt < new Date()) {
            throw new NotFoundException(
                `No operation found for idempotency key: ${key}. Key may have expired (24h TTL).`,
            );
        }

        if (record.statusCode === 0) {
            return { status: 'IN_FLIGHT' };
        }

        const isSuccess = record.statusCode >= 200 && record.statusCode < 300;
        return {
            status: isSuccess ? 'SUCCESS' : 'FAILURE',
            response: record.responseBody,
        };
    }
}

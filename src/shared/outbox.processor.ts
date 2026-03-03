import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EventBus } from './event-bus.service';

/**
 * HC-1: Outbox Processor
 *
 * Scans the 'OutboxEvent' table for PENDING events and publishes them to the internal EventBus.
 * Implementation Details:
 *  - Runs every 5 seconds (configurable).
 *  - Fetches events in batches.
 *  - Marks as PROCESSED on success, FAILED on error.
 */
@Injectable()
export class OutboxProcessor {
    private readonly logger = new Logger(OutboxProcessor.name);
    private isProcessing = false;

    constructor(
        private prisma: PrismaService,
        private eventBus: EventBus,
    ) { }

    @Cron(CronExpression.EVERY_5_SECONDS)
    async process() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            const events = await this.prisma.outboxEvent.findMany({
                where: { status: 'PENDING' },
                take: 50,
                orderBy: { createdAt: 'asc' },
            });

            if (events.length === 0) {
                this.isProcessing = false;
                return;
            }

            this.logger.log(`Processing ${events.length} outbox events...`);

            for (const event of events) {
                try {
                    // Publish to internal EventBus
                    this.eventBus.emit(event.topic, {
                        ...event.payload as object,
                        _metadata: {
                            outboxId: event.id,
                            correlationId: event.correlationId,
                            tenantId: event.tenantId,
                        },
                    });

                    // Mark as processed
                    await this.prisma.outboxEvent.update({
                        where: { id: event.id },
                        data: {
                            status: 'PROCESSED',
                            processedAt: new Date(),
                        },
                    });
                } catch (err) {
                    this.logger.error(`Failed to process outbox event ${event.id}:`, err);
                    await this.prisma.outboxEvent.update({
                        where: { id: event.id },
                        data: {
                            status: 'FAILED',
                            error: err.message,
                        },
                    });
                }
            }
        } catch (err) {
            this.logger.error('Error in OutboxProcessor:', err);
        } finally {
            this.isProcessing = false;
        }
    }
}

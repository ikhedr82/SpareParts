import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

/**
 * HC-1: Transactional Outbox Pattern
 *
 * Ensures that events are only emitted if the database transaction succeeds.
 * Events are written to the 'OutboxEvent' table inside the transaction.
 * A separate processor then publishes these events to the EventBus.
 */
@Injectable()
export class OutboxService {
    private readonly logger = new Logger(OutboxService.name);

    /**
     * Schedules an event to be emitted via the Outbox.
     * MUST be called within a Prisma transaction.
     */
    async schedule(
        tx: Prisma.TransactionClient,
        data: {
            tenantId: string;
            topic: string;
            payload: any;
            correlationId?: string;
        },
    ) {
        this.logger.debug(`Scheduling outbox event for topic: ${data.topic}`);
        return tx.outboxEvent.create({
            data: {
                tenantId: data.tenantId,
                topic: data.topic,
                payload: data.payload,
                correlationId: data.correlationId || null,
                status: 'PENDING',
            },
        });
    }
}

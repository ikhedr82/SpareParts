import { PrismaService } from '../prisma/prisma.service';
import { EventBus } from './event-bus.service';
export declare class OutboxProcessor {
    private prisma;
    private eventBus;
    private readonly logger;
    private isProcessing;
    constructor(prisma: PrismaService, eventBus: EventBus);
    process(): Promise<void>;
}

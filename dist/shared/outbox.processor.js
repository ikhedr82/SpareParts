"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OutboxProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboxProcessor = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const event_bus_service_1 = require("./event-bus.service");
let OutboxProcessor = OutboxProcessor_1 = class OutboxProcessor {
    constructor(prisma, eventBus) {
        this.prisma = prisma;
        this.eventBus = eventBus;
        this.logger = new common_1.Logger(OutboxProcessor_1.name);
        this.isProcessing = false;
    }
    async process() {
        if (this.isProcessing)
            return;
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
                    this.eventBus.emit(event.topic, Object.assign(Object.assign({}, event.payload), { _metadata: {
                            outboxId: event.id,
                            correlationId: event.correlationId,
                            tenantId: event.tenantId,
                        } }));
                    await this.prisma.outboxEvent.update({
                        where: { id: event.id },
                        data: {
                            status: 'PROCESSED',
                            processedAt: new Date(),
                        },
                    });
                }
                catch (err) {
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
        }
        catch (err) {
            this.logger.error('Error in OutboxProcessor:', err);
        }
        finally {
            this.isProcessing = false;
        }
    }
};
exports.OutboxProcessor = OutboxProcessor;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OutboxProcessor.prototype, "process", null);
exports.OutboxProcessor = OutboxProcessor = OutboxProcessor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_bus_service_1.EventBus])
], OutboxProcessor);
//# sourceMappingURL=outbox.processor.js.map
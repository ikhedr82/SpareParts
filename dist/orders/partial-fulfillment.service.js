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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartialFulfillmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const audit_service_1 = require("../shared/audit.service");
const outbox_service_1 = require("../shared/outbox.service");
const fsm_guard_1 = require("../common/guards/fsm.guard");
const invariant_exception_1 = require("../common/exceptions/invariant.exception");
const translation_service_1 = require("../i18n/translation.service");
let PartialFulfillmentService = class PartialFulfillmentService {
    constructor(prisma, auditService, outbox, t) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.outbox = outbox;
        this.t = t;
    }
    async partialFulfill(tenantId, orderId, userId, fulfillmentLines, correlationId) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, tenantId },
            include: { items: true },
        });
        if (!order)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Order' }));
        (0, fsm_guard_1.assertTransition)('Order', orderId, order.status, client_1.OrderStatus.PARTIALLY_FULFILLED, fsm_guard_1.ORDER_TRANSITIONS);
        for (const line of fulfillmentLines) {
            const orderItem = order.items.find(i => i.id === line.orderItemId);
            if (!orderItem)
                throw new common_1.BadRequestException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Order item' }));
            if (line.fulfilledQty < 0 || line.fulfilledQty > orderItem.quantity) {
                throw new invariant_exception_1.InvariantException('PF-01', this.t.translate('errors.orders.quantity_exceeds', 'EN'), {
                    orderItemId: line.orderItemId, ordered: orderItem.quantity, fulfilled: line.fulfilledQty,
                });
            }
        }
        const allFull = fulfillmentLines.every(l => {
            const item = order.items.find(i => i.id === l.orderItemId);
            return l.fulfilledQty === item.quantity;
        });
        const allZero = fulfillmentLines.every(l => l.fulfilledQty === 0);
        if (allFull)
            throw new invariant_exception_1.InvariantException('PF-02', this.t.translate('errors.orders.invalid_transition', 'EN', { entity: 'Order', from: 'PARTIAL', to: 'FULL' }), {});
        if (allZero)
            throw new invariant_exception_1.InvariantException('PF-03', this.t.translate('errors.orders.no_items', 'EN'), {});
        return this.prisma.$transaction(async (tx) => {
            for (const line of fulfillmentLines) {
                const orderItem = order.items.find(i => i.id === line.orderItemId);
                const backordered = orderItem.quantity - line.fulfilledQty;
                await tx.orderFulfillmentLine.create({
                    data: {
                        orderId, orderItemId: line.orderItemId,
                        fulfilledQty: line.fulfilledQty,
                        backorderedQty: backordered,
                    },
                });
            }
            const result = await tx.order.updateMany({
                where: { id: orderId, tenantId, version: order.version },
                data: {
                    status: client_1.OrderStatus.PARTIALLY_FULFILLED,
                    version: { increment: 1 },
                },
            });
            if (result.count === 0)
                throw new Error('CONCURRENCY_CONFLICT');
            await this.outbox.schedule(tx, {
                tenantId, topic: 'orders.partially_fulfilled',
                payload: { orderId, lines: fulfillmentLines },
                correlationId,
            });
            await this.auditService.logAction(tenantId, userId, 'PARTIAL_FULFILL', 'Order', orderId, { status: order.status }, { status: client_1.OrderStatus.PARTIALLY_FULFILLED, lines: fulfillmentLines }, correlationId, undefined, tx);
            return tx.order.findUnique({
                where: { id: orderId },
                include: { items: true },
            });
        });
    }
    async getFulfillmentLines(tenantId, orderId) {
        const order = await this.prisma.order.findFirst({ where: { id: orderId, tenantId } });
        if (!order)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Order' }));
        return this.prisma.orderFulfillmentLine.findMany({
            where: { orderId },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.PartialFulfillmentService = PartialFulfillmentService;
exports.PartialFulfillmentService = PartialFulfillmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        outbox_service_1.OutboxService,
        translation_service_1.TranslationService])
], PartialFulfillmentService);
//# sourceMappingURL=partial-fulfillment.service.js.map
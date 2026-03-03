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
exports.PickListsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const fsm_guard_1 = require("../common/guards/fsm.guard");
const audit_service_1 = require("../shared/audit.service");
const translation_service_1 = require("../i18n/translation.service");
let PickListsService = class PickListsService {
    constructor(prisma, auditService, t) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.t = t;
    }
    async createPickListForOrder(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { product: true } } },
        });
        if (!order)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Order' }));
        const existing = await this.prisma.pickList.findUnique({ where: { orderId } });
        if (existing)
            return existing;
        return await this.prisma.$transaction(async (tx) => {
            const pickList = await tx.pickList.create({
                data: {
                    tenantId: order.tenantId,
                    branchId: order.branchId,
                    orderId: order.id,
                    status: client_1.PickListStatus.CREATED,
                },
            });
            for (const orderItem of order.items) {
                const inventory = await tx.inventory.findUnique({
                    where: {
                        branchId_productId: {
                            branchId: order.branchId,
                            productId: orderItem.productId,
                        },
                    },
                });
                if (!inventory) {
                    throw new common_1.BadRequestException(this.t.translate('errors.inventory.product_not_found', 'EN'));
                }
                await tx.pickListItem.create({
                    data: {
                        pickListId: pickList.id,
                        productId: orderItem.productId,
                        inventoryId: inventory.id,
                        requiredQty: orderItem.quantity,
                        binLocation: inventory.binLocation,
                        status: client_1.PickListItemStatus.PENDING,
                    },
                });
            }
            return await tx.pickList.findUnique({
                where: { id: pickList.id },
                include: {
                    items: { include: { product: { include: { brand: true, category: true } } } },
                    branch: true,
                    order: true,
                },
            });
        });
    }
    async findAll(tenantId, branchId, status) {
        const where = { tenantId };
        if (branchId)
            where.branchId = branchId;
        if (status)
            where.status = status;
        return await this.prisma.pickList.findMany({
            where,
            include: {
                branch: { select: { id: true, name: true } },
                order: {
                    select: {
                        id: true,
                        orderNumber: true,
                        businessClient: { select: { businessName: true } },
                    },
                },
                _count: { select: { items: true, packs: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, tenantId) {
        const pickList = await this.prisma.pickList.findFirst({
            where: { id, tenantId },
            include: {
                items: {
                    include: { product: { include: { brand: true, category: true } } },
                    orderBy: { binLocation: 'asc' },
                },
                branch: true,
                order: { include: { businessClient: true, deliveryAddress: true, contact: true } },
                packs: { include: { items: { include: { product: true } } } },
            },
        });
        if (!pickList)
            throw new common_1.NotFoundException(this.t.translate('errors.warehouse.picklist_not_found', 'EN'));
        return pickList;
    }
    async startPicking(id, userId, correlationId, tenantId) {
        const pickList = await this.findOne(id, tenantId);
        if (!pickList)
            throw new common_1.NotFoundException(this.t.translate('errors.warehouse.picklist_not_found', 'EN'));
        (0, fsm_guard_1.assertTransition)('PickList', id, pickList.status, client_1.PickListStatus.PICKING, fsm_guard_1.PICKLIST_TRANSITIONS);
        if (pickList.orderId) {
            const tripStop = await this.prisma.tripStop.findFirst({
                where: { orderId: pickList.orderId },
                include: { trip: { select: { id: true, status: true } } },
            });
            if ((tripStop === null || tripStop === void 0 ? void 0 : tripStop.trip) && !['IN_TRANSIT', 'COMPLETED'].includes(tripStop.trip.status)) {
                throw new common_1.BadRequestException(`Cannot start picking: the associated delivery trip is ${tripStop.trip.status}. Dispatch the trip first.`);
            }
        }
        const updated = await this.prisma.pickList.update({
            where: { id },
            data: { status: client_1.PickListStatus.PICKING, startedAt: new Date() },
            include: { items: { include: { product: true } } },
        });
        await this.auditService.logAction(pickList.tenantId, userId, 'START_PICKING', 'PickList', id, { status: pickList.status }, { status: client_1.PickListStatus.PICKING }, correlationId);
        return updated;
    }
    async pickItem(pickListId, pickListItemId, pickedQty) {
        return await this.prisma.$transaction(async (tx) => {
            const pickListItem = await tx.pickListItem.findUnique({
                where: { id: pickListItemId },
                include: { pickList: true },
            });
            if (!pickListItem) {
                throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'PickListItem' }));
            }
            if (pickListItem.pickListId !== pickListId) {
                throw new common_1.BadRequestException(`PickListItem does not belong to PickList ${pickListId}`);
            }
            const pickListForTrip = await tx.pickList.findUnique({ where: { id: pickListId } });
            if (pickListForTrip === null || pickListForTrip === void 0 ? void 0 : pickListForTrip.orderId) {
                const tripStop = await tx.tripStop.findFirst({
                    where: { orderId: pickListForTrip.orderId },
                    include: { trip: { select: { id: true, status: true } } },
                });
                if ((tripStop === null || tripStop === void 0 ? void 0 : tripStop.trip) && ['FAILED', 'COMPLETED'].includes(tripStop.trip.status)) {
                    throw new common_1.BadRequestException(`Cannot pick: the delivery trip is ${tripStop.trip.status}. Create a new trip.`);
                }
            }
            let itemStatus;
            if (pickedQty >= pickListItem.requiredQty) {
                itemStatus = client_1.PickListItemStatus.PICKED;
            }
            else if (pickedQty > 0) {
                itemStatus = client_1.PickListItemStatus.SHORTAGE;
            }
            else {
                itemStatus = client_1.PickListItemStatus.PENDING;
            }
            await tx.pickListItem.update({
                where: { id: pickListItemId },
                data: { pickedQty, status: itemStatus },
            });
            const allItems = await tx.pickListItem.findMany({ where: { pickListId } });
            const allPicked = allItems.every((item) => item.id === pickListItemId
                ? itemStatus === client_1.PickListItemStatus.PICKED
                : item.status === client_1.PickListItemStatus.PICKED);
            if (allPicked) {
                await tx.pickList.update({
                    where: { id: pickListId },
                    data: { status: client_1.PickListStatus.PICKED, completedAt: new Date() },
                });
            }
            return await tx.pickList.findUnique({
                where: { id: pickListId },
                include: { items: { include: { product: true } } },
            });
        });
    }
    async cancelPickList(id, tenantId) {
        const pickList = await this.findOne(id, tenantId);
        (0, fsm_guard_1.assertTransition)('PickList', id, pickList.status, client_1.PickListStatus.CANCELLED, fsm_guard_1.PICKLIST_TRANSITIONS);
        return await this.prisma.pickList.update({
            where: { id },
            data: { status: client_1.PickListStatus.CANCELLED },
        });
    }
};
exports.PickListsService = PickListsService;
exports.PickListsService = PickListsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        translation_service_1.TranslationService])
], PickListsService);
//# sourceMappingURL=picklists.service.js.map
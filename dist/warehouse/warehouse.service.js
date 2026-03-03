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
exports.WarehouseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../shared/audit.service");
const outbox_service_1 = require("../shared/outbox.service");
const translation_service_1 = require("../i18n/translation.service");
let WarehouseService = class WarehouseService {
    constructor(prisma, auditService, outbox, t) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.outbox = outbox;
        this.t = t;
    }
    async pickItem(tenantId, userId, pickListId, itemId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const pickList = await tx.pickList.findUnique({ where: { id: pickListId }, include: { items: true } });
            if (!pickList || pickList.tenantId !== tenantId)
                throw new common_1.NotFoundException(this.t.translate('errors.warehouse.picklist_not_found', 'EN'));
            const item = pickList.items.find(i => i.id === itemId);
            if (!item)
                throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Pick List Item' }));
            if (item.status === 'PICKED')
                throw new common_1.BadRequestException('Item already picked');
            if (dto.quantity > (item.requiredQty - item.pickedQty)) {
                throw new common_1.BadRequestException(this.t.translate('errors.warehouse.quantity_exceeds_requested', 'EN'));
            }
            const updatedItem = await tx.pickListItem.update({
                where: { id: itemId },
                data: {
                    pickedQty: { increment: dto.quantity },
                    status: (item.pickedQty + dto.quantity) >= item.requiredQty ? 'PICKED' : 'PENDING',
                    binLocation: dto.binLocation
                }
            });
            const allItems = await tx.pickListItem.findMany({ where: { pickListId } });
            const allPicked = allItems.every(i => i.status === 'PICKED');
            if (allPicked) {
                await tx.pickList.update({
                    where: { id: pickListId },
                    data: { status: 'PICKED', completedAt: new Date() }
                });
            }
            await this.auditService.logAction(tenantId, userId, 'PICK_ITEM', 'PickListItem', itemId, { pickedQty: item.pickedQty }, { pickedQty: updatedItem.pickedQty }, undefined, undefined, tx);
            await this.outbox.schedule(tx, {
                tenantId,
                topic: 'item.picked',
                payload: { pickListId, itemId, quantity: dto.quantity },
            });
            return { pickListStatus: allPicked ? 'PICKED' : 'PICKING', item: updatedItem };
        });
    }
};
exports.WarehouseService = WarehouseService;
exports.WarehouseService = WarehouseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        outbox_service_1.OutboxService,
        translation_service_1.TranslationService])
], WarehouseService);
//# sourceMappingURL=warehouse.service.js.map
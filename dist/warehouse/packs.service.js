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
exports.PacksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const translation_service_1 = require("../i18n/translation.service");
let PacksService = class PacksService {
    constructor(prisma, t) {
        this.prisma = prisma;
        this.t = t;
    }
    async createPack(pickListId) {
        const pickList = await this.prisma.pickList.findUnique({
            where: { id: pickListId },
            include: {
                packs: true,
                order: true,
            },
        });
        if (!pickList) {
            throw new common_1.NotFoundException(this.t.translate('errors.warehouse.picklist_not_found', 'EN'));
        }
        if (pickList.status !== client_1.PickListStatus.PICKED) {
            throw new common_1.BadRequestException(`PickList must be in PICKED status before packing. Current status: ${pickList.status}`);
        }
        const packCount = pickList.packs.length + 1;
        const packNumber = `${packCount}`;
        return await this.prisma.pack.create({
            data: {
                pickListId,
                packNumber,
                status: client_1.PackStatus.OPEN,
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }
    async addItemToPack(packId, productId, quantity) {
        return await this.prisma.$transaction(async (tx) => {
            const pack = await tx.pack.findUnique({
                where: { id: packId },
                include: {
                    pickList: {
                        include: {
                            items: true,
                            order: true,
                        },
                    },
                },
            });
            if (!pack) {
                throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Pack' }));
            }
            if (pack.status !== client_1.PackStatus.OPEN) {
                throw new common_1.BadRequestException(this.t.translate('errors.warehouse.pack_already_sealed', 'EN'));
            }
            const pickListItem = pack.pickList.items.find((item) => item.productId === productId);
            if (!pickListItem) {
                throw new common_1.BadRequestException(`Product ${productId} is not in this PickList`);
            }
            const existingPackItem = await tx.packItem.findFirst({
                where: {
                    packId,
                    productId,
                },
            });
            if (existingPackItem) {
                await tx.packItem.update({
                    where: { id: existingPackItem.id },
                    data: {
                        quantity: existingPackItem.quantity + quantity,
                    },
                });
            }
            else {
                await tx.packItem.create({
                    data: {
                        packId,
                        productId,
                        quantity,
                    },
                });
            }
            const allPackItems = await tx.packItem.findMany({
                where: {
                    pack: {
                        pickListId: pack.pickListId,
                    },
                },
            });
            const packedQuantities = new Map();
            for (const packItem of allPackItems) {
                const current = packedQuantities.get(packItem.productId) || 0;
                packedQuantities.set(packItem.productId, current + packItem.quantity);
            }
            const allFullyPacked = pack.pickList.items.every((item) => {
                const packed = packedQuantities.get(item.productId) || 0;
                return packed >= item.pickedQty;
            });
            if (allFullyPacked) {
                await tx.pickList.update({
                    where: { id: pack.pickListId },
                    data: {
                        status: client_1.PickListStatus.PACKED,
                    },
                });
                await tx.order.update({
                    where: { id: pack.pickList.orderId },
                    data: {
                        status: client_1.OrderStatus.PROCESSING,
                    },
                });
            }
            return await tx.pack.findUnique({
                where: { id: packId },
                include: {
                    items: {
                        include: {
                            product: {
                                include: {
                                    brand: true,
                                    category: true,
                                },
                            },
                        },
                    },
                    pickList: {
                        include: {
                            items: true,
                            order: true,
                        },
                    },
                },
            });
        });
    }
    async sealPack(packId, weight) {
        const pack = await this.prisma.pack.findUnique({
            where: { id: packId },
        });
        if (!pack) {
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Pack' }));
        }
        if (pack.status === client_1.PackStatus.SEALED) {
            throw new common_1.BadRequestException(this.t.translate('errors.warehouse.pack_already_sealed', 'EN'));
        }
        return await this.prisma.pack.update({
            where: { id: packId },
            data: {
                status: client_1.PackStatus.SEALED,
                weight: weight || pack.weight,
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }
    async findByPickList(pickListId) {
        return await this.prisma.pack.findMany({
            where: { pickListId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                brand: true,
                                category: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                packNumber: 'asc',
            },
        });
    }
};
exports.PacksService = PacksService;
exports.PacksService = PacksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        translation_service_1.TranslationService])
], PacksService);
//# sourceMappingURL=packs.service.js.map
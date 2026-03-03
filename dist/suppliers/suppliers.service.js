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
exports.SuppliersService = void 0;
const common_1 = require("@nestjs/common");
const tenant_aware_prisma_service_1 = require("../prisma/tenant-aware-prisma.service");
let SuppliersService = class SuppliersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        return this.prisma.client.supplier.create({
            data: {
                tenantId: this.prisma.tenantId,
                name: dto.name,
                balance: 0,
            },
        });
    }
    async findAll() {
        return this.prisma.client.supplier.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.client.supplier.findUnique({
            where: { id },
            include: { purchaseOrders: true },
        });
    }
    async update(id, dto) {
        return this.prisma.client.supplier.update({
            where: { id },
            data: {
                name: dto.name,
            },
        });
    }
    async remove(id) {
        return this.prisma.client.supplier.delete({
            where: { id },
        });
    }
    async importPriceList(supplierId, items) {
        return this.prisma.client.$transaction(async (tx) => {
            const results = [];
            for (const item of items) {
                const entry = await tx.productSupplier.upsert({
                    where: {
                        supplierId_productId: {
                            supplierId,
                            productId: item.productId
                        }
                    },
                    update: {
                        supplierSku: item.sku,
                        costPrice: item.cost,
                        currency: item.currency || 'USD'
                    },
                    create: {
                        tenantId: this.prisma.tenantId,
                        supplierId,
                        productId: item.productId,
                        supplierSku: item.sku,
                        costPrice: item.cost,
                        currency: item.currency || 'USD'
                    }
                });
                results.push(entry);
            }
            return results;
        });
    }
    async getProductSuppliers(productId) {
        return this.prisma.client.productSupplier.findMany({
            where: { productId, tenantId: this.prisma.tenantId },
            include: { supplier: true },
            orderBy: { costPrice: 'asc' }
        });
    }
};
exports.SuppliersService = SuppliersService;
exports.SuppliersService = SuppliersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_aware_prisma_service_1.TenantAwarePrismaService])
], SuppliersService);
//# sourceMappingURL=suppliers.service.js.map
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
exports.ReceiptsService = void 0;
const common_1 = require("@nestjs/common");
const tenant_aware_prisma_service_1 = require("../prisma/tenant-aware-prisma.service");
let ReceiptsService = class ReceiptsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.client.receipt.findMany({
            include: { payment: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    findOne(id) {
        return this.prisma.client.receipt.findUnique({
            where: { id },
            include: {
                payment: {
                    include: { sale: { include: { items: { include: { product: { select: { id: true, name: true, nameAr: true, description: true, descriptionAr: true } } } } } } }
                }
            },
        });
    }
    findByPayment(paymentId) {
        return this.prisma.client.receipt.findUnique({
            where: { paymentId },
        });
    }
};
exports.ReceiptsService = ReceiptsService;
exports.ReceiptsService = ReceiptsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_aware_prisma_service_1.TenantAwarePrismaService])
], ReceiptsService);
//# sourceMappingURL=receipts.service.js.map
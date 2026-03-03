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
exports.TaxService = void 0;
const common_1 = require("@nestjs/common");
const tenant_aware_prisma_service_1 = require("../prisma/tenant-aware-prisma.service");
let TaxService = class TaxService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        return this.prisma.client.taxRate.create({
            data: {
                tenantId: this.prisma.tenantId,
                name: dto.name,
                percentage: dto.percentage,
            },
        });
    }
    async findAll() {
        return this.prisma.client.taxRate.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.client.taxRate.findUnique({
            where: { id },
        });
    }
    async update(id, dto) {
        return this.prisma.client.taxRate.update({
            where: { id },
            data: {
                name: dto.name,
                percentage: dto.percentage,
            },
        });
    }
    async remove(id) {
        return this.prisma.client.taxRate.delete({
            where: { id },
        });
    }
};
exports.TaxService = TaxService;
exports.TaxService = TaxService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_aware_prisma_service_1.TenantAwarePrismaService])
], TaxService);
//# sourceMappingURL=tax.service.js.map
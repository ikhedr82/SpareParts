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
exports.FulfillmentProvidersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FulfillmentProvidersService = class FulfillmentProvidersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, name, mode, phone, apiEndpoint) {
        return this.prisma.fulfillmentProvider.create({
            data: {
                tenantId,
                name,
                mode,
                phone,
                apiEndpoint,
            },
        });
    }
    async findAll(tenantId, mode, isActive) {
        return this.prisma.fulfillmentProvider.findMany({
            where: Object.assign(Object.assign({ tenantId }, (mode && { mode })), (isActive !== undefined && { isActive })),
            include: {
                _count: {
                    select: {
                        trips: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async activate(tenantId, providerId) {
        const provider = await this.prisma.fulfillmentProvider.findFirst({
            where: { id: providerId, tenantId },
        });
        if (!provider) {
            throw new common_1.NotFoundException('Fulfillment provider not found');
        }
        return this.prisma.fulfillmentProvider.update({
            where: { id: providerId },
            data: { isActive: true },
        });
    }
    async deactivate(tenantId, providerId) {
        const provider = await this.prisma.fulfillmentProvider.findFirst({
            where: { id: providerId, tenantId },
            include: {
                trips: {
                    where: {
                        status: {
                            in: ['PLANNED', 'LOADING', 'IN_TRANSIT'],
                        },
                    },
                },
            },
        });
        if (!provider) {
            throw new common_1.NotFoundException('Fulfillment provider not found');
        }
        if (provider.trips.length > 0) {
            throw new common_1.BadRequestException('Cannot deactivate provider with active trips');
        }
        return this.prisma.fulfillmentProvider.update({
            where: { id: providerId },
            data: { isActive: false },
        });
    }
};
exports.FulfillmentProvidersService = FulfillmentProvidersService;
exports.FulfillmentProvidersService = FulfillmentProvidersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FulfillmentProvidersService);
//# sourceMappingURL=fulfillment-providers.service.js.map
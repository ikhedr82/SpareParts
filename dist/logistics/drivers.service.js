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
exports.DriversService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DriversService = class DriversService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, branchId, name, phone) {
        const branch = await this.prisma.branch.findFirst({
            where: { id: branchId, tenantId },
        });
        if (!branch) {
            throw new common_1.NotFoundException('Branch not found');
        }
        return this.prisma.driver.create({
            data: {
                tenantId,
                branchId,
                name,
                phone,
            },
        });
    }
    async findAll(tenantId, branchId, isActive) {
        return this.prisma.driver.findMany({
            where: Object.assign(Object.assign({ tenantId }, (branchId && { branchId })), (isActive !== undefined && { isActive })),
            include: {
                branch: true,
                currentTrip: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async activate(tenantId, driverId) {
        const driver = await this.prisma.driver.findFirst({
            where: { id: driverId, tenantId },
        });
        if (!driver) {
            throw new common_1.NotFoundException('Driver not found');
        }
        return this.prisma.driver.update({
            where: { id: driverId },
            data: { isActive: true },
        });
    }
    async deactivate(tenantId, driverId) {
        const driver = await this.prisma.driver.findFirst({
            where: { id: driverId, tenantId },
        });
        if (!driver) {
            throw new common_1.NotFoundException('Driver not found');
        }
        if (driver.currentTripId) {
            throw new common_1.BadRequestException('Cannot deactivate driver with an active trip');
        }
        return this.prisma.driver.update({
            where: { id: driverId },
            data: { isActive: false },
        });
    }
};
exports.DriversService = DriversService;
exports.DriversService = DriversService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DriversService);
//# sourceMappingURL=drivers.service.js.map
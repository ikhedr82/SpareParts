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
exports.DeliveryExceptionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DeliveryExceptionsService = class DeliveryExceptionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createException(tenantId, tripStopId, exceptionType, description, reportedBy) {
        const tripStop = await this.prisma.tripStop.findFirst({
            where: { id: tripStopId },
            include: { trip: true },
        });
        if (!tripStop) {
            throw new common_1.NotFoundException('Trip stop not found');
        }
        if (tripStop.trip.tenantId !== tenantId) {
            throw new common_1.BadRequestException('Trip stop does not belong to this tenant');
        }
        return this.prisma.$transaction(async (tx) => {
            const exception = await tx.deliveryException.create({
                data: {
                    tenantId,
                    tripStopId,
                    exceptionType,
                    description,
                    reportedBy,
                    resolved: false,
                },
            });
            await tx.tripStop.update({
                where: { id: tripStopId },
                data: {
                    exceptionResolved: false,
                    failureReason: description,
                },
            });
            return exception;
        });
    }
    async resolveException(tenantId, exceptionId, resolutionType, notes, resolvedBy) {
        const exception = await this.prisma.deliveryException.findFirst({
            where: { id: exceptionId, tenantId },
            include: { tripStop: true },
        });
        if (!exception) {
            throw new common_1.NotFoundException('Exception not found');
        }
        if (exception.resolved) {
            throw new common_1.BadRequestException('Exception is already resolved');
        }
        return this.prisma.$transaction(async (tx) => {
            const updatedException = await tx.deliveryException.update({
                where: { id: exceptionId },
                data: {
                    resolved: true,
                    resolutionType,
                    resolutionNotes: notes,
                    resolvedBy,
                    resolvedAt: new Date(),
                },
            });
            const unresolvedCount = await tx.deliveryException.count({
                where: {
                    tripStopId: exception.tripStopId,
                    resolved: false,
                },
            });
            if (unresolvedCount === 0) {
                await tx.tripStop.update({
                    where: { id: exception.tripStopId },
                    data: { exceptionResolved: true },
                });
            }
            return updatedException;
        });
    }
    async findAll(tenantId, resolved, tripId) {
        return this.prisma.deliveryException.findMany({
            where: Object.assign(Object.assign({ tenantId }, (resolved !== undefined && { resolved })), (tripId && { tripStop: { tripId } })),
            include: {
                tripStop: {
                    include: {
                        order: {
                            select: { orderNumber: true },
                        },
                        customer: {
                            select: { name: true },
                        },
                    },
                },
            },
            orderBy: { reportedAt: 'desc' },
        });
    }
    async getUnresolvedCount(tenantId) {
        return this.prisma.deliveryException.count({
            where: {
                tenantId,
                resolved: false,
            },
        });
    }
};
exports.DeliveryExceptionsService = DeliveryExceptionsService;
exports.DeliveryExceptionsService = DeliveryExceptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DeliveryExceptionsService);
//# sourceMappingURL=delivery-exceptions.service.js.map
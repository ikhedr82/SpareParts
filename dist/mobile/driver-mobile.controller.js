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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverMobileController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const prisma_service_1 = require("../prisma/prisma.service");
let DriverMobileController = class DriverMobileController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRoute(req) {
        return this.prisma.deliveryTrip.findFirst({
            where: {
                tenantId: req.user.tenantId,
                driverId: req.user.id,
                status: { in: ['PLANNED', 'IN_TRANSIT'] }
            },
            include: {
                stops: {
                    orderBy: { sequence: 'asc' },
                    include: {
                        order: {
                            include: {
                                businessClient: true,
                                deliveryAddress: true
                            }
                        }
                    }
                }
            }
        });
    }
    async completeStop(req, stopId, body) {
        return this.prisma.$transaction(async (tx) => {
            const stop = await tx.tripStop.findUnique({ where: { id: stopId } });
            if (!stop)
                throw new common_1.NotFoundException('Stop not found');
            await tx.proofOfDelivery.create({
                data: {
                    tripStopId: stopId,
                    signatureUrl: body.signature,
                    photoUrl: body.photo,
                    locationLat: body.lat,
                    locationLng: body.lng,
                    notes: body.notes
                }
            });
            await tx.tripStop.update({
                where: { id: stopId },
                data: {
                    status: 'DELIVERED',
                    completedAt: new Date()
                }
            });
            if (stop.orderId) {
                await tx.order.update({
                    where: { id: stop.orderId },
                    data: { status: 'DELIVERED' }
                });
            }
            return { success: true };
        });
    }
};
exports.DriverMobileController = DriverMobileController;
__decorate([
    (0, common_1.Get)('route'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DriverMobileController.prototype, "getRoute", null);
__decorate([
    (0, common_1.Post)('stop/:id/complete'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], DriverMobileController.prototype, "completeStop", null);
exports.DriverMobileController = DriverMobileController = __decorate([
    (0, common_1.Controller)('mobile/delivery'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DriverMobileController);
//# sourceMappingURL=driver-mobile.controller.js.map
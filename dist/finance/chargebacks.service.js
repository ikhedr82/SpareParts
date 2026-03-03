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
exports.ChargebacksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ChargebacksService = class ChargebacksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async processChargeback(tenantId, orderId, amount, reason, returnId, deliveryExceptionId) {
        if (!returnId && !deliveryExceptionId) {
            throw new common_1.BadRequestException('COMMERCIAL SAFETY C1: Chargeback requires loss proof');
        }
        if (returnId && deliveryExceptionId) {
            throw new common_1.BadRequestException('COMMERCIAL SAFETY C1: Only one proof allowed');
        }
        if (returnId) {
            const returnProof = await this.prisma.return.findUnique({ where: { id: returnId } });
            if (!returnProof)
                throw new common_1.BadRequestException('Return not found');
            if (returnProof.status !== client_1.ReturnStatus.RECEIVED) {
                throw new common_1.BadRequestException('COMMERCIAL SAFETY C1: Return must be RECEIVED');
            }
        }
        if (deliveryExceptionId) {
            const exceptionProof = await this.prisma.deliveryException.findUnique({ where: { id: deliveryExceptionId } });
            if (!exceptionProof)
                throw new common_1.BadRequestException('Delivery Exception not found');
            const validTypes = [client_1.DeliveryExceptionType.LOST_IN_TRANSIT, client_1.DeliveryExceptionType.DAMAGED_IN_TRANSIT];
            if (!validTypes.includes(exceptionProof.exceptionType)) {
                throw new common_1.BadRequestException('COMMERCIAL SAFETY C1: Exception must be LOST or DAMAGED');
            }
        }
        return this.prisma.chargeback.create({
            data: {
                tenantId,
                orderId,
                amount,
                reason,
                status: client_1.ChargebackStatus.PENDING,
                returnId,
                deliveryExceptionId
            }
        });
    }
};
exports.ChargebacksService = ChargebacksService;
exports.ChargebacksService = ChargebacksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChargebacksService);
//# sourceMappingURL=chargebacks.service.js.map
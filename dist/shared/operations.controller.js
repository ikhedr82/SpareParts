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
exports.OperationsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const prisma_service_1 = require("../prisma/prisma.service");
let OperationsController = class OperationsController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStatus(req, key) {
        if (!key) {
            return { error: 'idempotencyKey query param is required' };
        }
        const tenantId = req.user.tenantId;
        const record = await this.prisma.idempotencyRecord.findUnique({
            where: {
                tenantId_idempotencyKey: { tenantId, idempotencyKey: key }
            }
        });
        if (!record || record.expiresAt < new Date()) {
            throw new common_1.NotFoundException(`No operation found for idempotency key: ${key}. Key may have expired (24h TTL).`);
        }
        if (record.statusCode === 0) {
            return { status: 'IN_FLIGHT' };
        }
        const isSuccess = record.statusCode >= 200 && record.statusCode < 300;
        return {
            status: isSuccess ? 'SUCCESS' : 'FAILURE',
            response: record.responseBody,
        };
    }
};
exports.OperationsController = OperationsController;
__decorate([
    (0, common_1.Get)('status'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('idempotencyKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "getStatus", null);
exports.OperationsController = OperationsController = __decorate([
    (0, common_1.Controller)('operations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OperationsController);
//# sourceMappingURL=operations.controller.js.map
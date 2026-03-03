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
exports.IdempotencyMiddleware = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let IdempotencyMiddleware = class IdempotencyMiddleware {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async use(req, res, next) {
        var _a, _b;
        if (!['POST', 'PATCH', 'PUT'].includes(req.method)) {
            return next();
        }
        const exempt = ['/auth/', '/api/platform/', '/api/auth/', '/operations/status'];
        if (exempt.some(prefix => req.url.startsWith(prefix))) {
            return next();
        }
        const idempotencyKey = req.headers['idempotency-key'];
        const tenantId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.tenantId) || req.tenantId;
        if (!idempotencyKey) {
            throw new common_1.BadRequestException('Idempotency-Key header is required for write operations.');
        }
        if (!tenantId) {
            return next();
        }
        try {
            const existing = await this.prisma.idempotencyRecord.findUnique({
                where: {
                    tenantId_idempotencyKey: { tenantId, idempotencyKey }
                }
            });
            if (existing) {
                if (existing.expiresAt < new Date()) {
                    await this.prisma.idempotencyRecord.delete({ where: { id: existing.id } });
                }
                else if (existing.statusCode === 0) {
                    throw new common_1.ConflictException('Request with this key is already in progress.');
                }
                else {
                    res.status(existing.statusCode).json(existing.responseBody);
                    return;
                }
            }
            await this.prisma.idempotencyRecord.create({
                data: {
                    tenantId,
                    userId: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || 'SYSTEM',
                    idempotencyKey,
                    statusCode: 0,
                    responseBody: {},
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                }
            });
            const originalJson = res.json.bind(res);
            res.json = (body) => {
                this.prisma.idempotencyRecord.update({
                    where: { tenantId_idempotencyKey: { tenantId, idempotencyKey } },
                    data: {
                        statusCode: res.statusCode,
                        responseBody: body || {},
                    }
                }).catch(err => console.error('[Idempotency] Failed to update record:', err));
                return originalJson(body);
            };
            res.on('finish', () => {
                if (res.statusCode >= 500) {
                    this.prisma.idempotencyRecord.delete({
                        where: { tenantId_idempotencyKey: { tenantId, idempotencyKey } }
                    }).catch(() => { });
                }
            });
            next();
        }
        catch (err) {
            if (err instanceof common_1.ConflictException || err instanceof common_1.BadRequestException)
                throw err;
            if (err.code === 'P2002') {
                throw new common_1.ConflictException('Request with this key is already in progress (Concurrent Hit).');
            }
            console.error('[Idempotency] Middleware error:', err);
            next();
        }
    }
};
exports.IdempotencyMiddleware = IdempotencyMiddleware;
exports.IdempotencyMiddleware = IdempotencyMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IdempotencyMiddleware);
//# sourceMappingURL=idempotency.middleware.js.map
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
exports.UsageTrackingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsageTrackingService = class UsageTrackingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async recordMetric(tenantId, metricType, value) {
        return this.prisma.usageMetric.create({
            data: {
                tenantId,
                metricType,
                value,
            },
        });
    }
    async getUsage(tenantId) {
        const [users, branches, products, orders] = await Promise.all([
            this.prisma.user.count({ where: { tenantId } }),
            this.prisma.branch.count({ where: { tenantId } }),
            this.prisma.inventory.groupBy({
                by: ['productId'],
                where: { tenantId }
            }).then(res => res.length),
            this.prisma.order.count({ where: { tenantId } }),
        ]);
        return {
            users,
            branches,
            products,
            orders,
        };
    }
    async trackAllMetrics(tenantId) {
        const usage = await this.getUsage(tenantId);
        await Promise.all([
            this.recordMetric(tenantId, 'USERS', usage.users),
            this.recordMetric(tenantId, 'BRANCHES', usage.branches),
            this.recordMetric(tenantId, 'PRODUCTS', usage.products),
            this.recordMetric(tenantId, 'ORDERS', usage.orders),
        ]);
    }
};
exports.UsageTrackingService = UsageTrackingService;
exports.UsageTrackingService = UsageTrackingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsageTrackingService);
//# sourceMappingURL=usage-tracking.service.js.map
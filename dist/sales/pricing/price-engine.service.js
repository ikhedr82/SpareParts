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
exports.PriceEngineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let PriceEngineService = class PriceEngineService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async calculatePrice(context) {
        var _a, _b;
        const { tenantId, productId, businessClientId, quantity } = context;
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: {
                inventory: {
                    where: { tenantId },
                    take: 1
                },
                category: true,
                brand: true
            }
        });
        if (!product)
            throw new Error('Product not found');
        let basePrice = Number(((_a = product.inventory[0]) === null || _a === void 0 ? void 0 : _a.sellingPrice) || 0);
        let clientTierId = null;
        if (businessClientId) {
            const client = await this.prisma.businessClient.findUnique({
                where: { id: businessClientId },
                select: { priceTierId: true }
            });
            clientTierId = client === null || client === void 0 ? void 0 : client.priceTierId;
        }
        const now = new Date();
        const whereClause = {
            tenantId,
            minQuantity: { lte: quantity },
            OR: [
                { startDate: null },
                { startDate: { lte: now } }
            ],
            AND: [
                { OR: [{ endDate: null }, { endDate: { gte: now } }] }
            ]
        };
        const rules = await this.prisma.priceRule.findMany({
            where: Object.assign(Object.assign({}, whereClause), { OR: [
                    { businessClientId },
                    { priceTierId: clientTierId },
                    { businessClientId: null, priceTierId: null }
                ], AND: [
                    {
                        OR: [
                            { productId },
                            { categoryId: product.categoryId },
                            { brandId: product.brandId },
                            { productId: null, categoryId: null, brandId: null }
                        ]
                    }
                ] }),
            orderBy: []
        });
        let bestRule = null;
        let highestScore = -1;
        for (const rule of rules) {
            let score = 0;
            if (rule.businessClientId === businessClientId)
                score += 100;
            else if (rule.priceTierId === clientTierId)
                score += 50;
            if (rule.productId === productId)
                score += 20;
            else if (rule.categoryId === product.categoryId || rule.brandId === product.brandId)
                score += 10;
            if (rule.minQuantity > 1)
                score += 1;
            if (score > highestScore) {
                highestScore = score;
                bestRule = rule;
            }
        }
        let finalPrice = basePrice;
        let appliedRuleInfo = undefined;
        if (bestRule) {
            const ruleValue = Number(bestRule.value);
            if (bestRule.type === client_1.PriceRuleType.FIXED) {
                finalPrice = ruleValue;
            }
            else if (bestRule.type === client_1.PriceRuleType.DISCOUNT) {
                finalPrice = basePrice * (1 - ruleValue / 100);
            }
            else if (bestRule.type === client_1.PriceRuleType.MARKUP) {
                const cost = Number(((_b = product.inventory[0]) === null || _b === void 0 ? void 0 : _b.costPrice) || 0);
                finalPrice = cost * (1 + ruleValue / 100);
            }
            appliedRuleInfo = {
                id: bestRule.id,
                type: bestRule.type,
                value: ruleValue,
                description: `Rule Match (Score ${highestScore})`
            };
        }
        return {
            finalPrice,
            basePrice,
            appliedRule: appliedRuleInfo
        };
    }
};
exports.PriceEngineService = PriceEngineService;
exports.PriceEngineService = PriceEngineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PriceEngineService);
//# sourceMappingURL=price-engine.service.js.map
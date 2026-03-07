import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PriceRuleType, PriceRule, Product } from '@prisma/client';

export interface PriceContext {
    tenantId: string;
    productId: string;
    businessClientId?: string;
    quantity: number;
}

export interface ResolvedPrice {
    finalPrice: number;
    basePrice: number;
    appliedRule?: {
        id: string;
        type: string;
        value: number;
        description: string;
    };
}

@Injectable()
export class PriceEngineService {
    constructor(private prisma: PrismaService) { }

    async calculatePrice(context: PriceContext): Promise<ResolvedPrice> {
        const { tenantId, productId, businessClientId, quantity } = context;

        // 1. Fetch Product & Inventory
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

        if (!product) throw new Error('Product not found');

        // Determine Base Price
        // Strategy: Selling Price from Inventory record in this Tenant
        // Default to a safeguard if missing
        let basePrice = Number(product.inventory[0]?.sellingPrice || 0);

        // 2. Fetch Client Info (for Tier)
        let clientTierId = null;
        if (businessClientId) {
            const client = await this.prisma.businessClient.findUnique({
                where: { id: businessClientId },
                select: { priceTierId: true }
            });
            clientTierId = client?.priceTierId;
        }

        // 3. Fetch Applicable Rules
        const now = new Date();

        // Helper to build queries
        const whereClause: any = {
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

        // We fetch ALL rules that theoretically *could* apply, then sort in memory or DB
        // Priority:
        // 1. Contract (Specific Client + Specific Product)
        // 2. Specific Client + Category/Brand
        // 3. Tier + Product
        // 4. Tier + Category/Brand
        // 5. Global (No Tier/Client) + Product...

        // Let's query matching rules
        const rules = await this.prisma.priceRule.findMany({
            where: {
                ...whereClause,
                OR: [
                    // Scope Matches
                    { businessClientId }, // Matches this client
                    { priceTierId: clientTierId }, // Matches this tier
                    { businessClientId: null, priceTierId: null } // Global
                ],
                AND: [
                    // Product Scope Matches
                    {
                        OR: [
                            { productId },
                            { categoryId: product.categoryId },
                            { brandId: product.brandId },
                            { productId: null, categoryId: null, brandId: null } // Store-wide?
                        ]
                    }
                ]
            },
            orderBy: [
                // Heuristic sort: Most specific first?
                // Actually, we can just fetch and sort in code to be safe.
                // But let's try to order by specificity if possible?
                // Hard to do dynamically in Prisma sort.
            ]
        });

        // 4. Scoring Logic to find BEST rule
        // We assign points for specificity:
        // +100 for Client ID match
        // +50 for Tier ID match
        // +20 for Product ID match
        // +10 for Category/Brand match
        // +1 for Quantity > 1

        let bestRule: PriceRule | null = null;
        let highestScore = -1;

        for (const rule of rules) {
            let score = 0;
            if (rule.businessClientId === businessClientId) score += 100;
            else if (rule.priceTierId === clientTierId) score += 50;

            if (rule.productId === productId) score += 20;
            else if (rule.categoryId === product.categoryId || rule.brandId === product.brandId) score += 10;

            if (rule.minQuantity > 1) score += 1;

            if (score > highestScore) {
                highestScore = score;
                bestRule = rule;
            }
        }

        // 5. Calculate Final Price
        let finalPrice = basePrice;
        let appliedRuleInfo = undefined;

        if (bestRule) {
            const ruleValue = Number(bestRule.value);
            if (bestRule.type === PriceRuleType.FIXED) {
                finalPrice = ruleValue;
            } else if (bestRule.type === PriceRuleType.DISCOUNT) {
                finalPrice = basePrice * (1 - ruleValue / 100);
            } else if (bestRule.type === PriceRuleType.MARKUP) {
                // Need Cost Price. Assume Inventory[0] has it.
                const cost = Number(product.inventory[0]?.costPrice || 0);
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
}

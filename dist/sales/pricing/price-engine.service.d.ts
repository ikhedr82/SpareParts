import { PrismaService } from '../../prisma/prisma.service';
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
export declare class PriceEngineService {
    private prisma;
    constructor(prisma: PrismaService);
    calculatePrice(context: PriceContext): Promise<ResolvedPrice>;
}

import { PrismaService } from '../prisma/prisma.service';
export declare class PortalSubstitutionsController {
    private prisma;
    constructor(prisma: PrismaService);
    getPending(req: any): Promise<({
        order: {
            orderNumber: string;
        };
        originalProduct: {
            id: string;
            name: string;
            nameAr: string | null;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            description: string | null;
            descriptionAr: string | null;
            brandId: string;
            categoryId: string;
            weight: number | null;
            dimensions: string | null;
            unitOfMeasure: string | null;
            images: string[];
            taxRateId: string | null;
        };
        substituteProduct: {
            id: string;
            name: string;
            nameAr: string | null;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            description: string | null;
            descriptionAr: string | null;
            brandId: string;
            categoryId: string;
            weight: number | null;
            dimensions: string | null;
            unitOfMeasure: string | null;
            images: string[];
            taxRateId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        tenantId: string | null;
        status: import(".prisma/client").$Enums.SubstitutionStatus;
        type: string;
        source: string;
        originalProductId: string;
        substituteProductId: string;
        confidenceScore: import("@prisma/client/runtime/library").Decimal;
        orderId: string | null;
        orderItemId: string | null;
        respondedAt: Date | null;
    })[]>;
    approve(req: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    reject(req: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}

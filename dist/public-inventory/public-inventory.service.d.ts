import { PrismaService } from '../prisma/prisma.service';
export declare class PublicInventoryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string, page?: number, limit?: number, branchId?: string, categoryId?: string, brandId?: string, search?: string): Promise<{
        items: {
            quantity: number;
            branch: {
                id: string;
                name: string;
                address: string;
            };
            product: {
                brand: {
                    id: string;
                    name: string;
                    nameAr: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    country: string | null;
                    isOem: boolean;
                };
                taxRate: {
                    id: string;
                    name: string;
                    nameAr: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    tenantId: string;
                    percentage: import("@prisma/client/runtime/library").Decimal;
                };
                category: {
                    id: string;
                    name: string;
                    nameAr: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    parentId: string | null;
                };
            } & {
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            version: number;
            branchId: string;
            productId: string;
            allocated: number;
            costPrice: import("@prisma/client/runtime/library").Decimal;
            sellingPrice: import("@prisma/client/runtime/library").Decimal;
            barcode: string | null;
            binLocation: string | null;
            lastCountedAt: Date | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findByProduct(tenantId: string, productId: string): Promise<{
        product: {
            brand: {
                id: string;
                name: string;
                nameAr: string | null;
                createdAt: Date;
                updatedAt: Date;
                country: string | null;
                isOem: boolean;
            };
            taxRate: {
                id: string;
                name: string;
                nameAr: string | null;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                percentage: import("@prisma/client/runtime/library").Decimal;
            };
            category: {
                id: string;
                name: string;
                nameAr: string | null;
                createdAt: Date;
                updatedAt: Date;
                parentId: string | null;
            };
            alternateNumbers: {
                id: string;
                createdAt: Date;
                productId: string;
                notes: string | null;
                partNumber: string;
                manufacturer: string | null;
                isSuperseded: boolean;
            }[];
        } & {
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
        totalAvailable: number;
        availability: {
            branchId: string;
            branchName: string;
            quantity: number;
            price: number;
        }[];
    }>;
    search(tenantId: string, query: string, limit?: number): Promise<({
        branch: {
            id: string;
            name: string;
        };
        product: {
            brand: {
                id: string;
                name: string;
                nameAr: string | null;
                createdAt: Date;
                updatedAt: Date;
                country: string | null;
                isOem: boolean;
            };
            category: {
                id: string;
                name: string;
                nameAr: string | null;
                createdAt: Date;
                updatedAt: Date;
                parentId: string | null;
            };
        } & {
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
        updatedAt: Date;
        tenantId: string;
        version: number;
        branchId: string;
        productId: string;
        quantity: number;
        allocated: number;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        sellingPrice: import("@prisma/client/runtime/library").Decimal;
        barcode: string | null;
        binLocation: string | null;
        lastCountedAt: Date | null;
    })[]>;
    getCategories(tenantId: string): Promise<({
        _count: {
            products: number;
        };
    } & {
        id: string;
        name: string;
        nameAr: string | null;
        createdAt: Date;
        updatedAt: Date;
        parentId: string | null;
    })[]>;
    getBrands(tenantId: string): Promise<({
        _count: {
            products: number;
        };
    } & {
        id: string;
        name: string;
        nameAr: string | null;
        createdAt: Date;
        updatedAt: Date;
        country: string | null;
        isOem: boolean;
    })[]>;
}

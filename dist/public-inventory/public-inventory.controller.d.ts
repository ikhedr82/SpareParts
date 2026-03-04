import { PublicInventoryService } from './public-inventory.service';
export declare class PublicInventoryController {
    private readonly publicInventoryService;
    constructor(publicInventoryService: PublicInventoryService);
    findAll(tenantId: string, page?: string, limit?: string, branchId?: string, categoryId?: string, brandId?: string, search?: string): Promise<{
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
                    createdAt: Date;
                    updatedAt: Date;
                    nameAr: string | null;
                    country: string | null;
                    isOem: boolean;
                };
                taxRate: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    nameAr: string | null;
                    tenantId: string;
                    percentage: import("@prisma/client/runtime/library").Decimal;
                };
                category: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    nameAr: string | null;
                    parentId: string | null;
                };
            } & {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                nameAr: string | null;
                status: string;
                description: string | null;
                descriptionAr: string | null;
                brandId: string;
                categoryId: string;
                weight: number | null;
                dimensions: string | null;
                taxRateId: string | null;
                images: string[];
                unitOfMeasure: string | null;
            };
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            version: number;
            branchId: string;
            productId: string;
            sellingPrice: import("@prisma/client/runtime/library").Decimal;
            barcode: string | null;
            costPrice: import("@prisma/client/runtime/library").Decimal;
            binLocation: string | null;
            lastCountedAt: Date | null;
            allocated: number;
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
                createdAt: Date;
                updatedAt: Date;
                nameAr: string | null;
                country: string | null;
                isOem: boolean;
            };
            taxRate: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                nameAr: string | null;
                tenantId: string;
                percentage: import("@prisma/client/runtime/library").Decimal;
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
            category: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                nameAr: string | null;
                parentId: string | null;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            nameAr: string | null;
            status: string;
            description: string | null;
            descriptionAr: string | null;
            brandId: string;
            categoryId: string;
            weight: number | null;
            dimensions: string | null;
            taxRateId: string | null;
            images: string[];
            unitOfMeasure: string | null;
        };
        totalAvailable: number;
        availability: {
            branchId: string;
            branchName: string;
            quantity: number;
            price: number;
        }[];
    }>;
    search(tenantId: string, query: string, limit?: string): Promise<({
        branch: {
            id: string;
            name: string;
        };
        product: {
            brand: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                nameAr: string | null;
                country: string | null;
                isOem: boolean;
            };
            category: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                nameAr: string | null;
                parentId: string | null;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            nameAr: string | null;
            status: string;
            description: string | null;
            descriptionAr: string | null;
            brandId: string;
            categoryId: string;
            weight: number | null;
            dimensions: string | null;
            taxRateId: string | null;
            images: string[];
            unitOfMeasure: string | null;
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
        sellingPrice: import("@prisma/client/runtime/library").Decimal;
        barcode: string | null;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        binLocation: string | null;
        lastCountedAt: Date | null;
        allocated: number;
    })[]>;
    getCategories(tenantId: string): Promise<({
        _count: {
            products: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        parentId: string | null;
    })[]>;
    getBrands(tenantId: string): Promise<({
        _count: {
            products: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        country: string | null;
        isOem: boolean;
    })[]>;
}

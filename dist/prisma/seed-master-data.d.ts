import { PrismaClient } from '@prisma/client';
export declare const automotiveBrands: {
    name: string;
    country: string;
    isOem: boolean;
}[];
export declare const productCategoriesHierarchy: {
    name: string;
    parentName: string;
}[];
export declare const automotiveProducts: {
    brandName: string;
    categoryName: string;
    name: string;
    description: string;
    weight: number;
    dimensions: string;
}[];
export declare const taxRatesData: {
    name: string;
    percentage: number;
}[];
export declare const suppliersData: {
    name: string;
    balance: number;
}[];
export declare const customersData: {
    name: string;
    phone: string;
    email: string;
    balance: number;
}[];
export declare function seedMasterData(prisma: PrismaClient, tenantId: string, branchId: string): Promise<void>;

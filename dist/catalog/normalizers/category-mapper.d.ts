import { PrismaClient } from '@prisma/client';
export declare function mapCategory(manufacturerCategory: string): string;
export declare function getOrCreateCategory(prisma: PrismaClient, categoryName: string): Promise<{
    id: string;
    name: string;
}>;
export declare function getExistingCategories(prisma: PrismaClient): Promise<Map<string, string>>;

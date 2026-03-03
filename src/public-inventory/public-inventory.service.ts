import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicInventoryService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(
        tenantId: string,
        page: number = 1,
        limit: number = 20,
        branchId?: string,
        categoryId?: string,
        brandId?: string,
        search?: string,
    ) {
        const skip = (page - 1) * limit;
        const where: any = {
            tenantId,
            quantity: { gt: 0 }, // Initial filter
        };

        if (branchId) {
            where.branchId = branchId;
        }

        if (categoryId) {
            where.product = { ...where.product, categoryId };
        }

        if (brandId) {
            where.product = { ...where.product, brandId };
        }

        if (search) {
            where.product = {
                ...where.product,
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            };
        }

        // Note: Strict pagination with "available > 0" is hard without raw query or computed column.
        // We fetch standard page, then filter. This might result in < limit items per page.
        // For commercial safety, this is better than showing allocated stock.

        const [items, total] = await this.prisma.$transaction([
            this.prisma.inventory.findMany({
                where,
                include: {
                    product: {
                        include: {
                            brand: true,
                            category: true,
                            taxRate: true,
                        },
                    },
                    branch: {
                        select: {
                            id: true,
                            name: true,
                            address: true,
                        },
                    },
                },
                orderBy: [
                    { product: { name: 'asc' } },
                ],
                skip,
                take: limit,
            }),
            this.prisma.inventory.count({ where }),
        ]);

        const availableItems = items
            .map(item => ({
                ...item,
                quantity: item.quantity - item.allocated, // Expose only available
            }))
            .filter(item => item.quantity > 0);

        return {
            items: availableItems,
            pagination: {
                page,
                limit,
                total: total, // Approximate total (includes allocated-only items)
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findByProduct(tenantId: string, productId: string) {
        // Get all branches that have this product in stock
        const rawInventory = await this.prisma.inventory.findMany({
            where: {
                tenantId,
                productId,
                quantity: { gt: 0 },
            },
            include: {
                product: {
                    include: {
                        brand: true,
                        category: true,
                        taxRate: true,
                        alternateNumbers: true,
                    },
                },
                branch: true,
            },
        });

        const inventory = rawInventory
            .map(item => ({
                ...item,
                quantity: item.quantity - item.allocated,
            }))
            .filter(item => item.quantity > 0);

        if (!inventory.length) {
            return null;
        }

        // Calculate total available quantity across all branches
        const totalAvailable = inventory.reduce((sum, item) => sum + item.quantity, 0);

        return {
            product: inventory[0].product,
            totalAvailable,
            availability: inventory.map((item) => ({
                branchId: item.branchId,
                branchName: item.branch?.name || '',
                quantity: item.quantity,
                price: Number(item.sellingPrice),
            })),
        };
    }

    async search(tenantId: string, query: string, limit: number = 20) {
        const products = await this.prisma.inventory.findMany({
            where: {
                tenantId,
                quantity: { gt: 0 },
                OR: [
                    { product: { name: { contains: query, mode: 'insensitive' } } },
                    { product: { description: { contains: query, mode: 'insensitive' } } },
                    { product: { alternateNumbers: { some: { partNumber: { contains: query, mode: 'insensitive' } } } } },
                ],
            },
            include: {
                product: {
                    include: {
                        brand: true,
                        category: true,
                    },
                },
                branch: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            take: limit,
            distinct: ['productId'],
        });

        return products;
    }

    async getCategories(tenantId: string) {
        // Get categories that have products in stock
        const categories = await this.prisma.productCategory.findMany({
            where: {
                products: {
                    some: {
                        inventory: {
                            some: {
                                tenantId,
                                quantity: { gt: 0 },
                            },
                        },
                    },
                },
            },
            include: {
                _count: {
                    select: {
                        products: {
                            where: {
                                inventory: {
                                    some: {
                                        tenantId,
                                        quantity: { gt: 0 },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        return categories;
    }

    async getBrands(tenantId: string) {
        // Get brands that have products in stock
        const brands = await this.prisma.brand.findMany({
            where: {
                products: {
                    some: {
                        inventory: {
                            some: {
                                tenantId,
                                quantity: { gt: 0 },
                            },
                        },
                    },
                },
            },
            include: {
                _count: {
                    select: {
                        products: {
                            where: {
                                inventory: {
                                    some: {
                                        tenantId,
                                        quantity: { gt: 0 },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        return brands;
    }
}

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
exports.PublicInventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PublicInventoryService = class PublicInventoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId, page = 1, limit = 20, branchId, categoryId, brandId, search) {
        const skip = (page - 1) * limit;
        const where = {
            tenantId,
            quantity: { gt: 0 },
        };
        if (branchId) {
            where.branchId = branchId;
        }
        if (categoryId) {
            where.product = Object.assign(Object.assign({}, where.product), { categoryId });
        }
        if (brandId) {
            where.product = Object.assign(Object.assign({}, where.product), { brandId });
        }
        if (search) {
            where.product = Object.assign(Object.assign({}, where.product), { OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ] });
        }
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
            .map(item => (Object.assign(Object.assign({}, item), { quantity: item.quantity - item.allocated })))
            .filter(item => item.quantity > 0);
        return {
            items: availableItems,
            pagination: {
                page,
                limit,
                total: total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findByProduct(tenantId, productId) {
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
            .map(item => (Object.assign(Object.assign({}, item), { quantity: item.quantity - item.allocated })))
            .filter(item => item.quantity > 0);
        if (!inventory.length) {
            return null;
        }
        const totalAvailable = inventory.reduce((sum, item) => sum + item.quantity, 0);
        return {
            product: inventory[0].product,
            totalAvailable,
            availability: inventory.map((item) => {
                var _a;
                return ({
                    branchId: item.branchId,
                    branchName: ((_a = item.branch) === null || _a === void 0 ? void 0 : _a.name) || '',
                    quantity: item.quantity,
                    price: Number(item.sellingPrice),
                });
            }),
        };
    }
    async search(tenantId, query, limit = 20) {
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
    async getCategories(tenantId) {
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
    async getBrands(tenantId) {
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
};
exports.PublicInventoryService = PublicInventoryService;
exports.PublicInventoryService = PublicInventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublicInventoryService);
//# sourceMappingURL=public-inventory.service.js.map
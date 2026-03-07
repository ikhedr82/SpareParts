import { Controller, Get, Param, Query } from '@nestjs/common';
import { PublicInventoryService } from './public-inventory.service';

@Controller('public/inventory')
export class PublicInventoryController {
    constructor(private readonly publicInventoryService: PublicInventoryService) { }

    @Get(':tenantId')
    findAll(
        @Param('tenantId') tenantId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('branchId') branchId?: string,
        @Query('categoryId') categoryId?: string,
        @Query('brandId') brandId?: string,
        @Query('search') search?: string,
    ) {
        return this.publicInventoryService.findAll(
            tenantId,
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
            branchId,
            categoryId,
            brandId,
            search,
        );
    }

    @Get(':tenantId/product/:productId')
    findByProduct(
        @Param('tenantId') tenantId: string,
        @Param('productId') productId: string,
    ) {
        return this.publicInventoryService.findByProduct(tenantId, productId);
    }

    @Get(':tenantId/search')
    search(
        @Param('tenantId') tenantId: string,
        @Query('q') query: string,
        @Query('limit') limit?: string,
    ) {
        return this.publicInventoryService.search(
            tenantId,
            query,
            limit ? parseInt(limit, 10) : 20,
        );
    }

    @Get(':tenantId/categories')
    getCategories(@Param('tenantId') tenantId: string) {
        return this.publicInventoryService.getCategories(tenantId);
    }

    @Get(':tenantId/brands')
    getBrands(@Param('tenantId') tenantId: string) {
        return this.publicInventoryService.getBrands(tenantId);
    }
}

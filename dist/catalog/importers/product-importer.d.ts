import { PrismaClient } from '@prisma/client';
import { NormalizedProduct } from '../normalizers/product-normalizer';
import { PlanEnforcementService } from '../../tenant-admin/plan-enforcement.service';
export declare class ProductImporter {
    private prisma;
    private deduplicator;
    private planEnforcement;
    constructor(prisma: PrismaClient, planEnforcement: PlanEnforcementService);
    importProducts(tenantId: string, products: NormalizedProduct[], dataSourceName: string): Promise<{
        imported: number;
        skipped: number;
        updated: number;
        errors: string[];
    }>;
    private getOrCreateBrand;
    private getOrCreateDataSource;
    private createAlternatePartNumbers;
    private createFitments;
    private getOrCreateVehicleMake;
    private getOrCreateVehicleModel;
}

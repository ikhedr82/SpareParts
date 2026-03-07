import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TaxModule } from '../taxes/tax.module';
import { CustomersModule } from '../customers/customers.module';
import { InventoryModule } from '../inventory/inventory.module';
import { AccountingModule } from '../accounting/accounting.module';
import { PriceEngineService } from './pricing/price-engine.service';
import { QuotationsService } from './quotes/quotations.service';
import { TenantAdminModule } from '../tenant-admin/tenant-admin.module';

@Module({
    imports: [PrismaModule, InventoryModule, TaxModule, CustomersModule, AccountingModule, TenantAdminModule],
    controllers: [SalesController],
    providers: [SalesService, PriceEngineService, QuotationsService],
    exports: [SalesService, PriceEngineService, QuotationsService],
})
export class SalesModule { }

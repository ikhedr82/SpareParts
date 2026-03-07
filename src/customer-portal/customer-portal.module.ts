import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { OrdersModule } from '../orders/orders.module'; // Import to use OrdersService
import { WarehouseModule } from '../warehouse/warehouse.module'; // for InventorySafetyService
import { PortalOrdersController } from './portal-orders.controller';
import { PortalInventoryController } from './portal-inventory.controller';
import { PortalFinancialsController } from './portal-financials.controller';
import { PortalSubstitutionsController } from './portal-substitutions.controller';

@Module({
    imports: [
        PrismaModule,
        OrdersModule,
        WarehouseModule
    ],
    controllers: [
        PortalOrdersController,
        PortalInventoryController,
        PortalFinancialsController,
        PortalSubstitutionsController
    ],
    providers: [
        // Guards are usually globally provided or used with UseGuards
    ]
})
export class CustomerPortalModule { }

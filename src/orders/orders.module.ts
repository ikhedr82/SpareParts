import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PartialFulfillmentService } from './partial-fulfillment.service';
import { PartialFulfillmentController } from './partial-fulfillment.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { WarehouseModule } from '../warehouse/warehouse.module';
import { SharedModule } from '../shared/shared.module';

@Module({
    imports: [PrismaModule, WarehouseModule, SharedModule],
    controllers: [OrdersController, PartialFulfillmentController],
    providers: [OrdersService, PartialFulfillmentService],
    exports: [OrdersService, PartialFulfillmentService],
})
export class OrdersModule { }

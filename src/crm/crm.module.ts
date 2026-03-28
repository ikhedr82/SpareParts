import { Module } from '@nestjs/common';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BusinessClientsModule } from '../business-clients/business-clients.module';
import { OrdersModule } from '../orders/orders.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { PaymentsModule } from '../payment/payment.module';

@Module({
  imports: [
    PrismaModule,
    BusinessClientsModule,
    OrdersModule,
    InvoicesModule,
    PaymentsModule,
  ],
  controllers: [CrmController],
  providers: [CrmService],
  exports: [CrmService],
})
export class CrmModule {}

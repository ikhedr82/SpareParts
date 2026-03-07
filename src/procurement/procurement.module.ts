import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SharedModule } from '../shared/shared.module';
import { SupplierInvoiceService } from './supplier-invoice.service';
import { SupplierInvoiceController } from './supplier-invoice.controller';

@Module({
    imports: [PrismaModule, SharedModule],
    controllers: [SupplierInvoiceController],
    providers: [SupplierInvoiceService],
    exports: [SupplierInvoiceService],
})
export class ProcurementModule { }

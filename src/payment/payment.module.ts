import { Module } from '@nestjs/common';
import { PaymentsService } from './payment.service';
import { PaymentsController } from './payment.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AccountingModule } from '../accounting/accounting.module';

@Module({
    imports: [PrismaModule, AccountingModule],
    controllers: [PaymentsController],
    providers: [PaymentsService],
})
export class PaymentsModule { }

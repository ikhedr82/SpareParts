import { Module } from '@nestjs/common';
import { ChargebacksService } from './chargebacks.service';
import { ChargebackResolutionService } from './chargeback-resolution.service';
import { ChargebackResolutionController } from './chargeback-resolution.controller';
import { TaxFilingService } from './tax-filing.service';
import { TaxFilingController } from './tax-filing.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SharedModule } from '../shared/shared.module';

@Module({
    imports: [PrismaModule, SharedModule],
    controllers: [ChargebackResolutionController, TaxFilingController],
    providers: [ChargebacksService, ChargebackResolutionService, TaxFilingService],
    exports: [ChargebacksService, ChargebackResolutionService, TaxFilingService],
})
export class FinanceModule { }

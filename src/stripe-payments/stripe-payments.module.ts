import { Module } from '@nestjs/common';
import { StripePaymentsService } from './stripe-payments.service';
import { StripePaymentsController } from './stripe-payments.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [StripePaymentsController],
    providers: [StripePaymentsService],
    exports: [StripePaymentsService],
})
export class StripePaymentsModule { }


import { Module } from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { AccountingController } from './accounting.controller';
import { AuditService } from './audit.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [AccountingController],
    providers: [AccountingService, AuditService],
    exports: [AccountingService, AuditService],
})
export class AccountingModule { }


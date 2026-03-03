import { Module } from '@nestjs/common';
import { AccountingReportsService } from './accounting-reports.service';
import { AccountingReportsController } from './accounting-reports.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AccountingModule } from '../accounting.module';

@Module({
    imports: [PrismaModule, AccountingModule],
    controllers: [AccountingReportsController],
    providers: [AccountingReportsService],
    exports: [AccountingReportsService],
})
export class AccountingReportsModule { }

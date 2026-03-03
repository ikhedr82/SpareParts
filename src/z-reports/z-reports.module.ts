import { Module } from '@nestjs/common';
import { ZReportsService } from './z-reports.service';
import { ZReportsController } from './z-reports.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ZReportsController],
    providers: [ZReportsService],
})
export class ZReportsModule { }

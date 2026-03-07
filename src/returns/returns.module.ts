import { Module } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { ReturnsController } from './returns.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { WarehouseModule } from '../warehouse/warehouse.module';

@Module({
    imports: [PrismaModule, WarehouseModule],
    controllers: [ReturnsController],
    providers: [ReturnsService],
})
export class ReturnsModule { }

import { Module } from '@nestjs/common';
import { WarehouseMobileController } from './warehouse-mobile.controller';
import { DriverMobileController } from './driver-mobile.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [WarehouseMobileController, DriverMobileController],
})
export class MobileModule { }

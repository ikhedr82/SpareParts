import { Module } from '@nestjs/common';
import { PublicInventoryService } from './public-inventory.service';
import { PublicInventoryController } from './public-inventory.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [PublicInventoryController],
    providers: [PublicInventoryService],
    exports: [PublicInventoryService],
})
export class PublicInventoryModule { }

import { Module } from '@nestjs/common';
import { BusinessClientsService } from './business-clients.service';
import { BusinessClientsController } from './business-clients.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [BusinessClientsController],
    providers: [BusinessClientsService],
    exports: [BusinessClientsService],
})
export class BusinessClientsModule { }

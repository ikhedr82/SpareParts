import { Module } from '@nestjs/common';
import { CashSessionService } from './cash-session.service';
import { CashSessionController } from './cash-session.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [CashSessionController],
    providers: [CashSessionService],
    exports: [CashSessionService],
})
export class CashSessionModule { }

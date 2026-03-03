import { Module, Global } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthGuard } from './auth.guard';
import { AuditService } from './audit.service';
import { EventBus } from './event-bus.service';
import { OutboxService } from './outbox.service';
import { OutboxProcessor } from './outbox.processor';
import { OperationsController } from './operations.controller';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Global()
@Module({
    imports: [PrismaModule, EventEmitterModule.forRoot()],
    controllers: [OperationsController],
    providers: [
        AuditService,
        EventBus,
        OutboxService,
        OutboxProcessor,
    ],
    exports: [AuditService, EventBus, OutboxService],
})
export class SharedModule { }

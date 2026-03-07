import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SharedModule } from '../shared/shared.module';
import { UserOffboardingService } from './user-offboarding.service';
import { UserOffboardingController } from './user-offboarding.controller';

@Module({
    imports: [PrismaModule, SharedModule],
    controllers: [UserOffboardingController],
    providers: [UserOffboardingService],
    exports: [UserOffboardingService],
})
export class AdminModule { }

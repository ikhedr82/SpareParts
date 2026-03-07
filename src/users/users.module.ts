import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TenantAdminModule } from '../tenant-admin/tenant-admin.module';

@Module({
    imports: [PrismaModule, TenantAdminModule],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }

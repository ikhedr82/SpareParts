import { Module } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { BranchesController } from './branches.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TenantAdminModule } from '../tenant-admin/tenant-admin.module';

@Module({
    imports: [PrismaModule, TenantAdminModule],
    controllers: [BranchesController],
    providers: [BranchesService],
    exports: [BranchesService],
})
export class BranchesModule { }

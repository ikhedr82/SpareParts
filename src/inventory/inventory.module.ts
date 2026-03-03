import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryLedgerService } from './inventory-ledger.service';
import { InventoryController } from './inventory.controller';
import { BranchTransferService } from './branch-transfer.service';
import { BranchTransferController } from './branch-transfer.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SharedModule } from '../shared/shared.module';
import { TenantAdminModule } from '../tenant-admin/tenant-admin.module';

@Module({
    imports: [PrismaModule, SharedModule, TenantAdminModule],
    controllers: [InventoryController, BranchTransferController],
    providers: [InventoryService, InventoryLedgerService, BranchTransferService],
    exports: [InventoryService, InventoryLedgerService, BranchTransferService],
})
export class InventoryModule { }

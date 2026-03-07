import { Module } from '@nestjs/common';
import { LogisticsController } from './logistics.controller';
import { LogisticsService } from './logistics.service';
import { ReturnToWarehouseService } from './rtw.service';
import { ReturnToWarehouseController, RtwListController } from './rtw.controller';
import { ManifestService } from './manifest.service';
import { ManifestController } from './manifest.controller';
import { SharedModule } from '../shared/shared.module';
import { WarehouseModule } from '../warehouse/warehouse.module';
import { TenantAdminModule } from '../tenant-admin/tenant-admin.module';

@Module({
    imports: [SharedModule, WarehouseModule, TenantAdminModule],
    controllers: [LogisticsController, ReturnToWarehouseController, RtwListController, ManifestController],
    providers: [LogisticsService, ReturnToWarehouseService, ManifestService],
    exports: [LogisticsService, ReturnToWarehouseService, ManifestService],
})
export class LogisticsModule { }

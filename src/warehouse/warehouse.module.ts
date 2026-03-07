import { Module } from '@nestjs/common';
import { WarehouseController } from './warehouse.controller';
import { WarehouseService } from './warehouse.service';
import { PickListsService } from './picklists.service';
import { InventorySafetyService } from './inventory-safety.service';
import { PacksService } from './packs.service';
import { SubstitutionService } from './substitution.service';
import { SubstitutionController } from './substitution.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
    imports: [SharedModule],
    controllers: [WarehouseController, SubstitutionController],
    providers: [
        WarehouseService,
        PickListsService,
        InventorySafetyService,
        PacksService,
        SubstitutionService,
    ],
    exports: [
        WarehouseService,
        PickListsService,
        InventorySafetyService,
        PacksService,
        SubstitutionService,
    ],
})
export class WarehouseModule { }

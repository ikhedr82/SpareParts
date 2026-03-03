"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehouseModule = void 0;
const common_1 = require("@nestjs/common");
const warehouse_controller_1 = require("./warehouse.controller");
const warehouse_service_1 = require("./warehouse.service");
const picklists_service_1 = require("./picklists.service");
const inventory_safety_service_1 = require("./inventory-safety.service");
const packs_service_1 = require("./packs.service");
const substitution_service_1 = require("./substitution.service");
const substitution_controller_1 = require("./substitution.controller");
const shared_module_1 = require("../shared/shared.module");
let WarehouseModule = class WarehouseModule {
};
exports.WarehouseModule = WarehouseModule;
exports.WarehouseModule = WarehouseModule = __decorate([
    (0, common_1.Module)({
        imports: [shared_module_1.SharedModule],
        controllers: [warehouse_controller_1.WarehouseController, substitution_controller_1.SubstitutionController],
        providers: [
            warehouse_service_1.WarehouseService,
            picklists_service_1.PickListsService,
            inventory_safety_service_1.InventorySafetyService,
            packs_service_1.PacksService,
            substitution_service_1.SubstitutionService,
        ],
        exports: [
            warehouse_service_1.WarehouseService,
            picklists_service_1.PickListsService,
            inventory_safety_service_1.InventorySafetyService,
            packs_service_1.PacksService,
            substitution_service_1.SubstitutionService,
        ],
    })
], WarehouseModule);
//# sourceMappingURL=warehouse.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogisticsModule = void 0;
const common_1 = require("@nestjs/common");
const logistics_controller_1 = require("./logistics.controller");
const logistics_service_1 = require("./logistics.service");
const rtw_service_1 = require("./rtw.service");
const rtw_controller_1 = require("./rtw.controller");
const manifest_service_1 = require("./manifest.service");
const manifest_controller_1 = require("./manifest.controller");
const shared_module_1 = require("../shared/shared.module");
const warehouse_module_1 = require("../warehouse/warehouse.module");
const tenant_admin_module_1 = require("../tenant-admin/tenant-admin.module");
let LogisticsModule = class LogisticsModule {
};
exports.LogisticsModule = LogisticsModule;
exports.LogisticsModule = LogisticsModule = __decorate([
    (0, common_1.Module)({
        imports: [shared_module_1.SharedModule, warehouse_module_1.WarehouseModule, tenant_admin_module_1.TenantAdminModule],
        controllers: [logistics_controller_1.LogisticsController, rtw_controller_1.ReturnToWarehouseController, rtw_controller_1.RtwListController, manifest_controller_1.ManifestController],
        providers: [logistics_service_1.LogisticsService, rtw_service_1.ReturnToWarehouseService, manifest_service_1.ManifestService],
        exports: [logistics_service_1.LogisticsService, rtw_service_1.ReturnToWarehouseService, manifest_service_1.ManifestService],
    })
], LogisticsModule);
//# sourceMappingURL=logistics.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryModule = void 0;
const common_1 = require("@nestjs/common");
const inventory_service_1 = require("./inventory.service");
const inventory_ledger_service_1 = require("./inventory-ledger.service");
const inventory_controller_1 = require("./inventory.controller");
const branch_transfer_service_1 = require("./branch-transfer.service");
const branch_transfer_controller_1 = require("./branch-transfer.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const shared_module_1 = require("../shared/shared.module");
const tenant_admin_module_1 = require("../tenant-admin/tenant-admin.module");
let InventoryModule = class InventoryModule {
};
exports.InventoryModule = InventoryModule;
exports.InventoryModule = InventoryModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, shared_module_1.SharedModule, tenant_admin_module_1.TenantAdminModule],
        controllers: [inventory_controller_1.InventoryController, branch_transfer_controller_1.BranchTransferController],
        providers: [inventory_service_1.InventoryService, inventory_ledger_service_1.InventoryLedgerService, branch_transfer_service_1.BranchTransferService],
        exports: [inventory_service_1.InventoryService, inventory_ledger_service_1.InventoryLedgerService, branch_transfer_service_1.BranchTransferService],
    })
], InventoryModule);
//# sourceMappingURL=inventory.module.js.map
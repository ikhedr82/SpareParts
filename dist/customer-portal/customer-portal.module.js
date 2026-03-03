"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerPortalModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const orders_module_1 = require("../orders/orders.module");
const warehouse_module_1 = require("../warehouse/warehouse.module");
const portal_orders_controller_1 = require("./portal-orders.controller");
const portal_inventory_controller_1 = require("./portal-inventory.controller");
const portal_financials_controller_1 = require("./portal-financials.controller");
const portal_substitutions_controller_1 = require("./portal-substitutions.controller");
let CustomerPortalModule = class CustomerPortalModule {
};
exports.CustomerPortalModule = CustomerPortalModule;
exports.CustomerPortalModule = CustomerPortalModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            orders_module_1.OrdersModule,
            warehouse_module_1.WarehouseModule
        ],
        controllers: [
            portal_orders_controller_1.PortalOrdersController,
            portal_inventory_controller_1.PortalInventoryController,
            portal_financials_controller_1.PortalFinancialsController,
            portal_substitutions_controller_1.PortalSubstitutionsController
        ],
        providers: []
    })
], CustomerPortalModule);
//# sourceMappingURL=customer-portal.module.js.map
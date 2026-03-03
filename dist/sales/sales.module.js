"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesModule = void 0;
const common_1 = require("@nestjs/common");
const sales_service_1 = require("./sales.service");
const sales_controller_1 = require("./sales.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const tax_module_1 = require("../taxes/tax.module");
const customers_module_1 = require("../customers/customers.module");
const inventory_module_1 = require("../inventory/inventory.module");
const accounting_module_1 = require("../accounting/accounting.module");
const price_engine_service_1 = require("./pricing/price-engine.service");
const quotations_service_1 = require("./quotes/quotations.service");
const tenant_admin_module_1 = require("../tenant-admin/tenant-admin.module");
let SalesModule = class SalesModule {
};
exports.SalesModule = SalesModule;
exports.SalesModule = SalesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, inventory_module_1.InventoryModule, tax_module_1.TaxModule, customers_module_1.CustomersModule, accounting_module_1.AccountingModule, tenant_admin_module_1.TenantAdminModule],
        controllers: [sales_controller_1.SalesController],
        providers: [sales_service_1.SalesService, price_engine_service_1.PriceEngineService, quotations_service_1.QuotationsService],
        exports: [sales_service_1.SalesService, price_engine_service_1.PriceEngineService, quotations_service_1.QuotationsService],
    })
], SalesModule);
//# sourceMappingURL=sales.module.js.map
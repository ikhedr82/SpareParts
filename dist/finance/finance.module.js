"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceModule = void 0;
const common_1 = require("@nestjs/common");
const chargebacks_service_1 = require("./chargebacks.service");
const chargeback_resolution_service_1 = require("./chargeback-resolution.service");
const chargeback_resolution_controller_1 = require("./chargeback-resolution.controller");
const tax_filing_service_1 = require("./tax-filing.service");
const tax_filing_controller_1 = require("./tax-filing.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const shared_module_1 = require("../shared/shared.module");
let FinanceModule = class FinanceModule {
};
exports.FinanceModule = FinanceModule;
exports.FinanceModule = FinanceModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, shared_module_1.SharedModule],
        controllers: [chargeback_resolution_controller_1.ChargebackResolutionController, tax_filing_controller_1.TaxFilingController],
        providers: [chargebacks_service_1.ChargebacksService, chargeback_resolution_service_1.ChargebackResolutionService, tax_filing_service_1.TaxFilingService],
        exports: [chargebacks_service_1.ChargebacksService, chargeback_resolution_service_1.ChargebackResolutionService, tax_filing_service_1.TaxFilingService],
    })
], FinanceModule);
//# sourceMappingURL=finance.module.js.map
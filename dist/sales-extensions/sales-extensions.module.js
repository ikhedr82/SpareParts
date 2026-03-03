"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesExtensionsModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const sales_extensions_controller_1 = require("./sales-extensions.controller");
const sales_extensions_service_1 = require("./sales-extensions.service");
const quote_service_1 = require("./quote.service");
let SalesExtensionsModule = class SalesExtensionsModule {
};
exports.SalesExtensionsModule = SalesExtensionsModule;
exports.SalesExtensionsModule = SalesExtensionsModule = __decorate([
    (0, common_1.Module)({
        imports: [schedule_1.ScheduleModule.forRoot()],
        controllers: [sales_extensions_controller_1.SalesExtensionsController],
        providers: [sales_extensions_service_1.SalesExtensionsService, quote_service_1.QuoteService],
    })
], SalesExtensionsModule);
//# sourceMappingURL=sales-extensions.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashSessionModule = void 0;
const common_1 = require("@nestjs/common");
const cash_session_service_1 = require("./cash-session.service");
const cash_session_controller_1 = require("./cash-session.controller");
const prisma_module_1 = require("../prisma/prisma.module");
let CashSessionModule = class CashSessionModule {
};
exports.CashSessionModule = CashSessionModule;
exports.CashSessionModule = CashSessionModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [cash_session_controller_1.CashSessionController],
        providers: [cash_session_service_1.CashSessionService],
        exports: [cash_session_service_1.CashSessionService],
    })
], CashSessionModule);
//# sourceMappingURL=cash-session.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const audit_service_1 = require("./audit.service");
const event_bus_service_1 = require("./event-bus.service");
const outbox_service_1 = require("./outbox.service");
const outbox_processor_1 = require("./outbox.processor");
const operations_controller_1 = require("./operations.controller");
const event_emitter_1 = require("@nestjs/event-emitter");
let SharedModule = class SharedModule {
};
exports.SharedModule = SharedModule;
exports.SharedModule = SharedModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, event_emitter_1.EventEmitterModule.forRoot()],
        controllers: [operations_controller_1.OperationsController],
        providers: [
            audit_service_1.AuditService,
            event_bus_service_1.EventBus,
            outbox_service_1.OutboxService,
            outbox_processor_1.OutboxProcessor,
        ],
        exports: [audit_service_1.AuditService, event_bus_service_1.EventBus, outbox_service_1.OutboxService],
    })
], SharedModule);
//# sourceMappingURL=shared.module.js.map
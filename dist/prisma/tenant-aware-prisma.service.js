"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantAwarePrismaService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("./prisma.service");
let TenantAwarePrismaService = class TenantAwarePrismaService {
    constructor(request, prisma) {
        this.request = request;
        this.prisma = prisma;
    }
    get tenantId() {
        var _a;
        return this.request.tenantId || ((_a = this.request.user) === null || _a === void 0 ? void 0 : _a.tenantId);
    }
    get user() {
        return this.request.user;
    }
    get client() {
        var _a;
        const tenantId = this.tenantId;
        const isPlatformUser = ((_a = this.request.user) === null || _a === void 0 ? void 0 : _a.isPlatformUser) || false;
        console.log(`[TenantAwarePrismaService] [DEBUG] Context: tenantId=${tenantId}, isPlatformUser=${isPlatformUser}`);
        return this.prisma.$extends({
            query: {
                $allModels: {
                    async $allOperations({ model, operation, args, query }) {
                        const tenantModels = ['User', 'Role', 'Branch', 'Inventory', 'Sale', 'Return', 'Payment', 'UserRole', 'CashSession', 'Invoice', 'Receipt', 'ZReport', 'StripePayment', 'TaxRate', 'Customer', 'Supplier', 'PurchaseOrder', 'InventoryLedger', 'ChartOfAccount', 'JournalEntry', 'AccountingEvent', 'AccountingPeriod', 'AuditLog', 'Subscription', 'UsageMetric', 'BillingInvoice', 'BillingEvent'];
                        if (!tenantModels.includes(model) || isPlatformUser || !tenantId) {
                            return query(args);
                        }
                        if (operation === 'create' || operation === 'createMany') {
                            if (args.data) {
                                if (Array.isArray(args.data)) {
                                    args.data.forEach((item) => item.tenantId = tenantId);
                                }
                                else {
                                    args.data.tenantId = tenantId;
                                }
                            }
                        }
                        else if (operation === 'findFirst' || operation === 'findMany' || operation === 'count' || operation === 'updateMany' || operation === 'deleteMany') {
                            args.where = Object.assign(Object.assign({}, args.where), { tenantId });
                        }
                        else if (operation === 'findUnique') {
                            const result = await query(args);
                            if (result && result.tenantId && result.tenantId !== tenantId) {
                                return null;
                            }
                            return result;
                        }
                        return query(args);
                    }
                },
            },
        });
    }
};
exports.TenantAwarePrismaService = TenantAwarePrismaService;
exports.TenantAwarePrismaService = TenantAwarePrismaService = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.REQUEST }),
    __param(0, (0, common_1.Inject)(core_1.REQUEST)),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService])
], TenantAwarePrismaService);
//# sourceMappingURL=tenant-aware-prisma.service.js.map
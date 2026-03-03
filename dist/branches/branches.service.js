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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchesService = void 0;
const common_1 = require("@nestjs/common");
const tenant_aware_prisma_service_1 = require("../prisma/tenant-aware-prisma.service");
const plan_enforcement_service_1 = require("../tenant-admin/plan-enforcement.service");
const usage_tracking_service_1 = require("../tenant-admin/usage-tracking.service");
let BranchesService = class BranchesService {
    constructor(prisma, planEnforcement, usageTracking) {
        this.prisma = prisma;
        this.planEnforcement = planEnforcement;
        this.usageTracking = usageTracking;
    }
    findAll() {
        return this.prisma.client.branch.findMany();
    }
    findOne(id) {
        return this.prisma.client.branch.findUnique({
            where: { id },
        });
    }
    async create(tenantId, data) {
        await this.planEnforcement.checkBranchLimit(tenantId);
        const branch = await this.prisma.client.branch.create({
            data: Object.assign(Object.assign({}, data), { tenantId }),
        });
        const branchCount = await this.prisma.client.branch.count({ where: { tenantId } });
        await this.usageTracking.recordMetric(tenantId, 'BRANCHES', branchCount);
        return branch;
    }
};
exports.BranchesService = BranchesService;
exports.BranchesService = BranchesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_aware_prisma_service_1.TenantAwarePrismaService,
        plan_enforcement_service_1.PlanEnforcementService,
        usage_tracking_service_1.UsageTrackingService])
], BranchesService);
//# sourceMappingURL=branches.service.js.map
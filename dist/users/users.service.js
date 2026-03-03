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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const plan_enforcement_service_1 = require("../tenant-admin/plan-enforcement.service");
const usage_tracking_service_1 = require("../tenant-admin/usage-tracking.service");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(prisma, planEnforcement, usageTracking) {
        this.prisma = prisma;
        this.planEnforcement = planEnforcement;
        this.usageTracking = usageTracking;
    }
    async create(tenantId, email, password, roleId) {
        await this.planEnforcement.checkUserLimit(tenantId);
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing)
            throw new common_1.ConflictException('Email already in use');
        const hashedPassword = await bcrypt.hash(password, 10);
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    passwordHash: hashedPassword,
                    tenantId,
                },
            });
            if (roleId) {
                await tx.userRole.create({
                    data: {
                        userId: user.id,
                        roleId,
                        tenantId,
                    },
                });
            }
            const userCount = await tx.user.count({ where: { tenantId } });
            await this.usageTracking.recordMetric(tenantId, 'USERS', userCount);
            return user;
        });
    }
    async findAll(tenantId) {
        return this.prisma.user.findMany({
            where: { tenantId },
            include: {
                userRoles: {
                    include: { role: true }
                }
            }
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        plan_enforcement_service_1.PlanEnforcementService,
        usage_tracking_service_1.UsageTrackingService])
], UsersService);
//# sourceMappingURL=users.service.js.map
import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlanEnforcementService } from '../tenant-admin/plan-enforcement.service';
import { UsageTrackingService } from '../tenant-admin/usage-tracking.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private planEnforcement: PlanEnforcementService,
        private usageTracking: UsageTrackingService,
    ) { }

    async create(tenantId: string, email: string, password: string, roleId?: string) {
        // 1. Check plan limit
        await this.planEnforcement.checkUserLimit(tenantId);

        // 2. Check uniqueness
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) throw new ConflictException('Email already in use');

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

            // Record Usage Metric
            const userCount = await tx.user.count({ where: { tenantId } });
            await this.usageTracking.recordMetric(tenantId, 'USERS', userCount);

            return user;
        });
    }

    async findAll(tenantId: string) {
        return this.prisma.user.findMany({
            where: { tenantId },
            include: {
                userRoles: {
                    include: { role: true }
                }
            }
        });
    }
}

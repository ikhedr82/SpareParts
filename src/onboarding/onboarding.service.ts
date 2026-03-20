import { Injectable, ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LanguageCode } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OnboardingService {
    private readonly logger = new Logger(OnboardingService.name);

    constructor(private prisma: PrismaService) {}

    /**
     * Self-service tenant signup flow:
     * 1. Validate subdomain uniqueness
     * 2. Validate email uniqueness
     * 3. Resolve or create FREE plan
     * 4. Create tenant
     * 5. Create subscription (FREE/MANUAL)
     * 6. Create admin role with all permissions
     * 7. Create admin user
     * 8. Return tenant URL
     */
    async signup(dto: SignupDto) {
        // 1. Subdomain uniqueness
        const existingTenant = await this.prisma.tenant.findUnique({
            where: { subdomain: dto.subdomain },
        });
        if (existingTenant) {
            throw new ConflictException('Subdomain is already taken');
        }

        // 2. Email uniqueness
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.adminEmail },
        });
        if (existingUser) {
            throw new ConflictException('Email is already registered');
        }

        // 3. Resolve FREE plan
        const freePlan = await this.resolveFreePlan();

        // 4. Hash password
        const passwordHash = await bcrypt.hash(dto.password, 12);

        try {
            return await this.prisma.$transaction(async (tx) => {
                // 5. Create tenant
                const tenant = await tx.tenant.create({
                    data: {
                        name: dto.companyName,
                        subdomain: dto.subdomain,
                        planId: freePlan.id,
                        defaultLanguage: (dto.preferredLanguage || 'EN') as LanguageCode,
                        supportedLanguages: [LanguageCode.EN, LanguageCode.AR],
                        baseCurrency: 'USD',
                        supportedCurrencies: ['USD', 'SAR'],
                        status: 'ACTIVE',
                    },
                });

                // 6. Create subscription
                await (tx.subscription as any).create({
                    data: {
                        tenantId: tenant.id,
                        planId: freePlan.id,
                        status: 'ACTIVE',
                        provider: 'MANUAL',
                    },
                });

                // 7. Create admin role
                const adminRole = await tx.role.create({
                    data: {
                        tenantId: tenant.id,
                        name: 'Tenant Admin',
                        scope: 'TENANT',
                        description: 'Full access administrator',
                    },
                });

                // Assign all permissions
                const allPermissions = await tx.permission.findMany();
                if (allPermissions.length > 0) {
                    await tx.rolePermission.createMany({
                        data: allPermissions.map((perm) => ({
                            roleId: adminRole.id,
                            permissionId: perm.id,
                        })),
                        skipDuplicates: true,
                    });
                }

                // 8. Create admin user
                const adminUser = await tx.user.create({
                    data: {
                        email: dto.adminEmail,
                        passwordHash,
                        tenantId: tenant.id,
                    },
                });

                // 9. Assign admin role
                await tx.userRole.create({
                    data: {
                        userId: adminUser.id,
                        roleId: adminRole.id,
                        tenantId: tenant.id,
                    },
                });

                // 10. Audit log
                await tx.auditLog.create({
                    data: {
                        tenantId: tenant.id,
                        userId: adminUser.id,
                        action: 'SELF_SERVICE_SIGNUP',
                        entityType: 'Tenant',
                        entityId: tenant.id,
                        newValue: {
                            companyName: dto.companyName,
                            subdomain: dto.subdomain,
                            adminEmail: dto.adminEmail,
                            plan: freePlan.name,
                        },
                    },
                });

                this.logger.log(`[Onboarding] Tenant created: ${dto.subdomain} (${tenant.id})`);

                return {
                    tenantId: tenant.id,
                    tenantUrl: `https://${dto.subdomain}.partivo.net`,
                    adminEmail: dto.adminEmail,
                    plan: freePlan.name,
                    message: 'Account created successfully. You can now log in.',
                };
            });
        } catch (error) {
            if (error instanceof ConflictException) throw error;
            this.logger.error(`[Onboarding] Signup failed for ${dto.adminEmail}`, error);
            throw new InternalServerErrorException('Signup failed. Please try again.');
        }
    }

    /**
     * Resolve the FREE plan. Create it if it doesn't exist.
     */
    private async resolveFreePlan() {
        let freePlan = await this.prisma.plan.findFirst({
            where: { name: 'FREE' },
        });

        if (!freePlan) {
            freePlan = await this.prisma.plan.create({
                data: {
                    name: 'FREE',
                    price: 0,
                    currency: 'USD',
                    billingCycle: 'MONTHLY',
                    isActive: true,
                    features: {
                        inventory: true,
                        sales: true,
                        reports: false,
                        multiCurrency: false,
                        logistics: false,
                    },
                    limits: {
                        maxUsers: 5, // Increased from 2 for better free trial experience
                        maxBranches: 2, // Increased from 1
                        maxProducts: 500, // Increased from 100
                        maxOrdersPerMonth: 1000, // Increased from 500
                    },
                },
            });
            this.logger.log('[Onboarding] Created default FREE plan with updated limits');
        }

        return freePlan;
    }

    /**
     * Check subdomain availability (for real-time validation).
     */
    async checkSubdomain(subdomain: string): Promise<{ available: boolean }> {
        const existing = await this.prisma.tenant.findUnique({
            where: { subdomain },
        });
        return { available: !existing };
    }
}

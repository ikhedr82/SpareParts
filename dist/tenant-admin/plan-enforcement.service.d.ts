import { PrismaService } from '../prisma/prisma.service';
import { TranslationService } from '../i18n/translation.service';
export declare class PlanEnforcementService {
    private prisma;
    private t;
    constructor(prisma: PrismaService, t: TranslationService);
    private getTenantSubscription;
    checkUserLimit(tenantId: string): Promise<void>;
    checkBranchLimit(tenantId: string): Promise<void>;
    checkProductLimit(tenantId: string): Promise<void>;
    checkFeatureAccess(tenantId: string, feature: string): Promise<void>;
}

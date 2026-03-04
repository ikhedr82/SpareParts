import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../shared/audit.service';
import { OutboxService } from '../shared/outbox.service';
export declare class UserOffboardingService {
    private readonly prisma;
    private readonly auditService;
    private readonly outbox;
    constructor(prisma: PrismaService, auditService: AuditService, outbox: OutboxService);
    offboardUser(tenantId: string, targetUserId: string, performedById: string, reason: string, correlationId?: string): Promise<{
        userId: string;
        email: string;
        status: string;
        rolesRemoved: number;
    }>;
    findAll(tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        status: string;
        updatedAt: Date;
        userRoles: ({
            role: {
                id: string;
                tenantId: string | null;
                createdAt: Date;
                updatedAt: Date;
                version: number;
                name: string;
                description: string | null;
                descriptionAr: string | null;
                nameAr: string | null;
                scope: import(".prisma/client").$Enums.RoleScope;
            };
        } & {
            id: string;
            tenantId: string | null;
            userId: string;
            branchId: string | null;
            roleId: string;
        })[];
    }[]>;
}

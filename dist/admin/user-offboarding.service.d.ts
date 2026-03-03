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
        updatedAt: Date;
        status: string;
        email: string;
        userRoles: ({
            role: {
                id: string;
                name: string;
                nameAr: string | null;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string | null;
                version: number;
                scope: import(".prisma/client").$Enums.RoleScope;
                description: string | null;
                descriptionAr: string | null;
            };
        } & {
            id: string;
            tenantId: string | null;
            roleId: string;
            userId: string;
            branchId: string | null;
        })[];
    }[]>;
}

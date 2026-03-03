import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
interface AuditLogData {
    action: string;
    entityType: string;
    entityId: string;
    oldValue?: any;
    newValue?: any;
}
export declare class AuditService {
    private readonly prisma;
    private readonly request;
    constructor(prisma: TenantAwarePrismaService, request: any);
    logAction(data: AuditLogData): Promise<void>;
    getAuditTrail(entityType: string, entityId: string): Promise<any>;
    getRecentActivity(limit?: number): Promise<any>;
}
export {};

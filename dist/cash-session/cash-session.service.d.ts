import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { OpenCashSessionDto } from './dto/open-cash-session.dto';
import { CloseCashSessionDto } from './dto/close-cash-session.dto';
export declare class CashSessionService {
    private readonly prisma;
    constructor(prisma: TenantAwarePrismaService);
    open(dto: OpenCashSessionDto, userId: string): Promise<any>;
    close(dto: CloseCashSessionDto, userId: string): Promise<any>;
    getCurrent(branchId: string): Promise<any>;
}

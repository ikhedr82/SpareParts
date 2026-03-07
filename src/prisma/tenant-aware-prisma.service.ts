import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from './prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class TenantAwarePrismaService {
    constructor(
        @Inject(REQUEST) private request: Request,
        private prisma: PrismaService,
    ) { }

    get tenantId() {
        // Fallback: Check header/middleware first, then JWT payload (request.user)
        return (this.request as any).tenantId || (this.request as any).user?.tenantId;
    }

    get user() {
        return (this.request as any).user;
    }

    get client() {
        const tenantId = this.tenantId;
        const isPlatformUser = (this.request as any).user?.isPlatformUser || false;

        console.log(`[TenantAwarePrismaService] [DEBUG] Context: tenantId=${tenantId}, isPlatformUser=${isPlatformUser}`);

        return this.prisma.$extends({
            query: {
                $allModels: {
                    async $allOperations({ model, operation, args, query }) {
                        const tenantModels = ['User', 'Role', 'Branch', 'Inventory', 'Sale', 'Return', 'Payment', 'UserRole', 'CashSession', 'Invoice', 'Receipt', 'ZReport', 'StripePayment', 'TaxRate', 'Customer', 'Supplier', 'PurchaseOrder', 'InventoryLedger', 'ChartOfAccount', 'JournalEntry', 'AccountingEvent', 'AccountingPeriod', 'AuditLog', 'Subscription', 'UsageMetric', 'BillingInvoice', 'BillingEvent'];

                        // Skip isolation if:
                        // 1. Model is not tenant-specific
                        // 2. User is a Platform Admin (they see everything)
                        // 3. No tenant context is available (soft-fail to allow public/platform access)
                        if (!tenantModels.includes(model) || isPlatformUser || !tenantId) {
                            return query(args);
                        }

                        // Apply Isolation logic
                        if (operation === 'create' || operation === 'createMany') {
                            if (args.data) {
                                if (Array.isArray(args.data)) {
                                    args.data.forEach((item: any) => item.tenantId = tenantId);
                                } else {
                                    (args.data as any).tenantId = tenantId;
                                }
                            }
                        } else if (operation === 'findFirst' || operation === 'findMany' || operation === 'count' || operation === 'updateMany' || operation === 'deleteMany') {
                            args.where = { ...args.where, tenantId };
                        } else if (operation === 'findUnique') {
                            const result = await query(args);
                            if (result && (result as any).tenantId && (result as any).tenantId !== tenantId) {
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
}

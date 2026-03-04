import { PrismaService } from '../prisma/prisma.service';
import { SupplierInvoiceStatus } from '@prisma/client';
import { AuditService } from '../shared/audit.service';
import { OutboxService } from '../shared/outbox.service';
import { TranslationService } from '../i18n/translation.service';
export declare class SupplierInvoiceService {
    private readonly prisma;
    private readonly auditService;
    private readonly outbox;
    private readonly t;
    constructor(prisma: PrismaService, auditService: AuditService, outbox: OutboxService, t: TranslationService);
    createInvoice(tenantId: string, userId: string, dto: {
        purchaseOrderId: string;
        invoiceNumber: string;
        supplierId?: string;
        invoiceDate: string;
        amount: number;
        currency?: string;
        items: {
            productId: string;
            quantity: number;
            unitPrice: number;
        }[];
    }, correlationId?: string): Promise<{
        items: {
            id: string;
            createdAt: Date;
            productId: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            lineTotal: import("@prisma/client/runtime/library").Decimal;
            supplierInvoiceId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.SupplierInvoiceStatus;
        updatedAt: Date;
        version: number;
        supplierId: string | null;
        currency: string;
        purchaseOrderId: string;
        invoiceNumber: string;
        invoiceDate: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        mismatchDetails: import("@prisma/client/runtime/library").JsonValue | null;
        postedAt: Date | null;
    }>;
    matchInvoice(tenantId: string, invoiceId: string, userId: string, correlationId?: string): Promise<{
        items: {
            id: string;
            createdAt: Date;
            productId: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            lineTotal: import("@prisma/client/runtime/library").Decimal;
            supplierInvoiceId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.SupplierInvoiceStatus;
        updatedAt: Date;
        version: number;
        supplierId: string | null;
        currency: string;
        purchaseOrderId: string;
        invoiceNumber: string;
        invoiceDate: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        mismatchDetails: import("@prisma/client/runtime/library").JsonValue | null;
        postedAt: Date | null;
    }>;
    postInvoice(tenantId: string, invoiceId: string, userId: string, correlationId?: string): Promise<{
        items: {
            id: string;
            createdAt: Date;
            productId: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            lineTotal: import("@prisma/client/runtime/library").Decimal;
            supplierInvoiceId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.SupplierInvoiceStatus;
        updatedAt: Date;
        version: number;
        supplierId: string | null;
        currency: string;
        purchaseOrderId: string;
        invoiceNumber: string;
        invoiceDate: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        mismatchDetails: import("@prisma/client/runtime/library").JsonValue | null;
        postedAt: Date | null;
    }>;
    findAll(tenantId: string, status?: SupplierInvoiceStatus): Promise<({
        items: {
            id: string;
            createdAt: Date;
            productId: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            lineTotal: import("@prisma/client/runtime/library").Decimal;
            supplierInvoiceId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.SupplierInvoiceStatus;
        updatedAt: Date;
        version: number;
        supplierId: string | null;
        currency: string;
        purchaseOrderId: string;
        invoiceNumber: string;
        invoiceDate: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        mismatchDetails: import("@prisma/client/runtime/library").JsonValue | null;
        postedAt: Date | null;
    })[]>;
    findOne(tenantId: string, invoiceId: string): Promise<{
        items: {
            id: string;
            createdAt: Date;
            productId: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            lineTotal: import("@prisma/client/runtime/library").Decimal;
            supplierInvoiceId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.SupplierInvoiceStatus;
        updatedAt: Date;
        version: number;
        supplierId: string | null;
        currency: string;
        purchaseOrderId: string;
        invoiceNumber: string;
        invoiceDate: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        mismatchDetails: import("@prisma/client/runtime/library").JsonValue | null;
        postedAt: Date | null;
    }>;
}

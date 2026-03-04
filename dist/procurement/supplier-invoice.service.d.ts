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
        currency: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.SupplierInvoiceStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        version: number;
        invoiceNumber: string;
        supplierId: string | null;
        purchaseOrderId: string;
        postedAt: Date | null;
        invoiceDate: Date;
        mismatchDetails: import("@prisma/client/runtime/library").JsonValue | null;
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
        currency: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.SupplierInvoiceStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        version: number;
        invoiceNumber: string;
        supplierId: string | null;
        purchaseOrderId: string;
        postedAt: Date | null;
        invoiceDate: Date;
        mismatchDetails: import("@prisma/client/runtime/library").JsonValue | null;
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
        currency: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.SupplierInvoiceStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        version: number;
        invoiceNumber: string;
        supplierId: string | null;
        purchaseOrderId: string;
        postedAt: Date | null;
        invoiceDate: Date;
        mismatchDetails: import("@prisma/client/runtime/library").JsonValue | null;
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
        currency: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.SupplierInvoiceStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        version: number;
        invoiceNumber: string;
        supplierId: string | null;
        purchaseOrderId: string;
        postedAt: Date | null;
        invoiceDate: Date;
        mismatchDetails: import("@prisma/client/runtime/library").JsonValue | null;
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
        currency: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.SupplierInvoiceStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        version: number;
        invoiceNumber: string;
        supplierId: string | null;
        purchaseOrderId: string;
        postedAt: Date | null;
        invoiceDate: Date;
        mismatchDetails: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}

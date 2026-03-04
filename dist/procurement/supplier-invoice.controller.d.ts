import { SupplierInvoiceService } from './supplier-invoice.service';
export declare class SupplierInvoiceController {
    private readonly service;
    constructor(service: SupplierInvoiceService);
    create(req: any, body: any): Promise<{
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
    findAll(req: any, status?: any): Promise<({
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
    findOne(req: any, id: string): Promise<{
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
    match(req: any, id: string): Promise<{
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
    post(req: any, id: string): Promise<{
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

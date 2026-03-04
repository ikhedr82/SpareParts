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

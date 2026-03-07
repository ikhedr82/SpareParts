export interface Sale {
    id: string;
    tenantId: string;
    branchId: string;
    totalAmount: number;
    status: string;
    createdAt: string;
}

export interface Payment {
    id: string;
    saleId: string;
    amount: number;
    method: string;
    createdAt: string;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    saleId: string;
    totalAmount: number;
    status: string;
    issuedAt: string;
}

export interface Receipt {
    id: string;
    receiptNumber: string;
    paymentId: string;
    amount: number;
    issuedAt: string;
}

export interface ZReport {
    id: string;
    reportNumber: string;
    branchId: string;
    totalSales: number;
    totalCash: number;
    openedAt: string;
    closedAt: string | null;
    status: string;
}

export interface DashboardKPIs {
    totalSales: number;
    totalRevenue: number;
    averageOrderValue: number;
    salesCount: number;
}

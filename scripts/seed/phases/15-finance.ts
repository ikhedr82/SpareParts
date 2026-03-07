/**
 * Phase 15 — Finance
 * Creates:
 *   - Chart of Accounts (standard Egyptian setup)
 *   - Journal Entries (revenue, COGS, expenses)
 *   - Invoices (PAID + UNPAID for delivered orders)
 *   - Accounting Periods (past 6 months)
 */
import { PrismaClient } from '@prisma/client';
import { TENANT_ID, USER_FINANCE, USER_SUPER_ADMIN, id, freshId } from '../helpers/ids';
import { daysAgo, dateAt, startOfDay, businessOpenDate } from '../helpers/dates';

// Standard Chart of Accounts
const COA = [
    // Assets
    { code: '1000', name: 'Cash on Hand', type: 'ASSET' as const, isSystem: true },
    { code: '1010', name: 'Bank Account - Primary', type: 'ASSET' as const, isSystem: true },
    { code: '1020', name: 'Accounts Receivable', type: 'ASSET' as const, isSystem: true },
    { code: '1100', name: 'Inventory', type: 'ASSET' as const, isSystem: true },
    { code: '1200', name: 'Prepaid Expenses', type: 'ASSET' as const, isSystem: false },
    // Liabilities
    { code: '2000', name: 'Accounts Payable', type: 'LIABILITY' as const, isSystem: true },
    { code: '2100', name: 'VAT Payable', type: 'LIABILITY' as const, isSystem: true },
    { code: '2200', name: 'Accrued Expenses', type: 'LIABILITY' as const, isSystem: false },
    { code: '2300', name: 'Customer Deposits', type: 'LIABILITY' as const, isSystem: false },
    // Equity
    { code: '3000', name: 'Owner Equity', type: 'EQUITY' as const, isSystem: true },
    { code: '3100', name: 'Retained Earnings', type: 'EQUITY' as const, isSystem: true },
    // Revenue
    { code: '4000', name: 'Sales Revenue', type: 'REVENUE' as const, isSystem: true },
    { code: '4100', name: 'Service Revenue', type: 'REVENUE' as const, isSystem: false },
    { code: '4200', name: 'Returns & Allowances', type: 'REVENUE' as const, isSystem: false },
    // Expenses
    { code: '5000', name: 'Cost of Goods Sold', type: 'EXPENSE' as const, isSystem: true },
    { code: '5100', name: 'Shipping & Delivery', type: 'EXPENSE' as const, isSystem: false },
    { code: '5200', name: 'Warehouse Operations', type: 'EXPENSE' as const, isSystem: false },
    { code: '6000', name: 'Salaries & Wages', type: 'EXPENSE' as const, isSystem: false },
    { code: '6100', name: 'Rent', type: 'EXPENSE' as const, isSystem: false },
    { code: '6200', name: 'Utilities', type: 'EXPENSE' as const, isSystem: false },
    { code: '6300', name: 'Depreciation', type: 'EXPENSE' as const, isSystem: false },
];

export async function seedFinance(prisma: PrismaClient) {
    console.log('  → Phase 15: Creating Finance Data...');

    // ── 1. Chart of Accounts ──
    const accountMap = new Map<string, string>();
    for (const acct of COA) {
        const acctId = id(`coa:${acct.code}`);
        accountMap.set(acct.code, acctId);
        await prisma.chartOfAccount.create({
            data: {
                id: acctId,
                tenantId: TENANT_ID,
                code: acct.code,
                name: acct.name,
                type: acct.type,
                isSystem: acct.isSystem,
            },
        });
    }
    console.log(`    ✓ ${COA.length} chart of accounts entries`);

    // ── 2. Accounting Periods (past 6 months) ──
    const now = new Date();
    for (let m = 5; m >= 0; m--) {
        const start = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - m + 1, 0);
        const isClosed = m > 0; // Only current month is open

        await prisma.accountingPeriod.create({
            data: {
                id: freshId(),
                tenantId: TENANT_ID,
                startDate: start,
                endDate: end,
                isClosed,
                closedAt: isClosed ? new Date(end.getTime() + 86400000) : null, // Day after period end
                closedById: isClosed ? USER_FINANCE : null,
            },
        });
    }
    console.log('    ✓ 6 accounting periods');

    // ── 3. Journal Entries (20 entries for realistic ledger) ──
    const journalDefs = [
        // Monthly revenue entries
        { ref: 'JE-2025-001', desc: 'January sales revenue recognition', daysBack: 150, amount: 125000, debitAcct: '1010', creditAcct: '4000' },
        { ref: 'JE-2025-002', desc: 'January COGS', daysBack: 150, amount: 75000, debitAcct: '5000', creditAcct: '1100' },
        { ref: 'JE-2025-003', desc: 'February sales revenue', daysBack: 120, amount: 142000, debitAcct: '1010', creditAcct: '4000' },
        { ref: 'JE-2025-004', desc: 'February COGS', daysBack: 120, amount: 85200, debitAcct: '5000', creditAcct: '1100' },
        { ref: 'JE-2025-005', desc: 'March sales revenue', daysBack: 90, amount: 158000, debitAcct: '1010', creditAcct: '4000' },
        { ref: 'JE-2025-006', desc: 'March COGS', daysBack: 90, amount: 94800, debitAcct: '5000', creditAcct: '1100' },
        // Monthly expenses
        { ref: 'JE-2025-007', desc: 'January salaries', daysBack: 145, amount: 45000, debitAcct: '6000', creditAcct: '1010' },
        { ref: 'JE-2025-008', desc: 'January rent', daysBack: 145, amount: 15000, debitAcct: '6100', creditAcct: '1010' },
        { ref: 'JE-2025-009', desc: 'February salaries', daysBack: 115, amount: 45000, debitAcct: '6000', creditAcct: '1010' },
        { ref: 'JE-2025-010', desc: 'February rent', daysBack: 115, amount: 15000, debitAcct: '6100', creditAcct: '1010' },
        { ref: 'JE-2025-011', desc: 'March salaries', daysBack: 85, amount: 48000, debitAcct: '6000', creditAcct: '1010' },
        { ref: 'JE-2025-012', desc: 'March rent', daysBack: 85, amount: 15000, debitAcct: '6100', creditAcct: '1010' },
        // Supplier payments
        { ref: 'JE-2025-013', desc: 'Bosch ME payment - PO-2025-0001', daysBack: 28, amount: 35000, debitAcct: '2000', creditAcct: '1010' },
        { ref: 'JE-2025-014', desc: 'Denso Gulf payment', daysBack: 22, amount: 22000, debitAcct: '2000', creditAcct: '1010' },
        { ref: 'JE-2025-015', desc: 'Inventory purchase - Cairo Parts', daysBack: 18, amount: 28000, debitAcct: '1100', creditAcct: '2000' },
        { ref: 'JE-2025-016', desc: 'VAT settlement Q1', daysBack: 60, amount: 18500, debitAcct: '2100', creditAcct: '1010' },
        // Delivery expenses
        { ref: 'JE-2025-017', desc: 'Delivery fuel costs - January', daysBack: 140, amount: 3500, debitAcct: '5100', creditAcct: '1000' },
        { ref: 'JE-2025-018', desc: 'Delivery fuel costs - February', daysBack: 110, amount: 3800, debitAcct: '5100', creditAcct: '1000' },
        // Utilities
        { ref: 'JE-2025-019', desc: 'Warehouse utilities Q1', daysBack: 80, amount: 5200, debitAcct: '6200', creditAcct: '1010' },
        { ref: 'JE-2025-020', desc: 'Equipment depreciation Q1', daysBack: 80, amount: 8000, debitAcct: '6300', creditAcct: '1100' },
    ];

    for (const je of journalDefs) {
        const jeDate = startOfDay(je.daysBack);
        const jeId = freshId();

        await prisma.journalEntry.create({
            data: {
                id: jeId,
                tenantId: TENANT_ID,
                reference: je.ref,
                date: jeDate,
                description: je.desc,
                totalAmount: je.amount,
                status: 'POSTED',
                isPosted: true,
                postedAt: jeDate,
                postedById: USER_FINANCE,
                createdById: USER_FINANCE,
                createdAt: jeDate,
                lines: {
                    create: [
                        { id: freshId(), accountId: accountMap.get(je.debitAcct)!, debit: je.amount, credit: 0, description: je.desc },
                        { id: freshId(), accountId: accountMap.get(je.creditAcct)!, debit: 0, credit: je.amount, description: je.desc },
                    ],
                },
            },
        });
    }
    console.log(`    ✓ ${journalDefs.length} journal entries`);

    // ── 4. Invoices for delivered orders (B2B — no saleId, these are order invoices) ──
    const deliveredOrders = await prisma.order.findMany({
        where: { tenantId: TENANT_ID, status: 'DELIVERED' },
        include: { items: { include: { product: true } } },
    });

    let invoiceCount = 0;

    // Create invoices from POS sales first (they need the unique saleId)
    const completedSales = await prisma.sale.findMany({
        where: { tenantId: TENANT_ID, status: 'COMPLETED' },
        take: 15,
        include: { items: true },
    });

    const usedSaleIds = new Set<string>();

    for (const sale of completedSales) {
        if (usedSaleIds.has(sale.id)) continue;
        usedSaleIds.add(sale.id);

        invoiceCount++;
        await prisma.invoice.create({
            data: {
                id: freshId(),
                tenantId: TENANT_ID,
                saleId: sale.id,
                invoiceNumber: `INV-2025-${String(invoiceCount).padStart(4, '0')}`,
                subtotal: Math.round(Number(sale.total) / 1.14 * 100) / 100,
                tax: Math.round((Number(sale.total) - Number(sale.total) / 1.14) * 100) / 100,
                amount: Number(sale.total),
                status: 'PAID',
                issuedAt: sale.createdAt,
                createdAt: sale.createdAt,
            },
        });
    }

    // Now create B2B order invoices — use a dedicated POS sale per order invoice
    const remainingSales = await prisma.sale.findMany({
        where: { tenantId: TENANT_ID, status: 'COMPLETED', id: { notIn: Array.from(usedSaleIds) } },
        take: deliveredOrders.length,
    });

    for (let i = 0; i < deliveredOrders.length; i++) {
        const order = deliveredOrders[i];
        invoiceCount++;
        const subtotal = Number(order.subtotal);
        const tax = Number(order.tax);

        // Use a remaining sale if available, otherwise skip saleId
        const linkedSale = remainingSales[i];

        await prisma.invoice.create({
            data: {
                id: freshId(),
                tenantId: TENANT_ID,
                ...(linkedSale ? { saleId: linkedSale.id } : {}),
                invoiceNumber: `INV-2025-${String(invoiceCount).padStart(4, '0')}`,
                subtotal,
                tax,
                amount: subtotal + tax,
                status: i < 3 ? 'PAID' : 'UNPAID',
                businessClientId: order.businessClientId,
                issuedAt: order.deliveredAt || order.createdAt,
                createdAt: order.deliveredAt || order.createdAt,
            },
        });
    }

    console.log(`    ✓ ${invoiceCount} invoices`);
}


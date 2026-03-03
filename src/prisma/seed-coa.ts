
import { PrismaClient, AccountType } from '@prisma/client';

export const standardCOA = [
    // ASSETS
    { code: '1000', name: 'Cash on Hand', type: AccountType.ASSET, description: 'Physical cash in registers' },
    { code: '1010', name: 'Bank Account', type: AccountType.ASSET, description: 'Primary business bank account' },
    { code: '1100', name: 'Accounts Receivable', type: AccountType.ASSET, description: 'Money owed by customers', isSystem: true },
    { code: '1200', name: 'Inventory Asset', type: AccountType.ASSET, description: 'Value of stock on hand', isSystem: true },

    // LIABILITIES
    { code: '2000', name: 'Accounts Payable', type: AccountType.LIABILITY, description: 'Money owed to suppliers', isSystem: true },
    { code: '2100', name: 'VAT Payable', type: AccountType.LIABILITY, description: 'Tax collected from sales', isSystem: true },
    { code: '2200', name: 'Customer Deposits', type: AccountType.LIABILITY, description: 'Prepayments from customers' },

    // EQUITY
    { code: '3000', name: 'Owner\'s Equity', type: AccountType.EQUITY, description: 'Capital invested' },
    { code: '3100', name: 'Retained Earnings', type: AccountType.EQUITY, description: 'Accumulated profits' },

    // REVENUE
    { code: '4000', name: 'Sales Revenue', type: AccountType.REVENUE, description: 'Income from product sales', isSystem: true },
    { code: '4100', name: 'Service Revenue', type: AccountType.REVENUE, description: 'Income from services' },

    // EXPENSES
    { code: '5000', name: 'Cost of Goods Sold', type: AccountType.EXPENSE, description: 'Direct costs of items sold', isSystem: true },
    { code: '5100', name: 'Rent Expense', type: AccountType.EXPENSE, description: 'Office/Shop rent' },
    { code: '5200', name: 'Salaries Expense', type: AccountType.EXPENSE, description: 'Employee wages' },
    { code: '5300', name: 'Utilities Expense', type: AccountType.EXPENSE, description: 'Electricity, water, internet' },
    { code: '5400', name: 'General Expense', type: AccountType.EXPENSE, description: 'Miscellaneous expenses' },
];

export async function seedCOA(prisma: PrismaClient, tenantId: string) {
    console.log(`Seeding Chart of Accounts for Tenant: ${tenantId}...`);

    for (const account of standardCOA) {
        await prisma.chartOfAccount.upsert({
            where: {
                tenantId_code: {
                    tenantId,
                    code: account.code
                }
            },
            update: {}, // Don't overwrite if exists
            create: {
                tenantId,
                code: account.code,
                name: account.name,
                type: account.type,
                description: account.description,
                isSystem: account.isSystem || false
            }
        });
    }
    console.log(`✅ COA Seeding complete for ${tenantId}`);
}

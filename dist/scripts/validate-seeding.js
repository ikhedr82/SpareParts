"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function validate() {
    console.log('🔍 Validating Seeding Data for Demo Tenant (alpha)...');
    let errors = 0;
    const demoTenant = await prisma.tenant.findUnique({ where: { subdomain: 'alpha' } });
    if (!demoTenant) {
        console.error('❌ Demo tenant "alpha" not found!');
        process.exit(1);
    }
    const tenantId = demoTenant.id;
    const curCount = await prisma.currency.count();
    console.log(`- Currencies: ${curCount}`);
    if (curCount < 3) {
        console.error('❌ Missing currencies');
        errors++;
    }
    const sales = await prisma.sale.findMany({ where: { tenantId } });
    console.log(`- Sales: ${sales.length}`);
    for (const sale of sales) {
        if (!sale.currency) {
            console.error(`❌ Sale ${sale.id} missing currency`);
            errors++;
        }
        if (!sale.baseAmount || Number(sale.baseAmount) === 0) {
            console.error(`❌ Sale ${sale.id} missing baseAmount`);
            errors++;
        }
        if (!sale.exchangeRateUsed || Number(sale.exchangeRateUsed) === 0) {
            console.error(`❌ Sale ${sale.id} missing exchangeRateUsed`);
            errors++;
        }
    }
    const pos = await prisma.purchaseOrder.findMany({ where: { tenantId } });
    console.log(`- Purchase Orders: ${pos.length}`);
    for (const po of pos) {
        if (!po.currency) {
            console.error(`❌ PO ${po.id} missing currency`);
            errors++;
        }
        if (!po.baseAmount || Number(po.baseAmount) === 0) {
            console.error(`❌ PO ${po.id} missing baseAmount`);
            errors++;
        }
        if (!po.exchangeRate) {
            console.error(`❌ PO ${po.id} missing exchangeRate`);
            errors++;
        }
    }
    const entities = [
        { model: 'Brand', name: 'Brands' },
        { model: 'ProductCategory', name: 'Categories' },
        { model: 'Product', name: 'Products' },
        { model: 'Branch', name: 'Branches' },
        { model: 'Customer', name: 'Customers' },
        { model: 'Supplier', name: 'Suppliers' },
        { model: 'TaxRate', name: 'TaxRates' },
        { model: 'ChartOfAccount', name: 'Accounts' },
    ];
    for (const ent of entities) {
        const isGlobal = ['Brand', 'ProductCategory', 'Product'].includes(ent.model);
        const query = isGlobal ? {} : { where: { tenantId } };
        const items = await prisma[ent.model].findMany(query);
        let missingAr = 0;
        for (const item of items) {
            if (!item.nameAr)
                missingAr++;
        }
        console.log(`- ${ent.name}: ${items.length} total, ${missingAr} missing nameAr`);
        if (missingAr > 0) {
            console.error(`❌ ${ent.name} has ${missingAr} items missing Arabic names`);
            errors++;
        }
    }
    if (errors === 0) {
        console.log('\n✅ ALL VALIDATIONS PASSED!');
    }
    else {
        console.error(`\n❌ FOUND ${errors} ERRORS!`);
        process.exit(1);
    }
}
validate().finally(() => prisma.$disconnect());
//# sourceMappingURL=validate-seeding.js.map
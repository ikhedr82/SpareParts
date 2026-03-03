import { PrismaClient, RoleScope, PaymentMethod, LanguageCode, AccountType } from '@prisma/client';
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('🌍 Seeding Enterprise Multi-Currency & Multi-Language Demo Data...');

    // 0. Cleanup (Optional but recommended for a clean demo)
    console.log('🧹 Cleaning up old demo data...');
    const tenantSelect = { where: { subdomain: 'alpha' } };
    const alphaTenant = await prisma.tenant.findUnique(tenantSelect);
    if (alphaTenant) {
        // Delete transactions first (due to FKs)
        await prisma.payment.deleteMany({ where: { tenantId: alphaTenant.id } });
        await prisma.invoiceLine.deleteMany({ where: { invoice: { tenantId: alphaTenant.id } } });
        await prisma.invoice.deleteMany({ where: { tenantId: alphaTenant.id } });
        await prisma.receipt.deleteMany({ where: { tenantId: alphaTenant.id } });
        await prisma.saleItem.deleteMany({ where: { sale: { tenantId: alphaTenant.id } } });
        await prisma.sale.deleteMany({ where: { tenantId: alphaTenant.id } });
        await prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrder: { tenantId: alphaTenant.id } } });
        await prisma.purchaseOrder.deleteMany({ where: { tenantId: alphaTenant.id } });
        await prisma.inventory.deleteMany({ where: { tenantId: alphaTenant.id } });
        await prisma.chartOfAccount.deleteMany({ where: { tenantId: alphaTenant.id } });
        await prisma.taxRate.deleteMany({ where: { tenantId: alphaTenant.id } });
        // Keep Users and Roles to avoid lockouts if needed, or delete them too
    }

    // 1. Currencies & Exchange Rates
    console.log('💱 Seeding Currencies and Exchange Rates...');
    const currencies = [
        { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', nameAr: 'جنيه مصري', precision: 2 },
        { code: 'USD', name: 'US Dollar', symbol: '$', nameAr: 'دولار أمريكي', precision: 2 },
        { code: 'EUR', name: 'Euro', symbol: '€', nameAr: 'يورو', precision: 2 },
    ];

    for (const cur of currencies) {
        await prisma.currency.upsert({
            where: { code: cur.code },
            update: { precision: cur.precision, name: cur.name },
            create: { code: cur.code, name: cur.name, symbol: cur.symbol, precision: cur.precision },
        });
    }

    // Historical Exchange Rates (USD->EGP, EUR->EGP)
    // We'll seed for the last 30 days with slight variations
    const now = new Date();
    for (let i = 0; i < 30; i++) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        // USD -> EGP variation (48.0 - 50.5)
        const usdRate = 49.5 + (Math.random() * 1.5 - 0.75);
        // EUR -> EGP variation (53.0 - 55.5)
        const eurRate = 54.0 + (Math.random() * 1.5 - 0.75);

        // We only have one (from, to) unique constraint in schema, 
        // but the request asks for historical variation. 
        // The schema model ExchangeRate has @@unique([fromCurrency, toCurrency]). 
        // This means it only stores the CURRENT rate. 
        // IF the schema was intended for historical rates, it would need a date in the unique key.
        // I will check the schema again for ExchangeRate.

        await prisma.exchangeRate.upsert({
            where: { fromCurrency_toCurrency: { fromCurrency: 'USD', toCurrency: 'EGP' } },
            update: { rate: usdRate, effectiveAt: date },
            create: { fromCurrency: 'USD', toCurrency: 'EGP', rate: usdRate, effectiveAt: date }
        });
        await prisma.exchangeRate.upsert({
            where: { fromCurrency_toCurrency: { fromCurrency: 'EUR', toCurrency: 'EGP' } },
            update: { rate: eurRate, effectiveAt: date },
            create: { fromCurrency: 'EUR', toCurrency: 'EGP', rate: eurRate, effectiveAt: date }
        });
    }

    // 2. Plans & Tenant
    console.log('🏢 Seeding Tiered Plans and Tenant...');
    const plansData = [
        {
            name: 'BASIC',
            nameAr: 'الخطة الأساسية',
            price: 0,
            currency: 'USD',
            billingCycle: 'MONTHLY',
            limits: { maxUsers: 2, maxBranches: 1, maxProducts: 10 },
            features: { logisticsEnabled: false, advancedReports: false, multiCurrency: false },
        },
        {
            name: 'PRO',
            nameAr: 'الخطة الاحترافية',
            price: 49,
            currency: 'USD',
            billingCycle: 'MONTHLY',
            limits: { maxUsers: 10, maxBranches: 3, maxProducts: 100 },
            features: { logisticsEnabled: true, advancedReports: true, multiCurrency: true },
        },
        {
            name: 'ENTERPRISE',
            nameAr: 'خطة الشركات',
            price: 999,
            currency: 'USD',
            billingCycle: 'YEARLY',
            limits: { maxUsers: 1000, maxBranches: 100, maxProducts: 100000 },
            features: { logisticsEnabled: true, advancedReports: true, multiCurrency: true },
        }
    ];

    const plans: Record<string, any> = {};
    for (const p of plansData) {
        plans[p.name] = await prisma.plan.upsert({
            where: { name: p.name },
            update: {
                limits: p.limits as any,
                features: p.features as any,
                price: p.price,
                nameAr: p.nameAr,
            },
            create: {
                name: p.name,
                nameAr: p.nameAr,
                price: p.price,
                currency: p.currency,
                billingCycle: p.billingCycle as any,
                limits: p.limits as any,
                features: p.features as any,
            },
        });
    }

    const enterprisePlan = plans['ENTERPRISE'];

    const demoTenant = await prisma.tenant.upsert({
        where: { subdomain: 'alpha' },
        update: {
            baseCurrency: 'EGP',
            supportedCurrencies: ['EGP', 'USD', 'EUR'],
            defaultLanguage: LanguageCode.AR,
            supportedLanguages: [LanguageCode.EN, LanguageCode.AR],
        },
        create: {
            name: 'Alpha Motors',
            subdomain: 'alpha',
            planId: enterprisePlan.id,
            baseCurrency: 'EGP',
            supportedCurrencies: ['EGP', 'USD', 'EUR'],
            defaultLanguage: LanguageCode.AR,
            supportedLanguages: [LanguageCode.EN, LanguageCode.AR],
            status: 'ACTIVE',
        },
    });

    // 2b. Seed Subscription for Alpha
    await prisma.subscription.upsert({
        where: { tenantId: demoTenant.id },
        update: { status: 'ACTIVE', planId: enterprisePlan.id },
        create: {
            tenantId: demoTenant.id,
            planId: enterprisePlan.id,
            status: 'ACTIVE',
            billingCycle: 'YEARLY',
            startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date(now.getTime() + 335 * 24 * 60 * 60 * 1000),
        }
    });

    // 2c. Seed a "Past Due" Tenant for enforcement demo
    const basicPlan = plans['BASIC'];
    const betaTenant = await prisma.tenant.upsert({
        where: { subdomain: 'beta' },
        update: {},
        create: {
            name: 'Beta Parts (Limited)',
            subdomain: 'beta',
            planId: basicPlan.id,
            baseCurrency: 'USD',
            supportedCurrencies: ['USD'],
            defaultLanguage: LanguageCode.EN,
            supportedLanguages: [LanguageCode.EN],
            status: 'ACTIVE',
        }
    });

    await prisma.subscription.upsert({
        where: { tenantId: betaTenant.id },
        update: { status: 'PAST_DUE' },
        create: {
            tenantId: betaTenant.id,
            planId: basicPlan.id,
            status: 'PAST_DUE',
            billingCycle: 'MONTHLY',
            startDate: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
            endDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        }
    });

    const demoBranch = await prisma.branch.upsert({
        where: { tenantId_name: { tenantId: demoTenant.id, name: 'Main Branch' } },
        update: { nameAr: 'الفرع الرئيسي', addressAr: 'القاهرة، مصر' },
        create: {
            tenantId: demoTenant.id,
            name: 'Main Branch',
            nameAr: 'الفرع الرئيسي',
            address: 'Cairo, Egypt',
            addressAr: 'القاهرة، مصر',
        },
    });

    // 3. Permissions & Roles
    console.log('🔑 Seeding Roles and Permissions...');
    const permissionCodes = [
        'CREATE_SALE', 'REFUND_SALE', 'VIEW_SALES',
        'TAKE_PAYMENT', 'ISSUE_REFUND',
        'VIEW_INVENTORY', 'ADJUST_STOCK',
        'VIEW_INVOICES', 'VIEW_RECEIPTS', 'VIEW_Z_REPORT', 'CLOSE_Z_REPORT',
        'MANAGE_USERS', 'MANAGE_ROLES', 'MANAGE_BRANCH', 'MANAGE_PRODUCTS',
        'VIEW_ANALYTICS'
    ];

    const permissions: Record<string, any> = {};
    for (const code of permissionCodes) {
        permissions[code] = await prisma.permission.upsert({
            where: { code },
            update: {},
            create: {
                code,
                description: `${code.replace(/_/g, ' ')} permission`,
                descriptionAr: `صلاحية ${code.replace(/_/g, ' ')}`
            },
        });
    }

    const tenantSuperAdminRole = await prisma.role.upsert({
        where: { tenantId_name_scope: { tenantId: demoTenant.id, name: 'TENANT_SUPER_ADMIN', scope: RoleScope.TENANT } },
        update: { nameAr: 'مدير النظام للمؤسسة' },
        create: {
            tenantId: demoTenant.id,
            name: 'TENANT_SUPER_ADMIN',
            nameAr: 'مدير النظام للمؤسسة',
            scope: RoleScope.TENANT
        },
    });

    for (const p of Object.values(permissions)) {
        await prisma.rolePermission.upsert({
            where: { roleId_permissionId: { roleId: tenantSuperAdminRole.id, permissionId: p.id } },
            update: {},
            create: { roleId: tenantSuperAdminRole.id, permissionId: p.id },
        });
    }

    // 4. Products & Catalog
    console.log('📦 Seeding Product Catalog with Arabic translations...');
    const brand = await prisma.brand.upsert({
        where: { name: 'PartStack Genuine' },
        update: { nameAr: 'بارت ستاك الأصلي' },
        create: { name: 'PartStack Genuine', nameAr: 'بارت ستاك الأصلي', country: 'Germany', isOem: true },
    });

    const category = await prisma.productCategory.upsert({
        where: { name: 'Engine Parts' },
        update: { nameAr: 'قطع غيار المحرك' },
        create: { name: 'Engine Parts', nameAr: 'قطع غيار المحرك' },
    });

    const productsData = [
        { name: 'Oil Filter', nameAr: 'فلتر زيت', price: 600, barcode: 'OF-001' }, // Prices in EGP
        { name: 'Brake Pads', nameAr: 'تيل فرامل', price: 2500, barcode: 'BP-002' },
        { name: 'Air Filter', nameAr: 'فلتر هواء', price: 900, barcode: 'AF-003' },
        { name: 'Spark Plugs', nameAr: 'بوجيهات', price: 1600, barcode: 'SP-004' },
    ];

    const seededProducts = [];
    for (const prodData of productsData) {
        const product = await prisma.product.upsert({
            where: { name: prodData.name },
            update: { nameAr: prodData.nameAr },
            create: {
                name: prodData.name,
                nameAr: prodData.nameAr,
                brandId: brand.id,
                categoryId: category.id,
                status: 'ACTIVE',
            },
        });
        seededProducts.push(product);

        await prisma.inventory.upsert({
            where: { branchId_productId: { branchId: demoBranch.id, productId: product.id } },
            update: { sellingPrice: prodData.price },
            create: {
                tenantId: demoTenant.id,
                branchId: demoBranch.id,
                productId: product.id,
                quantity: 100,
                costPrice: prodData.price * 0.7,
                sellingPrice: prodData.price,
                barcode: prodData.barcode,
            },
        });
    }

    // 5. Suppliers & Customers
    console.log('👥 Seeding Suppliers and Customers...');
    const internationalSupplier = await prisma.supplier.upsert({
        where: { id: 'demo-intl-supplier-id' },
        update: { nameAr: 'شركة قطع الغيار العالمية' },
        create: {
            id: 'demo-intl-supplier-id',
            tenantId: demoTenant.id,
            name: 'Global Parts Corp',
            nameAr: 'شركة قطع الغيار العالمية',
            balance: 0,
        }
    });

    const localSupplier = await prisma.supplier.upsert({
        where: { id: 'demo-local-supplier-id' },
        update: { nameAr: 'المصرية لقطع غيار السيارات' },
        create: {
            id: 'demo-local-supplier-id',
            tenantId: demoTenant.id,
            name: 'Local Auto Parts Egy',
            nameAr: 'المصرية لقطع غيار السيارات',
            balance: 0,
        }
    });

    const demoCustomer = await prisma.customer.upsert({
        where: { id: 'demo-customer-id' },
        update: { nameAr: 'حسن لخدمات السيارات' },
        create: {
            id: 'demo-customer-id',
            tenantId: demoTenant.id,
            name: 'Hassan Automotive',
            nameAr: 'حسن لخدمات السيارات',
            phone: '+20123456789',
        }
    });

    // 6. Users
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@alpha.com' },
        update: {},
        create: {
            email: 'admin@alpha.com',
            passwordHash: hashedPassword,
            tenantId: demoTenant.id,
        }
    });

    await prisma.userRole.upsert({
        where: { userId_roleId_tenantId_branchId: { userId: adminUser.id, roleId: tenantSuperAdminRole.id, tenantId: demoTenant.id, branchId: '00000000-0000-0000-0000-000000000000' } },
        update: {},
        create: { userId: adminUser.id, roleId: tenantSuperAdminRole.id, tenantId: demoTenant.id }
    });

    // 7. Seed Transactions (Sales & Purchase Orders)
    console.log('💰 Generating multi-currency transactions...');

    // Exchange rates map (EGP is base, so reversed rates used for baseAmount)
    // baseAmount = amount * rate (where rate is Currency->EGP)
    const getRate = (currency: string) => {
        if (currency === 'EGP') return 1.0;
        if (currency === 'USD') return 50.0;
        if (currency === 'EUR') return 54.0;
        return 1.0;
    };

    // Sales: 60% EGP, 30% USD, 10% EUR
    for (let i = 0; i < 50; i++) {
        const rand = Math.random();
        let currency = 'EGP';
        if (rand > 0.6 && rand <= 0.9) currency = 'USD';
        else if (rand > 0.9) currency = 'EUR';

        const rate = getRate(currency);
        const daysAgo = Math.floor(Math.random() * 30);
        const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

        const itemsCount = Math.floor(Math.random() * 3) + 1;
        let totalAmount = 0;

        const sale = await prisma.sale.create({
            data: {
                tenantId: demoTenant.id,
                branchId: demoBranch.id,
                customerId: demoCustomer.id,
                currency: currency,
                exchangeRateUsed: rate,
                status: 'COMPLETED',
                createdAt: date,
                total: 0, // updated below
                baseAmount: 0, // updated below
            }
        });

        for (let j = 0; j < itemsCount; j++) {
            const product = seededProducts[Math.floor(Math.random() * seededProducts.length)];
            const inv = await prisma.inventory.findUnique({
                where: { branchId_productId: { branchId: demoBranch.id, productId: product.id } }
            });
            const priceInBase = Number(inv?.sellingPrice || 1000);
            const priceInCurrency = priceInBase / rate;
            const qty = Math.floor(Math.random() * 2) + 1;

            await prisma.saleItem.create({
                data: {
                    saleId: sale.id,
                    productId: product.id,
                    quantity: qty,
                    price: priceInCurrency,
                }
            });
            totalAmount += priceInCurrency * qty;
        }

        await prisma.sale.update({
            where: { id: sale.id },
            data: {
                total: totalAmount,
                baseAmount: totalAmount * rate
            }
        });

        // Payment
        await prisma.payment.create({
            data: {
                tenantId: demoTenant.id,
                saleId: sale.id,
                amount: totalAmount,
                currency: currency,
                exchangeRateUsed: rate,
                baseAmount: totalAmount * rate,
                method: PaymentMethod.CASH,
                paidAt: date,
            }
        });
    }

    // Purchase Orders
    console.log('🛒 Generating Mixed-Currency Purchase Orders...');
    for (let i = 0; i < 10; i++) {
        const isInternational = Math.random() > 0.5;
        const supplier = isInternational ? internationalSupplier : localSupplier;
        const currency = isInternational ? (Math.random() > 0.5 ? 'USD' : 'EUR') : 'EGP';
        const rate = getRate(currency);

        const PO = await prisma.purchaseOrder.create({
            data: {
                tenantId: demoTenant.id,
                branchId: demoBranch.id,
                supplierId: supplier.id,
                supplierName: supplier.name,
                currency: currency,
                exchangeRate: rate,
                totalCost: 0,
                baseAmount: 0,
                createdById: adminUser.id,
            }
        });

        let totalCost = 0;
        const product = seededProducts[Math.floor(Math.random() * seededProducts.length)];
        const unitCostInBase = 500;
        const unitCostInCurrency = unitCostInBase / rate;
        const qty = 50;

        await prisma.purchaseOrderItem.create({
            data: {
                purchaseOrderId: PO.id,
                productId: product.id,
                quantity: qty,
                unitCost: unitCostInCurrency,
            }
        });

        totalCost = unitCostInCurrency * qty;

        await prisma.purchaseOrder.update({
            where: { id: PO.id },
            data: {
                totalCost: totalCost,
                baseAmount: totalCost * rate
            }
        });
    }

    // 8. Tax Rates
    console.log('📑 Seeding Tax Rates...');
    const vatRate = await prisma.taxRate.upsert({
        where: { id: 'demo-vat-id' },
        update: { nameAr: 'ضريبة القيمة المضافة القياسية' },
        create: {
            id: 'demo-vat-id',
            tenantId: demoTenant.id,
            name: 'Standard VAT',
            nameAr: 'ضريبة القيمة المضافة القياسية',
            percentage: 15.00,
        }
    });

    // 9. Chart of Accounts
    console.log('📖 Seeding Chart of Accounts...');
    const accounts = [
        { code: '1000', name: 'Cash on Hand', nameAr: 'نقدية بالخزينة', type: AccountType.ASSET, description: 'Physical cash', descriptionAr: 'النقدية المتوفرة بالخزينة' },
        { code: '1200', name: 'Inventory', nameAr: 'المخزون', type: AccountType.ASSET, description: 'Stock value', descriptionAr: 'قيمة بضاعة أول المدة' },
        { code: '4000', name: 'Sales Revenue', nameAr: 'إيرادات المبيعات', type: AccountType.REVENUE, description: 'Income from sales', descriptionAr: 'الدخل المتحقق من المبيعات' },
    ];

    for (const acc of accounts) {
        await prisma.chartOfAccount.upsert({
            where: { tenantId_code: { tenantId: demoTenant.id, code: acc.code } },
            update: { nameAr: acc.nameAr, descriptionAr: acc.descriptionAr },
            create: {
                tenantId: demoTenant.id,
                code: acc.code,
                name: acc.name,
                nameAr: acc.nameAr,
                type: acc.type,
                description: acc.description,
                descriptionAr: acc.descriptionAr,
                isSystem: true,
            }
        });
    }

    console.log('\n🚀 Enterprise Seeding Completed!');
    console.log('Base Currency: EGP');
    console.log('Supported Currencies: EGP, USD, EUR');
    console.log('Default Language: Arabic');
}

main()
    .catch((e) => {
        console.error('❌ Error Seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

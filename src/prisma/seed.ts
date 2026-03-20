import 'dotenv/config';
import { PrismaClient, RoleScope } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding permissions...');

    const permissionCodes = [
        // Sales
        'CREATE_SALE', 'REFUND_SALE', 'VIEW_SALES',
        // Payments
        'TAKE_PAYMENT', 'ISSUE_REFUND',
        // Inventory
        'VIEW_INVENTORY', 'ADJUST_STOCK',
        // Financial
        'VIEW_INVOICES', 'VIEW_RECEIPTS', 'VIEW_Z_REPORT', 'CLOSE_Z_REPORT',
        // Admin
        'MANAGE_USERS', 'MANAGE_ROLES', 'MANAGE_BRANCH', 'MANAGE_PRODUCTS',
        // Reports
        'VIEW_ANALYTICS',
        // B2B Orders
        'CREATE_ORDER', 'VIEW_ORDERS', 'UPDATE_ORDER_STATUS', 'CANCEL_ORDER',
        // Business Clients
        'MANAGE_BUSINESS_CLIENTS', 'VIEW_BUSINESS_CLIENTS'
    ];

    const permissions: Record<string, any> = {};
    for (const code of permissionCodes) {
        permissions[code] = await prisma.permission.upsert({
            where: { code },
            update: {},
            create: { code, description: `${code.replace(/_/g, ' ')} permission` },
        });
    }

    console.log('Seeding predefined roles...');

    // Helper to assign permissions to a role
    const assignPermissions = async (roleId: string, codes: string[]) => {
        for (const code of codes) {
            await prisma.rolePermission.upsert({
                where: { roleId_permissionId: { roleId, permissionId: permissions[code].id } },
                update: {},
                create: { roleId, permissionId: permissions[code].id },
            });
        }
    };

    // 1. PLATFORM Roles (tenantId is null)
    let platformSuperAdmin = await prisma.role.findFirst({
        where: { name: 'PLATFORM_SUPER_ADMIN', scope: RoleScope.PLATFORM, tenantId: null /* as any */ }
    });
    if (!platformSuperAdmin) {
        platformSuperAdmin = await prisma.role.create({
            data: { name: 'PLATFORM_SUPER_ADMIN', scope: RoleScope.PLATFORM, tenantId: null }
        });
    }
    await assignPermissions(platformSuperAdmin.id, permissionCodes);

    let platformSupport = await prisma.role.findFirst({
        where: { name: 'PLATFORM_SUPPORT', scope: RoleScope.PLATFORM, tenantId: null }
    });
    if (!platformSupport) {
        platformSupport = await prisma.role.create({
            data: { name: 'PLATFORM_SUPPORT', scope: RoleScope.PLATFORM, tenantId: null }
        });
    }
    await assignPermissions(platformSupport.id, ['VIEW_SALES', 'VIEW_INVENTORY', 'VIEW_INVOICES', 'VIEW_RECEIPTS', 'VIEW_ANALYTICS']);

    console.log('Seeding default Plans and Currencies...');

    const enterprisePlan = await prisma.plan.upsert({
        where: { name: 'Enterprise' },
        update: {},
        create: {
            name: 'Enterprise',
            price: 500,
            currency: 'USD',
            billingCycle: 'MONTHLY',
            features: ['Unlimited Users', 'Unlimited Branches', 'API Access'],
        },
    });

    const usdCurrency = await prisma.currency.upsert({
        where: { code: 'USD' },
        update: {},
        create: {
            code: 'USD',
            name: 'US Dollar',
            symbol: '$',
        },
    });

    // 2. Initial Tenant & Branch (for testing)
    const tenant = await prisma.tenant.upsert({
        where: { subdomain: 'alpha' },
        update: {},
        create: {
            name: 'Alpha Motors',
            subdomain: 'alpha',
            planId: enterprisePlan.id,
            baseCurrency: 'USD',
        },
    });

    const branch = await prisma.branch.upsert({
        where: { tenantId_name: { tenantId: tenant.id, name: 'Main Branch' } },
        update: {},
        create: { tenantId: tenant.id, name: 'Main Branch' },
    });

    // 3. TENANT Roles
    const tenantSuperAdmin = await prisma.role.upsert({
        where: { tenantId_name_scope: { tenantId: tenant.id, name: 'TENANT_SUPER_ADMIN', scope: RoleScope.TENANT } },
        update: {},
        create: { tenantId: tenant.id, name: 'TENANT_SUPER_ADMIN', scope: RoleScope.TENANT },
    });
    await assignPermissions(tenantSuperAdmin.id, permissionCodes.filter(c => !c.startsWith('PLATFORM'))); // Simplified: all for now

    const tenantFinance = await prisma.role.upsert({
        where: { tenantId_name_scope: { tenantId: tenant.id, name: 'TENANT_FINANCE', scope: RoleScope.TENANT } },
        update: {},
        create: { tenantId: tenant.id, name: 'TENANT_FINANCE', scope: RoleScope.TENANT },
    });
    await assignPermissions(tenantFinance.id, ['VIEW_SALES', 'VIEW_INVOICES', 'VIEW_RECEIPTS', 'VIEW_Z_REPORT', 'VIEW_ANALYTICS']);

    // 4. BRANCH Roles
    const branchManager = await prisma.role.upsert({
        where: { tenantId_name_scope: { tenantId: tenant.id, name: 'BRANCH_MANAGER', scope: RoleScope.BRANCH } },
        update: {},
        create: { tenantId: tenant.id, name: 'BRANCH_MANAGER', scope: RoleScope.BRANCH },
    });
    await assignPermissions(branchManager.id, ['CREATE_SALE', 'VIEW_SALES', 'VIEW_INVENTORY', 'ADJUST_STOCK', 'CLOSE_Z_REPORT', 'VIEW_ANALYTICS']);

    const cashier = await prisma.role.upsert({
        where: { tenantId_name_scope: { tenantId: tenant.id, name: 'CASHIER', scope: RoleScope.BRANCH } },
        update: {},
        create: { tenantId: tenant.id, name: 'CASHIER', scope: RoleScope.BRANCH },
    });
    await assignPermissions(cashier.id, ['CREATE_SALE', 'TAKE_PAYMENT', 'VIEW_INVENTORY']);

    const driverRole = await prisma.role.upsert({
        where: { tenantId_name_scope: { tenantId: tenant.id, name: 'DRIVER', scope: RoleScope.BRANCH } },
        update: {},
        create: { tenantId: tenant.id, name: 'DRIVER', scope: RoleScope.BRANCH },
    });
    await assignPermissions(driverRole.id, ['VIEW_ORDERS', 'UPDATE_ORDER_STATUS']);

    const customerRole = await prisma.role.upsert({
        where: { tenantId_name_scope: { tenantId: tenant.id, name: 'CUSTOMER', scope: RoleScope.TENANT } },
        update: {},
        create: { tenantId: tenant.id, name: 'CUSTOMER', scope: RoleScope.TENANT },
    });
    await assignPermissions(customerRole.id, ['VIEW_ORDERS', 'CREATE_ORDER']);

    console.log('Seeding users...');

    const bcrypt = require('bcrypt');

    // 5. Platform Super Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const platformAdmin = await prisma.user.upsert({
        where: { email: 'platform@admin.com' },
        update: {},
        create: {
            email: 'platform@admin.com',
            passwordHash: hashedPassword,
            isPlatformUser: true,
        },
    });

    // Assign PLATFORM_SUPER_ADMIN role
    let platformUserRole = await prisma.userRole.findFirst({
        where: {
            userId: platformAdmin.id,
            roleId: platformSuperAdmin.id,
            tenantId: null,
            branchId: null
        }
    });

    if (!platformUserRole) {
        await prisma.userRole.create({
            data: {
                userId: platformAdmin.id,
                roleId: platformSuperAdmin.id,
                tenantId: null,
                branchId: null
            }
        });
    }

    // 6. Tenant Admin User
    const tenantAdminPassword = await bcrypt.hash('tenant123', 10);
    const tenantAdmin = await prisma.user.upsert({
        where: { email: 'admin@alpha.com' },
        update: {},
        create: {
            email: 'admin@alpha.com',
            passwordHash: tenantAdminPassword,
            tenantId: tenant.id,
        },
    });

    let tenantUserRole = await prisma.userRole.findFirst({
        where: {
            userId: tenantAdmin.id,
            roleId: tenantSuperAdmin.id,
            tenantId: tenant.id,
            branchId: null
        }
    });

    if (!tenantUserRole) {
        await prisma.userRole.create({
            data: {
                userId: tenantAdmin.id,
                roleId: tenantSuperAdmin.id,
                tenantId: tenant.id,
                branchId: null
            }
        });
    }

    // 6.5 POS Cashier User
    const cashierUserPassword = await bcrypt.hash('Pos123!', 10);
    const cashierUser = await prisma.user.upsert({
        where: { email: 'cashier@alpha.com' },
        update: {},
        create: { email: 'cashier@alpha.com', passwordHash: cashierUserPassword, tenantId: tenant.id },
    });
    await prisma.userRole.upsert({
        where: { userId_roleId_tenantId_branchId: { userId: cashierUser.id, roleId: cashier.id, tenantId: tenant.id, branchId: branch.id } },
        update: {},
        create: { userId: cashierUser.id, roleId: cashier.id, tenantId: tenant.id, branchId: branch.id }
    });

    // 6.6 Driver User
    const driverUserPassword = await bcrypt.hash('Driver123!', 10);
    const driverUser = await prisma.user.upsert({
        where: { email: 'driver@alpha.com' },
        update: {},
        create: { email: 'driver@alpha.com', passwordHash: driverUserPassword, tenantId: tenant.id },
    });
    await prisma.userRole.upsert({
        where: { userId_roleId_tenantId_branchId: { userId: driverUser.id, roleId: driverRole.id, tenantId: tenant.id, branchId: branch.id } },
        update: {},
        create: { userId: driverUser.id, roleId: driverRole.id, tenantId: tenant.id, branchId: branch.id }
    });

    // 6.7 Customer User
    const customerUserPassword = await bcrypt.hash('Customer123!', 10);
    const customerUser = await prisma.user.upsert({
        where: { email: 'customer1@alpha.com' },
        update: {},
        create: { email: 'customer1@alpha.com', passwordHash: customerUserPassword, tenantId: tenant.id },
    });
    await prisma.userRole.upsert({
        where: { userId_roleId_tenantId_branchId: { userId: customerUser.id, roleId: customerRole.id, tenantId: tenant.id, branchId: null } },
        update: {},
        create: { userId: customerUser.id, roleId: customerRole.id, tenantId: tenant.id, branchId: null }
    });

    console.log('✅ RBAC Seeding completed.');
    console.log('Platform Admin: platform@admin.com / admin123');
    console.log('Tenant Admin: admin@alpha.com / tenant123');
    console.log('POS Cashier: cashier@alpha.com / Pos123!');
    console.log('Driver: driver@alpha.com / Driver123!');
    console.log('Customer: customer1@alpha.com / Customer123!');

    // 7. Seed Chart of Accounts
    await import('./seed-coa').then(m => m.seedCOA(prisma, tenant.id));

    // 8. Seed Automotive Master Data
    // 8. Seed Automotive Master Data
    await import('./seed-master-data').then(m => m.seedMasterData(prisma, tenant.id, branch.id));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

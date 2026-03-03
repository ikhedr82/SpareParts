"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding permissions...');
    const permissionCodes = [
        'CREATE_SALE', 'REFUND_SALE', 'VIEW_SALES',
        'TAKE_PAYMENT', 'ISSUE_REFUND',
        'VIEW_INVENTORY', 'ADJUST_STOCK',
        'VIEW_INVOICES', 'VIEW_RECEIPTS', 'VIEW_Z_REPORT', 'CLOSE_Z_REPORT',
        'MANAGE_USERS', 'MANAGE_ROLES', 'MANAGE_BRANCH', 'MANAGE_PRODUCTS',
        'VIEW_ANALYTICS',
        'CREATE_ORDER', 'VIEW_ORDERS', 'UPDATE_ORDER_STATUS', 'CANCEL_ORDER',
        'MANAGE_BUSINESS_CLIENTS', 'VIEW_BUSINESS_CLIENTS'
    ];
    const permissions = {};
    for (const code of permissionCodes) {
        permissions[code] = await prisma.permission.upsert({
            where: { code },
            update: {},
            create: { code, description: `${code.replace(/_/g, ' ')} permission` },
        });
    }
    console.log('Seeding predefined roles...');
    const assignPermissions = async (roleId, codes) => {
        for (const code of codes) {
            await prisma.rolePermission.upsert({
                where: { roleId_permissionId: { roleId, permissionId: permissions[code].id } },
                update: {},
                create: { roleId, permissionId: permissions[code].id },
            });
        }
    };
    let platformSuperAdmin = await prisma.role.findFirst({
        where: { name: 'PLATFORM_SUPER_ADMIN', scope: client_1.RoleScope.PLATFORM, tenantId: null }
    });
    if (!platformSuperAdmin) {
        platformSuperAdmin = await prisma.role.create({
            data: { name: 'PLATFORM_SUPER_ADMIN', scope: client_1.RoleScope.PLATFORM, tenantId: null }
        });
    }
    await assignPermissions(platformSuperAdmin.id, permissionCodes);
    let platformSupport = await prisma.role.findFirst({
        where: { name: 'PLATFORM_SUPPORT', scope: client_1.RoleScope.PLATFORM, tenantId: null }
    });
    if (!platformSupport) {
        platformSupport = await prisma.role.create({
            data: { name: 'PLATFORM_SUPPORT', scope: client_1.RoleScope.PLATFORM, tenantId: null }
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
    const tenantSuperAdmin = await prisma.role.upsert({
        where: { tenantId_name_scope: { tenantId: tenant.id, name: 'TENANT_SUPER_ADMIN', scope: client_1.RoleScope.TENANT } },
        update: {},
        create: { tenantId: tenant.id, name: 'TENANT_SUPER_ADMIN', scope: client_1.RoleScope.TENANT },
    });
    await assignPermissions(tenantSuperAdmin.id, permissionCodes.filter(c => !c.startsWith('PLATFORM')));
    const tenantFinance = await prisma.role.upsert({
        where: { tenantId_name_scope: { tenantId: tenant.id, name: 'TENANT_FINANCE', scope: client_1.RoleScope.TENANT } },
        update: {},
        create: { tenantId: tenant.id, name: 'TENANT_FINANCE', scope: client_1.RoleScope.TENANT },
    });
    await assignPermissions(tenantFinance.id, ['VIEW_SALES', 'VIEW_INVOICES', 'VIEW_RECEIPTS', 'VIEW_Z_REPORT', 'VIEW_ANALYTICS']);
    const branchManager = await prisma.role.upsert({
        where: { tenantId_name_scope: { tenantId: tenant.id, name: 'BRANCH_MANAGER', scope: client_1.RoleScope.BRANCH } },
        update: {},
        create: { tenantId: tenant.id, name: 'BRANCH_MANAGER', scope: client_1.RoleScope.BRANCH },
    });
    await assignPermissions(branchManager.id, ['CREATE_SALE', 'VIEW_SALES', 'VIEW_INVENTORY', 'ADJUST_STOCK', 'CLOSE_Z_REPORT', 'VIEW_ANALYTICS']);
    const cashier = await prisma.role.upsert({
        where: { tenantId_name_scope: { tenantId: tenant.id, name: 'CASHIER', scope: client_1.RoleScope.BRANCH } },
        update: {},
        create: { tenantId: tenant.id, name: 'CASHIER', scope: client_1.RoleScope.BRANCH },
    });
    await assignPermissions(cashier.id, ['CREATE_SALE', 'TAKE_PAYMENT', 'VIEW_INVENTORY']);
    console.log('Seeding users...');
    const bcrypt = require('bcrypt');
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
    console.log('✅ RBAC Seeding completed.');
    console.log('Platform Admin: platform@admin.com / admin123');
    console.log('Tenant Admin: admin@alpha.com / tenant123');
    await Promise.resolve().then(() => require('./seed-coa')).then(m => m.seedCOA(prisma, tenant.id));
    await Promise.resolve().then(() => require('./seed-master-data')).then(m => m.seedMasterData(prisma, tenant.id, branch.id));
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map
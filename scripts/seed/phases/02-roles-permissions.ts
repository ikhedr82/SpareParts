/**
 * Phase 02 — Roles & Permissions
 * Creates RBAC structure: 6 roles, core permissions, and role-permission mappings.
 */
import { PrismaClient } from '@prisma/client';
import {
    TENANT_ID,
    ROLE_SUPER_ADMIN, ROLE_BRANCH_MANAGER, ROLE_WAREHOUSE_STAFF,
    ROLE_POS_USER, ROLE_DRIVER, ROLE_FINANCE, freshId,
} from '../helpers/ids';

const PERMISSIONS = [
    // Admin
    'MANAGE_TENANT', 'MANAGE_USERS', 'MANAGE_ROLES', 'VIEW_ANALYTICS',
    // Branch
    'MANAGE_BRANCH', 'VIEW_BRANCH_DATA',
    // POS
    'CREATE_SALE', 'VOID_SALE', 'REFUND_SALE', 'VIEW_SALES', 'MANAGE_CASH_SESSION',
    // Inventory
    'VIEW_INVENTORY', 'MANAGE_INVENTORY', 'ADJUST_STOCK', 'CREATE_PURCHASE_ORDER',
    // Warehouse
    'MANAGE_PICKLISTS', 'MANAGE_PACKS', 'SCAN_ITEMS',
    // Orders
    'VIEW_ORDERS', 'CREATE_ORDER', 'MANAGE_ORDERS', 'CANCEL_ORDER',
    // Logistics
    'MANAGE_TRIPS', 'DRIVE_TRIP', 'VIEW_TRIPS',
    // Finance
    'VIEW_INVOICES', 'MANAGE_INVOICES', 'MANAGE_JOURNAL', 'VIEW_REPORTS', 'MANAGE_ACCOUNTING',
    // Returns
    'MANAGE_RETURNS', 'PROCESS_REFUND',
    // Products
    'MANAGE_PRODUCTS', 'VIEW_PRODUCTS',
];

// Role → Permission mappings
const ROLE_PERMS: Record<string, string[]> = {
    [ROLE_SUPER_ADMIN]: PERMISSIONS, // Full access
    [ROLE_BRANCH_MANAGER]: [
        'MANAGE_BRANCH', 'VIEW_BRANCH_DATA', 'CREATE_SALE', 'VOID_SALE', 'REFUND_SALE',
        'VIEW_SALES', 'MANAGE_CASH_SESSION', 'VIEW_INVENTORY', 'MANAGE_INVENTORY',
        'VIEW_ORDERS', 'CREATE_ORDER', 'MANAGE_ORDERS', 'VIEW_TRIPS', 'MANAGE_TRIPS',
        'VIEW_INVOICES', 'VIEW_REPORTS', 'MANAGE_RETURNS', 'VIEW_PRODUCTS',
    ],
    [ROLE_WAREHOUSE_STAFF]: [
        'VIEW_INVENTORY', 'MANAGE_INVENTORY', 'ADJUST_STOCK', 'MANAGE_PICKLISTS',
        'MANAGE_PACKS', 'SCAN_ITEMS', 'VIEW_ORDERS', 'VIEW_PRODUCTS',
    ],
    [ROLE_POS_USER]: [
        'CREATE_SALE', 'VOID_SALE', 'VIEW_SALES', 'MANAGE_CASH_SESSION',
        'VIEW_INVENTORY', 'VIEW_PRODUCTS', 'PROCESS_REFUND',
    ],
    [ROLE_DRIVER]: [
        'DRIVE_TRIP', 'VIEW_TRIPS', 'VIEW_ORDERS',
    ],
    [ROLE_FINANCE]: [
        'VIEW_INVOICES', 'MANAGE_INVOICES', 'MANAGE_JOURNAL', 'VIEW_REPORTS',
        'MANAGE_ACCOUNTING', 'VIEW_SALES', 'VIEW_ORDERS', 'PROCESS_REFUND',
    ],
};

const ROLE_DEFS = [
    { id: ROLE_SUPER_ADMIN, name: 'Super Admin', scope: 'TENANT' as const, desc: 'Full system access' },
    { id: ROLE_BRANCH_MANAGER, name: 'Branch Manager', scope: 'BRANCH' as const, desc: 'Branch-level management' },
    { id: ROLE_WAREHOUSE_STAFF, name: 'Warehouse Staff', scope: 'BRANCH' as const, desc: 'Warehouse picking/packing' },
    { id: ROLE_POS_USER, name: 'POS User', scope: 'BRANCH' as const, desc: 'Point of sale operations' },
    { id: ROLE_DRIVER, name: 'Driver', scope: 'BRANCH' as const, desc: 'Delivery operations' },
    { id: ROLE_FINANCE, name: 'Finance User', scope: 'TENANT' as const, desc: 'Accounting & finance' },
];

export async function seedRolesPermissions(prisma: PrismaClient) {
    console.log('  → Phase 02: Creating Roles & Permissions...');

    // 1. Create permissions
    const permMap = new Map<string, string>();
    for (const code of PERMISSIONS) {
        const id = freshId();
        permMap.set(code, id);
        await prisma.permission.create({
            data: { id, code, description: code.replace(/_/g, ' ').toLowerCase() },
        });
    }

    // 2. Create roles
    for (const role of ROLE_DEFS) {
        await prisma.role.create({
            data: {
                id: role.id,
                tenantId: TENANT_ID,
                name: role.name,
                scope: role.scope,
                description: role.desc,
            },
        });
    }

    // 3. Create role-permission mappings
    for (const [roleId, perms] of Object.entries(ROLE_PERMS)) {
        for (const permCode of perms) {
            const permId = permMap.get(permCode);
            if (permId) {
                await prisma.rolePermission.create({
                    data: { roleId, permissionId: permId },
                });
            }
        }
    }

    console.log(`    ✓ ${ROLE_DEFS.length} roles, ${PERMISSIONS.length} permissions created`);
}

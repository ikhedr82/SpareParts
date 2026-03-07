/**
 * Phase 03 — Users
 * Creates 13 users: admin, managers, warehouse, POS, drivers, finance.
 * Each user gets a role assignment to their branch.
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
    TENANT_ID, BRANCH_WAREHOUSE, BRANCH_RETAIL_1, BRANCH_RETAIL_2,
    USER_SUPER_ADMIN, USER_BRANCH_MGR_WH, USER_BRANCH_MGR_R1, USER_BRANCH_MGR_R2,
    USER_WH_STAFF_1, USER_WH_STAFF_2, USER_POS_R1, USER_POS_R2,
    USER_DRIVER_1, USER_DRIVER_2, USER_DRIVER_3, USER_DRIVER_4,
    USER_FINANCE, ROLE_SUPER_ADMIN, ROLE_BRANCH_MANAGER, ROLE_WAREHOUSE_STAFF,
    ROLE_POS_USER, ROLE_DRIVER, ROLE_FINANCE, freshId,
} from '../helpers/ids';

interface UserDef {
    id: string;
    email: string;
    roleId: string;
    branchId?: string;
}

const USERS: UserDef[] = [
    { id: USER_SUPER_ADMIN, email: 'admin@aljazeera.com', roleId: ROLE_SUPER_ADMIN },
    { id: USER_BRANCH_MGR_WH, email: 'warehouse.mgr@aljazeera.com', roleId: ROLE_BRANCH_MANAGER, branchId: BRANCH_WAREHOUSE },
    { id: USER_BRANCH_MGR_R1, email: 'downtown.mgr@aljazeera.com', roleId: ROLE_BRANCH_MANAGER, branchId: BRANCH_RETAIL_1 },
    { id: USER_BRANCH_MGR_R2, email: 'industrial.mgr@aljazeera.com', roleId: ROLE_BRANCH_MANAGER, branchId: BRANCH_RETAIL_2 },
    { id: USER_WH_STAFF_1, email: 'picker1@aljazeera.com', roleId: ROLE_WAREHOUSE_STAFF, branchId: BRANCH_WAREHOUSE },
    { id: USER_WH_STAFF_2, email: 'picker2@aljazeera.com', roleId: ROLE_WAREHOUSE_STAFF, branchId: BRANCH_WAREHOUSE },
    { id: USER_POS_R1, email: 'cashier1@aljazeera.com', roleId: ROLE_POS_USER, branchId: BRANCH_RETAIL_1 },
    { id: USER_POS_R2, email: 'cashier2@aljazeera.com', roleId: ROLE_POS_USER, branchId: BRANCH_RETAIL_2 },
    { id: USER_DRIVER_1, email: 'driver1@aljazeera.com', roleId: ROLE_DRIVER, branchId: BRANCH_RETAIL_1 },
    { id: USER_DRIVER_2, email: 'driver2@aljazeera.com', roleId: ROLE_DRIVER, branchId: BRANCH_RETAIL_1 },
    { id: USER_DRIVER_3, email: 'driver3@aljazeera.com', roleId: ROLE_DRIVER, branchId: BRANCH_RETAIL_2 },
    { id: USER_DRIVER_4, email: 'driver4@aljazeera.com', roleId: ROLE_DRIVER, branchId: BRANCH_RETAIL_2 },
    { id: USER_FINANCE, email: 'finance@aljazeera.com', roleId: ROLE_FINANCE },
];

export async function seedUsers(prisma: PrismaClient) {
    console.log('  → Phase 03: Creating Users...');

    // All users share the same dev password: "Password123!"
    const passwordHash = await bcrypt.hash('Password123!', 10);

    for (const u of USERS) {
        await prisma.user.create({
            data: {
                id: u.id,
                tenantId: TENANT_ID,
                email: u.email,
                passwordHash,
                status: 'ACTIVE',
            },
        });

        // Assign role
        await prisma.userRole.create({
            data: {
                id: freshId(),
                userId: u.id,
                roleId: u.roleId,
                tenantId: TENANT_ID,
                branchId: u.branchId || null,
            },
        });
    }

    console.log(`    ✓ ${USERS.length} users created with role assignments`);
}

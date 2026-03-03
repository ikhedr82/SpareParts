/**
 * ID Registry — Pre-generates and stores UUIDs for all seeded entities
 * so that cross-phase references are consistent.
 */
import { randomUUID } from 'crypto';

// ─── Singleton ID Store ────────────────────────────────────────────
const store = new Map<string, string>();

/** Get or create a deterministic UUID for a named entity */
export function id(key: string): string {
    if (!store.has(key)) {
        store.set(key, randomUUID());
    }
    return store.get(key)!;
}

/** Generate a fresh UUID (not stored) */
export function freshId(): string {
    return randomUUID();
}

// ─── Pre-defined Entity Keys ───────────────────────────────────────

// Tenant
export const TENANT_ID = id('tenant:aljazeera');

// Branches
export const BRANCH_WAREHOUSE = id('branch:central-warehouse');
export const BRANCH_RETAIL_1 = id('branch:downtown-retail');
export const BRANCH_RETAIL_2 = id('branch:industrial-retail');

// Users
export const USER_SUPER_ADMIN = id('user:super-admin');
export const USER_BRANCH_MGR_WH = id('user:branch-mgr-warehouse');
export const USER_BRANCH_MGR_R1 = id('user:branch-mgr-retail1');
export const USER_BRANCH_MGR_R2 = id('user:branch-mgr-retail2');
export const USER_WH_STAFF_1 = id('user:wh-staff-1');
export const USER_WH_STAFF_2 = id('user:wh-staff-2');
export const USER_POS_R1 = id('user:pos-retail1');
export const USER_POS_R2 = id('user:pos-retail2');
export const USER_DRIVER_1 = id('user:driver-1');
export const USER_DRIVER_2 = id('user:driver-2');
export const USER_DRIVER_3 = id('user:driver-3');
export const USER_DRIVER_4 = id('user:driver-4');
export const USER_FINANCE = id('user:finance');

// Roles
export const ROLE_SUPER_ADMIN = id('role:super-admin');
export const ROLE_BRANCH_MANAGER = id('role:branch-manager');
export const ROLE_WAREHOUSE_STAFF = id('role:warehouse-staff');
export const ROLE_POS_USER = id('role:pos-user');
export const ROLE_DRIVER = id('role:driver');
export const ROLE_FINANCE = id('role:finance');

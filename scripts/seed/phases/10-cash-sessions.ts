/**
 * Phase 10 — Cash Sessions
 * Creates historical closed sessions + currently active sessions.
 */
import { PrismaClient } from '@prisma/client';
import {
    TENANT_ID, BRANCH_RETAIL_1, BRANCH_RETAIL_2,
    USER_POS_R1, USER_POS_R2, USER_BRANCH_MGR_R1, USER_BRANCH_MGR_R2,
    id,
} from '../helpers/ids';
import { dateAt, today } from '../helpers/dates';

export async function seedCashSessions(prisma: PrismaClient) {
    console.log('  → Phase 10: Creating Cash Sessions...');

    // ── Historical closed sessions (past 3 days per branch) ──
    const closedSessions = [
        // Retail 1 — 3 days ago
        { key: 'session:r1-d3', branch: BRANCH_RETAIL_1, user: USER_POS_R1, closedBy: USER_BRANCH_MGR_R1, day: 3, openHour: 8, closeHour: 18, openCash: 500, closeCash: 2350, expectedCash: 2380, diff: -30 },
        // Retail 1 — 2 days ago
        { key: 'session:r1-d2', branch: BRANCH_RETAIL_1, user: USER_POS_R1, closedBy: USER_BRANCH_MGR_R1, day: 2, openHour: 8, closeHour: 18, openCash: 500, closeCash: 1980, expectedCash: 1980, diff: 0 },
        // Retail 1 — yesterday
        { key: 'session:r1-d1', branch: BRANCH_RETAIL_1, user: USER_POS_R1, closedBy: USER_BRANCH_MGR_R1, day: 1, openHour: 8, closeHour: 18, openCash: 500, closeCash: 3120, expectedCash: 3100, diff: 20 },
        // Retail 2 — 3 days ago
        { key: 'session:r2-d3', branch: BRANCH_RETAIL_2, user: USER_POS_R2, closedBy: USER_BRANCH_MGR_R2, day: 3, openHour: 9, closeHour: 19, openCash: 300, closeCash: 1890, expectedCash: 1900, diff: -10 },
        // Retail 2 — 2 days ago
        { key: 'session:r2-d2', branch: BRANCH_RETAIL_2, user: USER_POS_R2, closedBy: USER_BRANCH_MGR_R2, day: 2, openHour: 9, closeHour: 19, openCash: 300, closeCash: 2240, expectedCash: 2240, diff: 0 },
        // Retail 2 — yesterday
        { key: 'session:r2-d1', branch: BRANCH_RETAIL_2, user: USER_POS_R2, closedBy: USER_BRANCH_MGR_R2, day: 1, openHour: 9, closeHour: 19, openCash: 300, closeCash: 1650, expectedCash: 1670, diff: -20 },
    ];

    for (const s of closedSessions) {
        await prisma.cashSession.create({
            data: {
                id: id(s.key),
                tenantId: TENANT_ID,
                branchId: s.branch,
                openedById: s.user,
                openedAt: dateAt(s.day, s.openHour),
                closedAt: dateAt(s.day, s.closeHour),
                closedByUserId: s.closedBy,
                openingCash: s.openCash,
                closingCash: s.closeCash,
                expectedCash: s.expectedCash,
                difference: s.diff,
                status: 'CLOSED',
            },
        });
    }

    // ── Active sessions (today) ──
    const activeSessions = [
        { key: 'session:r1-today', branch: BRANCH_RETAIL_1, user: USER_POS_R1, openCash: 500 },
        { key: 'session:r2-today', branch: BRANCH_RETAIL_2, user: USER_POS_R2, openCash: 300 },
    ];

    for (const s of activeSessions) {
        await prisma.cashSession.create({
            data: {
                id: id(s.key),
                tenantId: TENANT_ID,
                branchId: s.branch,
                openedById: s.user,
                openedAt: today(8, 0),
                openingCash: s.openCash,
                status: 'OPEN',
            },
        });
    }

    console.log(`    ✓ ${closedSessions.length} closed + ${activeSessions.length} active sessions`);
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    var _a;
    console.log('🌱 Seeding Platform Hardening Demo Data...');
    const tenant = await prisma.tenant.findUnique({
        where: { subdomain: 'alpha' },
        include: { subscription: true }
    });
    if (!tenant) {
        console.error('❌ Tenant "alpha" not found. Run npm run seed:demo first.');
        return;
    }
    const platformAdmin = await prisma.user.findFirst({
        where: { isPlatformUser: true }
    });
    if (!platformAdmin) {
        console.warn('⚠️ No platform admin found. Falling back to any available user for audit logs.');
    }
    const anyUser = platformAdmin || await prisma.user.findFirst();
    if (!anyUser) {
        console.error('❌ No users found to associate with audit logs.');
        return;
    }
    console.log('🎫 Seeding Support Tickets...');
    const tickets = [
        { subject: 'Database Sync Latency', description: 'Observed intermittent delays in product synchronization.', status: 'OPEN', priority: 'HIGH' },
        { subject: 'API Key Rotation Protocol', description: 'Requesting documentation for automated key rotation.', status: 'IN_PROGRESS', priority: 'MEDIUM' },
        { subject: 'Billing Discrepancy (Feb)', description: 'Invoice #882 shows incorrect tax calculation.', status: 'CLOSED', priority: 'LOW' },
        { subject: 'Branch Node Provisioning Error', description: 'Unable to provision node in Alexandria cluster.', status: 'OPEN', priority: 'CRITICAL' },
    ];
    for (const t of tickets) {
        await prisma.supportTicket.create({
            data: {
                tenantId: tenant.id,
                subject: t.subject,
                description: t.description,
                status: t.status,
                priority: t.priority,
            }
        });
    }
    console.log('🧾 Seeding Financial Ledger...');
    for (let i = 1; i <= 5; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        await prisma.billingInvoice.create({
            data: {
                tenantId: tenant.id,
                subscriptionId: (_a = tenant.subscription) === null || _a === void 0 ? void 0 : _a.id,
                amount: 49.00 + (Math.random() * 50),
                currency: 'USD',
                status: i === 1 ? 'PAID' : 'ISSUED',
                dueDate: new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000),
                createdAt: date,
                paidAt: i === 1 ? date : null,
            }
        });
    }
    console.log('📊 Seeding Usage Pulse...');
    const metrics = ['USERS', 'BRANCHES', 'PRODUCTS', 'STORAGE'];
    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        for (const m of metrics) {
            await prisma.usageMetric.create({
                data: {
                    tenantId: tenant.id,
                    metricType: m,
                    value: Math.floor(Math.random() * 100) + 1,
                    timestamp: date,
                }
            });
        }
    }
    console.log('⏱️ Seeding Ecosystem Pulse...');
    const actions = ['CREATE_USER', 'UPDATE_PLAN', 'SUSPEND_TENANT', 'GENERATE_INVOICE', 'RESOLVE_TICKET'];
    for (let i = 0; i < 20; i++) {
        const date = new Date();
        date.setHours(date.getHours() - i * 2);
        await prisma.auditLog.create({
            data: {
                tenantId: tenant.id,
                userId: anyUser.id,
                action: actions[Math.floor(Math.random() * actions.length)],
                entityType: 'PLATFORM_ADMIN',
                entityId: tenant.id,
                newValue: { info: 'Automated seeding event for demonstration' },
                ipAddress: '127.0.0.1',
                createdAt: date,
            }
        });
    }
    console.log('✅ Hardening Demo Data Seeded Successfully!');
}
main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=harden-seed.js.map
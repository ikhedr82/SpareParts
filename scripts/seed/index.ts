/**
 * Seed Orchestrator
 * Runs all 16 phases in dependency-safe order.
 *
 * Usage:       npx ts-node scripts/seed/index.ts
 * Reset first: npx ts-node scripts/seed/index.ts --reset
 */
import { PrismaClient } from '@prisma/client';

import { seedTenant } from './phases/01-tenant';
import { seedRolesPermissions } from './phases/02-roles-permissions';
import { seedUsers } from './phases/03-users';
import { seedBranches } from './phases/04-branches';
import { seedSuppliers } from './phases/05-suppliers';
import { seedCatalog } from './phases/06-catalog';
import { seedTaxRates } from './phases/07-tax-rates';
import { seedInventory } from './phases/08-inventory';
import { seedCustomersAndBuyers } from './phases/09-customers-buyers';
import { seedCashSessions } from './phases/10-cash-sessions';
import { seedSales } from './phases/11-sales-pos';
import { seedOrdersFlow } from './phases/12-orders-flow';
import { seedLogistics } from './phases/13-logistics';
import { seedProcurement } from './phases/14-procurement';
import { seedFinance } from './phases/15-finance';
import { seedReturnsRefunds } from './phases/16-returns-refunds';
import { TENANT_ID } from './helpers/ids';

const prisma = new PrismaClient();

async function resetDatabase() {
    console.log('🗑️  Resetting database...');

    // Delete in reverse dependency order to respect FK constraints
    const tables = [
        'manifest_orders', 'shipment_manifests',
        'tax_filings',
        'chargeback_resolutions', 'chargebacks',
        'branch_transfer_items', 'branch_transfers',
        'shortage_substitutions',
        'order_fulfillment_lines',
        'supplier_invoice_items', 'supplier_invoices',
        'return_to_warehouse',
        'idempotency_records', 'outbox_events',
        'proof_of_delivery',
        'delivery_exceptions',
        'trip_packs', 'trip_stops', 'delivery_trips',
        'pack_items', 'packs',
        'pick_list_items', 'pick_lists',
        'return_items', 'returns',
        'refund_items', 'refunds',
        'cart_items', 'carts',
        'order_items', 'orders',
        'revenue_ledger', 'inventory_ledger',
        'accounting_events', 'journal_lines', 'journal_entries',
        'accounting_periods',
        'invoice_lines', 'invoices',
        'receipts',
        'stripe_payments',
        'z_reports',
        'sale_items', 'payments', 'sales',
        'cash_sessions',
        'purchase_return_items', 'purchase_returns',
        'purchase_order_receipt_items', 'purchase_order_receipts',
        'purchase_order_items', 'purchase_orders',
        'product_suppliers',
        'substitutions',
        'product_sources', 'data_sources',
        'product_fitments', 'alternate_part_numbers',
        'quote_items', 'quotes',
        'price_rules',
        'business_client_addresses', 'business_client_contacts', 'business_clients',
        'inventory',
        'products', 'product_categories', 'brands',
        'tax_rates',
        'suppliers', 'customers',
        'audit_logs', 'chart_of_accounts',
        'drivers', 'vehicles', 'fulfillment_providers',
        'user_roles', 'role_permissions', 'permissions', 'roles',
        'users', 'branches', 'tenants',
    ];

    for (const table of tables) {
        try {
            await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
        } catch (e) {
            // Table might not exist yet, skip
        }
    }

    console.log('    ✓ Database reset complete\n');
}

async function main() {
    const startTime = Date.now();
    const shouldReset = process.argv.includes('--reset');

    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║     Al Jazeera Auto Parts — Production Data Seeder       ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    try {
        if (shouldReset) {
            await resetDatabase();
        }

        // ── Foundation Layer ──
        console.log('📦 Foundation Layer');
        await seedTenant(prisma);          // Phase 01
        await seedBranches(prisma);        // Phase 04 (must exist before users)
        await seedRolesPermissions(prisma); // Phase 02
        await seedUsers(prisma);           // Phase 03

        // ── Catalog & Reference Data ──
        console.log('\n📋 Catalog & Reference Data');
        await seedSuppliers(prisma);       // Phase 05
        await seedCatalog(prisma);         // Phase 06
        await seedTaxRates(prisma);        // Phase 07

        // ── Operational Data ──
        console.log('\n🏪 Operational Data');
        await seedInventory(prisma);       // Phase 08
        await seedCustomersAndBuyers(prisma); // Phase 09
        await seedCashSessions(prisma);    // Phase 10

        // ── Transactions ──
        console.log('\n💰 Transactions');
        await seedSales(prisma);           // Phase 11
        await seedOrdersFlow(prisma);      // Phase 12

        // ── Logistics ──
        console.log('\n🚚 Logistics');
        await seedLogistics(prisma);       // Phase 13

        // ── Procurement ──
        console.log('\n📦 Procurement');
        await seedProcurement(prisma);     // Phase 14

        // ── Finance ──
        console.log('\n💵 Finance');
        await seedFinance(prisma);         // Phase 15

        // ── Returns & Refunds ──
        console.log('\n🔄 Returns & Refunds');
        await seedReturnsRefunds(prisma);  // Phase 16

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log(`║  ✅ Seeding complete! (${elapsed}s)                          ║`);
        console.log(`║  Tenant ID: ${TENANT_ID.substring(0, 36)}  ║`);
        console.log('╚═══════════════════════════════════════════════════════════╝');

    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();

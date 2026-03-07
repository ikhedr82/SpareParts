/**
 * Phase 09 — Customers & Business Clients
 * Creates walk-in customers (POS) and B2B business clients (workshops/retailers).
 */
import { PrismaClient } from '@prisma/client';
import { TENANT_ID, id, freshId } from '../helpers/ids';

const WALK_IN_CUSTOMERS = [
    { key: 'cust:ahmed', name: 'Ahmed Mohamed', phone: '+20-100-111-2233', email: 'ahmed.m@gmail.com' },
    { key: 'cust:fatma', name: 'Fatma Hassan', phone: '+20-101-222-3344', email: 'fatma.h@gmail.com' },
    { key: 'cust:omar', name: 'Omar Ali', phone: '+20-102-333-4455', email: null },
    { key: 'cust:sara', name: 'Sara Ibrahim', phone: '+20-106-444-5566', email: 'sara.i@outlook.com' },
    { key: 'cust:karim', name: 'Karim Youssef', phone: '+20-109-555-6677', email: null },
    { key: 'cust:mona', name: 'Mona Khaled', phone: '+20-111-666-7788', email: 'mona.k@yahoo.com' },
    { key: 'cust:tarek', name: 'Tarek Mahmoud', phone: '+20-112-777-8899', email: null },
    { key: 'cust:nour', name: 'Nour El-Din', phone: '+20-114-888-9900', email: 'nour.d@gmail.com' },
    { key: 'cust:heba', name: 'Heba Mostafa', phone: '+20-115-999-0011', email: null },
    { key: 'cust:yasser', name: 'Yasser Abdel-Fattah', phone: '+20-120-000-1122', email: 'yasser.af@gmail.com' },
];

const BUSINESS_CLIENTS = [
    // Workshops
    { key: 'bc:sphinx', type: 'WORKSHOP' as const, name: 'Sphinx Auto Workshop', regNo: 'CR-2019-4521', taxId: 'TAX-EG-8001', email: 'info@sphinxauto.com', phone: '+20-2-3344-5001', creditLimit: 50000, paymentDays: 30 },
    { key: 'bc:pharaoh', type: 'WORKSHOP' as const, name: 'Pharaoh Motors Service', regNo: 'CR-2020-1187', taxId: 'TAX-EG-8002', email: 'service@pharaoh-motors.com', phone: '+20-2-3344-5002', creditLimit: 30000, paymentDays: 15 },
    { key: 'bc:pyramids', type: 'WORKSHOP' as const, name: 'Pyramids Quick Fix', regNo: 'CR-2021-7723', taxId: 'TAX-EG-8003', email: 'orders@pyramidsfix.com', phone: '+20-2-3344-5003', creditLimit: 20000, paymentDays: 7 },
    { key: 'bc:lotus', type: 'WORKSHOP' as const, name: 'Lotus Garage & Tuning', regNo: 'CR-2022-3309', taxId: 'TAX-EG-8004', email: 'lotus@garagetuning.com', phone: '+20-2-3344-5004', creditLimit: 25000, paymentDays: 30 },
    // Retailers
    { key: 'bc:oasis', type: 'RETAILER' as const, name: 'Oasis Parts Retail', regNo: 'CR-2018-6645', taxId: 'TAX-EG-9001', email: 'buy@oasisparts.com', phone: '+20-2-5566-7001', creditLimit: 80000, paymentDays: 45 },
    { key: 'bc:sahara', type: 'RETAILER' as const, name: 'Sahara Auto Supply', regNo: 'CR-2019-2281', taxId: 'TAX-EG-9002', email: 'orders@saharasupply.com', phone: '+20-2-5566-7002', creditLimit: 60000, paymentDays: 30 },
    { key: 'bc:delta', type: 'RETAILER' as const, name: 'Delta Parts Trading', regNo: 'CR-2020-9917', taxId: 'TAX-EG-9003', email: 'procurement@deltaparts.com', phone: '+20-2-5566-7003', creditLimit: 40000, paymentDays: 30 },
    { key: 'bc:sinai', type: 'RETAILER' as const, name: 'Sinai Automotive', regNo: 'CR-2021-5553', taxId: 'TAX-EG-9004', email: 'info@sinaiautomotive.com', phone: '+20-2-5566-7004', creditLimit: 35000, paymentDays: 15 },
];

export async function seedCustomersAndBuyers(prisma: PrismaClient) {
    console.log('  → Phase 09: Creating Customers & Business Clients...');

    // 1. Walk-in customers
    for (const c of WALK_IN_CUSTOMERS) {
        await prisma.customer.create({
            data: {
                id: id(c.key),
                tenantId: TENANT_ID,
                name: c.name,
                phone: c.phone,
                email: c.email,
                balance: 0,
            },
        });
    }

    // 2. Business clients with contacts and addresses
    for (const bc of BUSINESS_CLIENTS) {
        const clientId = id(bc.key);
        await prisma.businessClient.create({
            data: {
                id: clientId,
                tenantId: TENANT_ID,
                type: bc.type,
                businessName: bc.name,
                registrationNumber: bc.regNo,
                taxId: bc.taxId,
                primaryEmail: bc.email,
                primaryPhone: bc.phone,
                creditLimit: bc.creditLimit,
                paymentTermsDays: bc.paymentDays,
                paymentTerms: `Net ${bc.paymentDays}`,
                currency: 'EGP',
                status: 'ACTIVE',
            },
        });

        // Add primary contact
        await prisma.businessClientContact.create({
            data: {
                id: id(`${bc.key}:contact`),
                businessClientId: clientId,
                name: `${bc.name} - Procurement`,
                position: 'Procurement Manager',
                email: bc.email,
                phone: bc.phone,
                isPrimary: true,
                canPlaceOrders: true,
            },
        });

        // Add delivery address
        await prisma.businessClientAddress.create({
            data: {
                id: id(`${bc.key}:addr`),
                businessClientId: clientId,
                type: 'DELIVERY',
                addressLine1: `${Math.floor(Math.random() * 200) + 1} ${bc.type === 'WORKSHOP' ? 'Workshop Zone' : 'Commercial District'}`,
                city: 'Cairo',
                state: 'Cairo Governorate',
                postalCode: `${11000 + Math.floor(Math.random() * 900)}`,
                country: 'Egypt',
                isPrimary: true,
            },
        });
    }

    console.log(`    ✓ ${WALK_IN_CUSTOMERS.length} customers, ${BUSINESS_CLIENTS.length} business clients`);
}

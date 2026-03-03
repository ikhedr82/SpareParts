/**
 * Phase 13 — Logistics
 * Creates drivers, vehicles, fulfillment providers, and delivery trips.
 * Links trips to orders via stops, and loads packs.
 *
 * Trip types:
 *   - 5 COMPLETED (linked to DELIVERED orders)
 *   - 2 IN_TRANSIT (linked to OUT_FOR_DELIVERY orders)
 *   - 1 FAILED (linked to DELIVERY_FAILED order)
 *   - 2 PLANNED (future trips)
 */
import { PrismaClient } from '@prisma/client';
import {
    TENANT_ID, BRANCH_RETAIL_1, BRANCH_RETAIL_2,
    USER_DRIVER_1, USER_DRIVER_2, USER_DRIVER_3, USER_DRIVER_4,
    id, freshId,
} from '../helpers/ids';
import { daysAgo, dateAt, today } from '../helpers/dates';

export async function seedLogistics(prisma: PrismaClient) {
    console.log('  → Phase 13: Creating Logistics...');

    // ── 1. Create 4 Drivers ──
    const drivers = [
        { id: id('driver:1'), branchId: BRANCH_RETAIL_1, userId: USER_DRIVER_1, name: 'Mohamed Saeed', phone: '+20-100-101-0001' },
        { id: id('driver:2'), branchId: BRANCH_RETAIL_1, userId: USER_DRIVER_2, name: 'Hassan Abdo', phone: '+20-100-101-0002' },
        { id: id('driver:3'), branchId: BRANCH_RETAIL_2, userId: USER_DRIVER_3, name: 'Ali Farouk', phone: '+20-100-101-0003' },
        { id: id('driver:4'), branchId: BRANCH_RETAIL_2, userId: USER_DRIVER_4, name: 'Mahmoud Radi', phone: '+20-100-101-0004' },
    ];

    for (const d of drivers) {
        await prisma.driver.create({
            data: {
                id: d.id,
                tenantId: TENANT_ID,
                branchId: d.branchId,
                name: d.name,
                phone: d.phone,
                isActive: true,
            },
        });
    }

    // ── 2. Create 4 Vehicles ──
    const vehicles = [
        { id: id('vehicle:1'), branchId: BRANCH_RETAIL_1, plate: 'CAI-1234', type: 'VAN' as const, capacity: 800 },
        { id: id('vehicle:2'), branchId: BRANCH_RETAIL_1, plate: 'CAI-5678', type: 'TRUCK' as const, capacity: 2000 },
        { id: id('vehicle:3'), branchId: BRANCH_RETAIL_2, plate: 'GIZ-9012', type: 'VAN' as const, capacity: 800 },
        { id: id('vehicle:4'), branchId: BRANCH_RETAIL_2, plate: 'GIZ-3456', type: 'TRUCK' as const, capacity: 2000 },
    ];

    for (const v of vehicles) {
        await prisma.vehicle.create({
            data: {
                id: v.id,
                tenantId: TENANT_ID,
                branchId: v.branchId,
                plateNumber: v.plate,
                type: v.type,
                capacityKg: v.capacity,
                isActive: true,
            },
        });
    }

    // ── 3. Fulfillment Provider ──
    const fpId = id('fp:aramex');
    await prisma.fulfillmentProvider.create({
        data: {
            id: fpId,
            tenantId: TENANT_ID,
            name: 'Aramex Egypt',
            mode: 'EXTERNAL_COURIER',
            phone: '+20-2-2222-0000',
            isActive: true,
        },
    });

    // ── 4. Delivery Trips ──
    const tripDefs = [
        // COMPLETED trips (linked to DELIVERED orders 1-5)
        { key: 'trip:1', branch: BRANCH_RETAIL_1, driver: drivers[0].id, vehicle: vehicles[0].id, status: 'COMPLETED', daysBack: 13, orderKeys: ['order:1', 'order:2'], mode: 'INTERNAL_FLEET' as const },
        { key: 'trip:2', branch: BRANCH_RETAIL_2, driver: drivers[2].id, vehicle: vehicles[2].id, status: 'COMPLETED', daysBack: 9, orderKeys: ['order:3'], mode: 'INTERNAL_FLEET' as const },
        { key: 'trip:3', branch: BRANCH_RETAIL_2, driver: drivers[3].id, vehicle: vehicles[3].id, status: 'COMPLETED', daysBack: 7, orderKeys: ['order:4'], mode: 'INTERNAL_FLEET' as const },
        { key: 'trip:4', branch: BRANCH_RETAIL_1, driver: drivers[1].id, vehicle: vehicles[1].id, status: 'COMPLETED', daysBack: 5, orderKeys: ['order:5'], mode: 'INTERNAL_FLEET' as const },
        // IN_TRANSIT (linked to OUT_FOR_DELIVERY orders 8-10)
        { key: 'trip:5', branch: BRANCH_RETAIL_1, driver: drivers[0].id, vehicle: vehicles[0].id, status: 'IN_TRANSIT', daysBack: 0, orderKeys: ['order:8'], mode: 'INTERNAL_FLEET' as const },
        { key: 'trip:6', branch: BRANCH_RETAIL_2, driver: drivers[2].id, vehicle: vehicles[2].id, status: 'IN_TRANSIT', daysBack: 0, orderKeys: ['order:9', 'order:10'], mode: 'INTERNAL_FLEET' as const },
        // FAILED (linked to DELIVERY_FAILED order 11)
        { key: 'trip:7', branch: BRANCH_RETAIL_1, driver: drivers[1].id, vehicle: vehicles[1].id, status: 'FAILED', daysBack: 3, orderKeys: ['order:11'], mode: 'INTERNAL_FLEET' as const },
        // PLANNED (future)
        { key: 'trip:8', branch: BRANCH_RETAIL_1, driver: drivers[0].id, vehicle: vehicles[0].id, status: 'PLANNED', daysBack: 0, orderKeys: ['order:23', 'order:25'], mode: 'INTERNAL_FLEET' as const },
        { key: 'trip:9', branch: BRANCH_RETAIL_2, driver: drivers[3].id, vehicle: vehicles[3].id, status: 'PLANNED', daysBack: 0, orderKeys: ['order:24'], mode: 'INTERNAL_FLEET' as const },
        // EXTERNAL COURIER trip
        { key: 'trip:10', branch: BRANCH_RETAIL_1, driver: null, vehicle: null, status: 'COMPLETED', daysBack: 4, orderKeys: [], mode: 'EXTERNAL_COURIER' as const },
    ];

    for (const tripDef of tripDefs) {
        const tripId = id(tripDef.key);
        const startedAt = ['IN_TRANSIT', 'COMPLETED', 'FAILED'].includes(tripDef.status)
            ? dateAt(tripDef.daysBack, 8, 30) : null;
        const completedAt = ['COMPLETED', 'FAILED'].includes(tripDef.status)
            ? dateAt(tripDef.daysBack, 16, 0) : null;

        await prisma.deliveryTrip.create({
            data: {
                id: tripId,
                tenantId: TENANT_ID,
                branchId: tripDef.branch,
                driverId: tripDef.driver,
                vehicleId: tripDef.vehicle,
                mode: tripDef.mode,
                fulfillmentProviderId: tripDef.mode === 'EXTERNAL_COURIER' ? fpId : null,
                status: tripDef.status as any,
                startedAt,
                completedAt,
                totalStops: tripDef.orderKeys.length,
                totalPacks: tripDef.orderKeys.length,
            },
        });

        // Create stops for each order
        for (let seq = 0; seq < tripDef.orderKeys.length; seq++) {
            const orderKey = tripDef.orderKeys[seq];
            const orderId = id(orderKey);

            // Determine stop status
            let stopStatus: string;
            if (tripDef.status === 'COMPLETED') stopStatus = 'DELIVERED';
            else if (tripDef.status === 'FAILED') stopStatus = 'FAILED';
            else if (tripDef.status === 'IN_TRANSIT') stopStatus = seq === 0 ? 'ARRIVED' : 'PENDING';
            else stopStatus = 'PENDING';

            const stopId = freshId();
            await prisma.tripStop.create({
                data: {
                    id: stopId,
                    tripId,
                    orderId,
                    stopType: 'CUSTOMER',
                    sequence: seq + 1,
                    status: stopStatus as any,
                    arrivalTime: stopStatus !== 'PENDING' ? dateAt(tripDef.daysBack, 10 + seq * 2) : null,
                    completionTime: stopStatus === 'DELIVERED' ? dateAt(tripDef.daysBack, 10 + seq * 2 + 1) : null,
                    completedAt: stopStatus === 'DELIVERED' ? dateAt(tripDef.daysBack, 10 + seq * 2 + 1) : null,
                    failureReason: stopStatus === 'FAILED' ? 'Customer unavailable at delivery address' : null,
                },
            });

            // Add proof of delivery for delivered stops
            if (stopStatus === 'DELIVERED') {
                await prisma.proofOfDelivery.create({
                    data: {
                        id: freshId(),
                        tripStopId: stopId,
                        signerName: 'Authorized Receiver',
                        notes: 'Package received in good condition',
                        capturedAt: dateAt(tripDef.daysBack, 10 + seq * 2 + 1),
                        locationLat: 30.0444 + Math.random() * 0.05,
                        locationLng: 31.2357 + Math.random() * 0.05,
                    },
                });
            }

            // Create delivery exception for failed stops
            if (stopStatus === 'FAILED') {
                await prisma.deliveryException.create({
                    data: {
                        id: id(`exception:${orderKey}`),
                        tenantId: TENANT_ID,
                        tripStopId: stopId,
                        exceptionType: 'CUSTOMER_UNAVAILABLE',
                        description: 'Customer not available at delivery address. Multiple call attempts failed.',
                        reportedBy: tripDef.driver || 'system',
                        reportedAt: dateAt(tripDef.daysBack, 14),
                        resolved: false,
                    },
                });
            }

            // Load pack onto trip
            const packId = id(`pack:${orderKey}`);
            const pack = await prisma.pack.findUnique({ where: { id: packId } });
            if (pack) {
                await prisma.tripPack.create({
                    data: {
                        id: freshId(),
                        tripId,
                        packId,
                        loadedAt: dateAt(tripDef.daysBack, 8),
                        deliveredAt: stopStatus === 'DELIVERED' ? dateAt(tripDef.daysBack, 10 + seq * 2 + 1) : null,
                    },
                });
            }
        }
    }

    // Set currentTripId for in-transit drivers
    await prisma.driver.update({ where: { id: drivers[0].id }, data: { currentTripId: id('trip:5') } });
    await prisma.driver.update({ where: { id: drivers[2].id }, data: { currentTripId: id('trip:6') } });
    await prisma.vehicle.update({ where: { id: vehicles[0].id }, data: { currentTripId: id('trip:5') } });
    await prisma.vehicle.update({ where: { id: vehicles[2].id }, data: { currentTripId: id('trip:6') } });

    console.log(`    ✓ ${drivers.length} drivers, ${vehicles.length} vehicles, ${tripDefs.length} trips`);
}

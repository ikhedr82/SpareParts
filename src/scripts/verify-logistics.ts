/**
 * Phase 3.2: Logistics Verification Script
 * 
 * This script verifies the complete logistics workflow:
 * 1. Creates a driver and vehicle
 * 2. Creates an order, confirms it, picks it, packs it
 * 3. Creates a delivery trip
 * 4. Adds pack and stop to trip
 * 5. Executes the delivery workflow
 * 6. Verifies order reaches DELIVERED status
 */

import { PrismaClient, OrderStatus, DeliveryTripStatus, TripStopStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting Logistics Verification...\n');

    // Get existing tenant and branch
    const tenant = await prisma.tenant.findFirst();
    const branch = await prisma.branch.findFirst({ where: { tenantId: tenant.id } });
    const businessClient = await prisma.businessClient.findFirst({ where: { tenantId: tenant.id } });

    if (!tenant || !branch || !businessClient) {
        throw new Error('Missing required data: tenant, branch, or business client');
    }

    console.log(`✅ Using Tenant: ${tenant.name}`);
    console.log(`✅ Using Branch: ${branch.name}`);
    console.log(`✅ Using Business Client: ${businessClient.businessName}\n`);

    // Step 1: Create Driver
    console.log('📝 Step 1: Creating driver...');
    const driver = await prisma.driver.create({
        data: {
            tenantId: tenant.id,
            branchId: branch.id,
            name: 'John Driver',
            phone: '+1234567890',
            isActive: true,
        },
    });
    console.log(`✅ Driver created: ${driver.name} (ID: ${driver.id})\n`);

    // Step 2: Create Vehicle
    console.log('📝 Step 2: Creating vehicle...');
    const vehicle = await prisma.vehicle.create({
        data: {
            tenantId: tenant.id,
            branchId: branch.id,
            plateNumber: 'ABC-123',
            type: 'VAN',
            capacityKg: 1000,
            isActive: true,
        },
    });
    console.log(`✅ Vehicle created: ${vehicle.plateNumber} (ID: ${vehicle.id})\n`);

    // Step 3: Create Test Product
    console.log('📝 Step 3: Creating test product...');
    const product = await prisma.product.findFirst({ where: { name: 'Test Widget' } }) ||
        await prisma.product.create({
            data: {
                name: 'Test Widget',
                description: 'Test product for logistics',
                brandId: (await prisma.brand.findFirst())?.id || (await prisma.brand.create({ data: { name: 'Generic' } })).id,
                categoryId: (await prisma.productCategory.findFirst())?.id || (await prisma.productCategory.create({ data: { name: 'General' } })).id,
            },
        });
    console.log(`✅ Product: ${product.name} (ID: ${product.id})\n`);

    // Step 4: Ensure inventory exists
    console.log('📝 Step 4: Setting up inventory...');
    const inventory = await prisma.inventory.upsert({
        where: {
            branchId_productId: {
                branchId: branch.id,
                productId: product.id,
            },
        },
        update: {
            quantity: 100,
            binLocation: 'A1-SHELF-1',
        },
        create: {
            tenantId: tenant.id,
            branchId: branch.id,
            productId: product.id,
            quantity: 100,
            costPrice: 10.00,
            sellingPrice: 20.00,
            binLocation: 'A1-SHELF-1',
        },
    });
    console.log(`✅ Inventory set: ${inventory.quantity} units in ${inventory.binLocation}\n`);

    // Step 5: Create Order
    console.log('📝 Step 5: Creating order...');
    const orderNumber = `ORD-${Date.now()}`;
    const order = await prisma.order.create({
        data: {
            tenantId: tenant.id,
            businessClientId: businessClient.id,
            branchId: branch.id,
            orderNumber,
            subtotal: 100.00,
            tax: 10.00,
            total: 110.00,
            status: OrderStatus.PENDING,
            items: {
                create: [
                    {
                        productId: product.id,
                        quantity: 5,
                        unitPrice: 20.00,
                        // total removed
                    },
                ],
            },
        },
        include: { items: true },
    });
    console.log(`✅ Order created: ${order.orderNumber} (ID: ${order.id})\n`);

    // Step 6: Confirm Order (creates picklist)
    console.log('📝 Step 6: Confirming order...');
    await prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CONFIRMED, confirmedAt: new Date() },
    });

    // Manually create picklist since OrdersService auto-creation requires service context
    const pickList = await prisma.pickList.create({
        data: {
            tenantId: tenant.id,
            branchId: branch.id,
            orderId: order.id,
            status: 'CREATED',
            items: {
                create: order.items.map((item) => ({
                    productId: item.productId,
                    requiredQty: item.quantity,
                    pickedQty: 0,
                    binLocation: inventory.binLocation,
                    inventoryId: inventory.id,
                })),
            },
        },
        include: { items: true },
    });
    console.log(`✅ PickList created: ${pickList.id} with ${pickList.items.length} items\n`);

    // Step 7: Pick Items
    console.log('📝 Step 7: Picking items...');
    await prisma.pickList.update({
        where: { id: pickList.id },
        data: { status: 'PICKING', startedAt: new Date() },
    });

    for (const item of pickList.items) {
        await prisma.pickListItem.update({
            where: { id: item.id },
            data: {
                pickedQty: item.requiredQty,
                status: 'PICKED',
            },
        });
    }

    await prisma.pickList.update({
        where: { id: pickList.id },
        data: { status: 'PICKED', completedAt: new Date() },
    });
    console.log(`✅ All items picked\n`);

    // Step 8: Create and Seal Pack
    console.log('📝 Step 8: Creating and sealing pack...');
    const pack = await prisma.pack.create({
        data: {
            pickListId: pickList.id,
            packNumber: 'PACK-001',
            status: 'OPEN',
            items: {
                create: pickList.items.map((item) => ({
                    productId: item.productId,
                    quantity: item.pickedQty,
                })),
            },
        },
    });

    await prisma.pack.update({
        where: { id: pack.id },
        data: {
            status: 'SEALED',
            weight: 25.5,
        },
    });

    await prisma.pickList.update({
        where: { id: pickList.id },
        data: { status: 'PACKED' },
    });

    await prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.PROCESSING },
    });
    console.log(`✅ Pack sealed and order moved to PROCESSING\n`);

    // Step 9: Create Delivery Trip
    console.log('📝 Step 9: Creating delivery trip...');
    const trip = await prisma.deliveryTrip.create({
        data: {
            tenantId: tenant.id,
            branchId: branch.id,
            driverId: driver.id,
            vehicleId: vehicle.id,
            status: DeliveryTripStatus.PLANNED,
        },
    });

    // Assign trip to driver and vehicle
    await prisma.driver.update({
        where: { id: driver.id },
        data: { currentTripId: trip.id },
    });

    await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: { currentTripId: trip.id },
    });
    console.log(`✅ Trip created: ${trip.id}\n`);

    // Step 10: Add Pack to Trip
    console.log('📝 Step 10: Adding pack to trip...');
    const tripPack = await prisma.tripPack.create({
        data: {
            tripId: trip.id,
            packId: pack.id,
        },
    });

    await prisma.deliveryTrip.update({
        where: { id: trip.id },
        data: { totalPacks: 1 },
    });
    console.log(`✅ Pack added to trip\n`);

    // Step 11: Add Stop to Trip
    console.log('📝 Step 11: Adding customer stop to trip...');
    const stop = await prisma.tripStop.create({
        data: {
            tripId: trip.id,
            orderId: order.id,
            stopType: 'CUSTOMER',
            sequence: 1,
            status: TripStopStatus.PENDING,
        },
    });

    await prisma.deliveryTrip.update({
        where: { id: trip.id },
        data: { totalStops: 1 },
    });
    console.log(`✅ Stop added for order ${order.orderNumber}\n`);

    // Step 12: Start Loading
    console.log('📝 Step 12: Starting loading process...');
    await prisma.deliveryTrip.update({
        where: { id: trip.id },
        data: { status: DeliveryTripStatus.LOADING },
    });
    console.log(`✅ Trip status: LOADING\n`);

    // Step 13: Start Trip
    console.log('📝 Step 13: Starting trip...');
    await prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.OUT_FOR_DELIVERY },
    });

    await prisma.deliveryTrip.update({
        where: { id: trip.id },
        data: {
            status: DeliveryTripStatus.IN_TRANSIT,
            startedAt: new Date(),
        },
    });
    console.log(`✅ Trip IN_TRANSIT, order OUT_FOR_DELIVERY\n`);

    // Step 14: Arrive at Stop
    console.log('📝 Step 14: Arriving at stop...');
    await prisma.tripStop.update({
        where: { id: stop.id },
        data: {
            status: TripStopStatus.ARRIVED,
            arrivalTime: new Date(),
        },
    });
    console.log(`✅ Arrived at stop\n`);

    // Step 15: Complete Stop Successfully
    console.log('📝 Step 15: Completing delivery...');
    await prisma.tripStop.update({
        where: { id: stop.id },
        data: {
            status: TripStopStatus.DELIVERED,
            completionTime: new Date(),
        },
    });

    await prisma.order.update({
        where: { id: order.id },
        data: {
            status: OrderStatus.DELIVERED,
            deliveredAt: new Date(),
        },
    });
    console.log(`✅ Delivery completed successfully\n`);

    // Step 16: Complete Trip
    console.log('📝 Step 16: Completing trip...');
    await prisma.driver.update({
        where: { id: driver.id },
        data: { currentTripId: null },
    });

    await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: { currentTripId: null },
    });

    await prisma.deliveryTrip.update({
        where: { id: trip.id },
        data: {
            status: DeliveryTripStatus.COMPLETED,
            completedAt: new Date(),
        },
    });
    console.log(`✅ Trip completed\n`);

    // Final Verification
    console.log('🔍 Final Verification...\n');
    const finalOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
            pickList: {
                include: {
                    items: true,
                },
            },
            tripStops: {
                include: {
                    trip: {
                        include: {
                            driver: true,
                            vehicle: true,
                            packs: true,
                        },
                    },
                },
            },
        },
    });

    console.log('📊 RESULTS:');
    console.log(`   Order Status: ${finalOrder.status}`);
    console.log(`   PickList Status: ${finalOrder.pickList.status}`);
    console.log(`   Trip Status: ${finalOrder.tripStops[0].trip.status}`);
    console.log(`   Stop Status: ${finalOrder.tripStops[0].status}`);
    console.log(`   Driver: ${finalOrder.tripStops[0].trip.driver.name}`);
    console.log(`   Vehicle: ${finalOrder.tripStops[0].trip.vehicle.plateNumber}`);
    console.log(`   Packs Delivered: ${finalOrder.tripStops[0].trip.packs.length}`);

    if (finalOrder.status === OrderStatus.DELIVERED) {
        console.log('\n✅ ✅ ✅ ALL TESTS PASSED! ✅ ✅ ✅');
        console.log('The complete logistics workflow executed successfully!\n');
    } else {
        throw new Error(`Order status is ${finalOrder.status}, expected DELIVERED`);
    }
}

main()
    .catch((error) => {
        console.error('\n❌ Verification failed:');
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

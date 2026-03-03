"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    var _a, _b;
    console.log('🚀 Starting Logistics Verification...\n');
    const tenant = await prisma.tenant.findFirst();
    const branch = await prisma.branch.findFirst({ where: { tenantId: tenant.id } });
    const businessClient = await prisma.businessClient.findFirst({ where: { tenantId: tenant.id } });
    if (!tenant || !branch || !businessClient) {
        throw new Error('Missing required data: tenant, branch, or business client');
    }
    console.log(`✅ Using Tenant: ${tenant.name}`);
    console.log(`✅ Using Branch: ${branch.name}`);
    console.log(`✅ Using Business Client: ${businessClient.businessName}\n`);
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
    console.log('📝 Step 3: Creating test product...');
    const product = await prisma.product.findFirst({ where: { name: 'Test Widget' } }) ||
        await prisma.product.create({
            data: {
                name: 'Test Widget',
                description: 'Test product for logistics',
                brandId: ((_a = (await prisma.brand.findFirst())) === null || _a === void 0 ? void 0 : _a.id) || (await prisma.brand.create({ data: { name: 'Generic' } })).id,
                categoryId: ((_b = (await prisma.productCategory.findFirst())) === null || _b === void 0 ? void 0 : _b.id) || (await prisma.productCategory.create({ data: { name: 'General' } })).id,
            },
        });
    console.log(`✅ Product: ${product.name} (ID: ${product.id})\n`);
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
            status: client_1.OrderStatus.PENDING,
            items: {
                create: [
                    {
                        productId: product.id,
                        quantity: 5,
                        unitPrice: 20.00,
                    },
                ],
            },
        },
        include: { items: true },
    });
    console.log(`✅ Order created: ${order.orderNumber} (ID: ${order.id})\n`);
    console.log('📝 Step 6: Confirming order...');
    await prisma.order.update({
        where: { id: order.id },
        data: { status: client_1.OrderStatus.CONFIRMED, confirmedAt: new Date() },
    });
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
        data: { status: client_1.OrderStatus.PROCESSING },
    });
    console.log(`✅ Pack sealed and order moved to PROCESSING\n`);
    console.log('📝 Step 9: Creating delivery trip...');
    const trip = await prisma.deliveryTrip.create({
        data: {
            tenantId: tenant.id,
            branchId: branch.id,
            driverId: driver.id,
            vehicleId: vehicle.id,
            status: client_1.DeliveryTripStatus.PLANNED,
        },
    });
    await prisma.driver.update({
        where: { id: driver.id },
        data: { currentTripId: trip.id },
    });
    await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: { currentTripId: trip.id },
    });
    console.log(`✅ Trip created: ${trip.id}\n`);
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
    console.log('📝 Step 11: Adding customer stop to trip...');
    const stop = await prisma.tripStop.create({
        data: {
            tripId: trip.id,
            orderId: order.id,
            stopType: 'CUSTOMER',
            sequence: 1,
            status: client_1.TripStopStatus.PENDING,
        },
    });
    await prisma.deliveryTrip.update({
        where: { id: trip.id },
        data: { totalStops: 1 },
    });
    console.log(`✅ Stop added for order ${order.orderNumber}\n`);
    console.log('📝 Step 12: Starting loading process...');
    await prisma.deliveryTrip.update({
        where: { id: trip.id },
        data: { status: client_1.DeliveryTripStatus.LOADING },
    });
    console.log(`✅ Trip status: LOADING\n`);
    console.log('📝 Step 13: Starting trip...');
    await prisma.order.update({
        where: { id: order.id },
        data: { status: client_1.OrderStatus.OUT_FOR_DELIVERY },
    });
    await prisma.deliveryTrip.update({
        where: { id: trip.id },
        data: {
            status: client_1.DeliveryTripStatus.IN_TRANSIT,
            startedAt: new Date(),
        },
    });
    console.log(`✅ Trip IN_TRANSIT, order OUT_FOR_DELIVERY\n`);
    console.log('📝 Step 14: Arriving at stop...');
    await prisma.tripStop.update({
        where: { id: stop.id },
        data: {
            status: client_1.TripStopStatus.ARRIVED,
            arrivalTime: new Date(),
        },
    });
    console.log(`✅ Arrived at stop\n`);
    console.log('📝 Step 15: Completing delivery...');
    await prisma.tripStop.update({
        where: { id: stop.id },
        data: {
            status: client_1.TripStopStatus.DELIVERED,
            completionTime: new Date(),
        },
    });
    await prisma.order.update({
        where: { id: order.id },
        data: {
            status: client_1.OrderStatus.DELIVERED,
            deliveredAt: new Date(),
        },
    });
    console.log(`✅ Delivery completed successfully\n`);
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
            status: client_1.DeliveryTripStatus.COMPLETED,
            completedAt: new Date(),
        },
    });
    console.log(`✅ Trip completed\n`);
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
    if (finalOrder.status === client_1.OrderStatus.DELIVERED) {
        console.log('\n✅ ✅ ✅ ALL TESTS PASSED! ✅ ✅ ✅');
        console.log('The complete logistics workflow executed successfully!\n');
    }
    else {
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
//# sourceMappingURL=verify-logistics.js.map
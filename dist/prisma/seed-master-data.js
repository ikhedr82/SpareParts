"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customersData = exports.suppliersData = exports.taxRatesData = exports.automotiveProducts = exports.productCategoriesHierarchy = exports.automotiveBrands = void 0;
exports.seedMasterData = seedMasterData;
exports.automotiveBrands = [
    { name: 'Toyota', country: 'Japan', isOem: true },
    { name: 'Honda', country: 'Japan', isOem: true },
    { name: 'Nissan', country: 'Japan', isOem: true },
    { name: 'Ford', country: 'USA', isOem: true },
    { name: 'Chevrolet', country: 'USA', isOem: true },
    { name: 'BMW', country: 'Germany', isOem: true },
    { name: 'Mercedes-Benz', country: 'Germany', isOem: true },
    { name: 'Audi', country: 'Germany', isOem: true },
    { name: 'Volkswagen', country: 'Germany', isOem: true },
    { name: 'Hyundai', country: 'South Korea', isOem: true },
    { name: 'Bosch', country: 'Germany', isOem: false },
    { name: 'Denso', country: 'Japan', isOem: false },
    { name: 'NGK', country: 'Japan', isOem: false },
    { name: 'ACDelco', country: 'USA', isOem: false },
    { name: 'Monroe', country: 'USA', isOem: false },
    { name: 'Bilstein', country: 'Germany', isOem: false },
    { name: 'Fram', country: 'USA', isOem: false },
    { name: 'Mobil 1', country: 'USA', isOem: false },
    { name: 'Castrol', country: 'UK', isOem: false },
    { name: 'Brembo', country: 'Italy', isOem: false },
    { name: 'Wagner', country: 'USA', isOem: false },
    { name: 'WIX', country: 'USA', isOem: false },
    { name: 'Champion', country: 'USA', isOem: false },
    { name: 'Raybestos', country: 'USA', isOem: false },
];
exports.productCategoriesHierarchy = [
    { name: 'Engine Parts', parentName: null },
    { name: 'Brake System', parentName: null },
    { name: 'Suspension', parentName: null },
    { name: 'Electrical', parentName: null },
    { name: 'Fluids & Lubricants', parentName: null },
    { name: 'Filters', parentName: null },
    { name: 'Lighting', parentName: null },
    { name: 'Oil Filters', parentName: 'Engine Parts' },
    { name: 'Air Filters', parentName: 'Engine Parts' },
    { name: 'Spark Plugs', parentName: 'Engine Parts' },
    { name: 'Belts', parentName: 'Engine Parts' },
    { name: 'Gaskets', parentName: 'Engine Parts' },
    { name: 'Brake Pads', parentName: 'Brake System' },
    { name: 'Brake Discs', parentName: 'Brake System' },
    { name: 'Brake Fluid', parentName: 'Brake System' },
    { name: 'Brake Calipers', parentName: 'Brake System' },
    { name: 'Shock Absorbers', parentName: 'Suspension' },
    { name: 'Struts', parentName: 'Suspension' },
    { name: 'Control Arms', parentName: 'Suspension' },
    { name: 'Ball Joints', parentName: 'Suspension' },
    { name: 'Batteries', parentName: 'Electrical' },
    { name: 'Alternators', parentName: 'Electrical' },
    { name: 'Starters', parentName: 'Electrical' },
    { name: 'Wipers', parentName: 'Electrical' },
];
exports.automotiveProducts = [
    {
        brandName: 'Bosch',
        categoryName: 'Oil Filters',
        name: 'Bosch Oil Filter 0 986 452 061',
        description: 'Premium oil filter for Toyota engines, high efficiency filtration',
        weight: 0.3,
        dimensions: '4.5" x 3.5"',
    },
    {
        brandName: 'Bosch',
        categoryName: 'Air Filters',
        name: 'Bosch Air Filter 5456',
        description: 'High-flow air filter for improved engine performance',
        weight: 0.4,
        dimensions: '12" x 9" x 2"',
    },
    {
        brandName: 'Bosch',
        categoryName: 'Spark Plugs',
        name: 'Bosch Platinum Spark Plug 4417',
        description: 'Platinum +4 spark plug, extended life design',
        weight: 0.05,
        dimensions: '2.5"',
    },
    {
        brandName: 'Bosch',
        categoryName: 'Wipers',
        name: 'Bosch ICON Wiper Blade 24A',
        description: '24" premium beam wiper blade, all-weather performance',
        weight: 0.25,
        dimensions: '24"',
    },
    {
        brandName: 'Bosch',
        categoryName: 'Brake Pads',
        name: 'Bosch Blue Disc Brake Pad BP1109',
        description: 'Semi-metallic front brake pads for European vehicles',
        weight: 2.5,
        dimensions: '6" x 4" x 1"',
    },
    {
        brandName: 'NGK',
        categoryName: 'Spark Plugs',
        name: 'NGK Spark Plug BKR6E-11',
        description: 'Standard spark plug for Honda models, copper core',
        weight: 0.04,
        dimensions: '2.3"',
    },
    {
        brandName: 'NGK',
        categoryName: 'Spark Plugs',
        name: 'NGK Iridium IX Spark Plug 5464',
        description: 'Iridium spark plug for maximum performance and longevity',
        weight: 0.05,
        dimensions: '2.4"',
    },
    {
        brandName: 'NGK',
        categoryName: 'Spark Plugs',
        name: 'NGK V-Power Spark Plug 3403',
        description: 'V-groove design for better ignition, suitable for most vehicles',
        weight: 0.04,
        dimensions: '2.3"',
    },
    {
        brandName: 'ACDelco',
        categoryName: 'Oil Filters',
        name: 'ACDelco Professional Oil Filter PF457G',
        description: 'GM OE specification oil filter, meets factory standards',
        weight: 0.35,
        dimensions: '4.2" x 3.2"',
    },
    {
        brandName: 'ACDelco',
        categoryName: 'Batteries',
        name: 'ACDelco Gold Battery 48AGM',
        description: 'AGM battery, 760 CCA, 36-month warranty',
        weight: 42.0,
        dimensions: '10.9" x 6.9" x 7.5"',
    },
    {
        brandName: 'ACDelco',
        categoryName: 'Alternators',
        name: 'ACDelco Alternator 334-2962',
        description: 'Remanufactured alternator, 140 amp output',
        weight: 15.0,
        dimensions: '8" x 6" x 5"',
    },
    {
        brandName: 'ACDelco',
        categoryName: 'Spark Plugs',
        name: 'ACDelco Iridium Spark Plug 41-110',
        description: 'Iridium spark plug for GM vehicles',
        weight: 0.05,
        dimensions: '2.4"',
    },
    {
        brandName: 'Denso',
        categoryName: 'Spark Plugs',
        name: 'Denso Iridium TT Spark Plug IK20TT',
        description: 'Twin-tip iridium spark plug, OE quality',
        weight: 0.05,
        dimensions: '2.5"',
    },
    {
        brandName: 'Denso',
        categoryName: 'Spark Plugs',
        name: 'Denso Platinum Longlife Spark Plug PK20TT',
        description: 'Platinum spark plug, extended service intervals',
        weight: 0.05,
        dimensions: '2.4"',
    },
    {
        brandName: 'Denso',
        categoryName: 'Air Filters',
        name: 'Denso Air Filter 143-3409',
        description: 'OE-quality air filter for Toyota/Lexus vehicles',
        weight: 0.35,
        dimensions: '11" x 8.5" x 2"',
    },
    {
        brandName: 'Brembo',
        categoryName: 'Brake Pads',
        name: 'Brembo PRIME Brake Pads P83047',
        description: 'Low-metallic brake pads for BMW 3 Series, excellent stopping power',
        weight: 3.2,
        dimensions: '6.5" x 4.5" x 1.2"',
    },
    {
        brandName: 'Brembo',
        categoryName: 'Brake Pads',
        name: 'Brembo Ceramic Brake Pads P59079N',
        description: 'Ceramic formula, low dust, quiet braking',
        weight: 3.0,
        dimensions: '6" x 4" x 1"',
    },
    {
        brandName: 'Brembo',
        categoryName: 'Brake Pads',
        name: 'Brembo PRIME Brake Pads P37018',
        description: 'Front disc brake pads, low-metallic formula',
        weight: 2.8,
        dimensions: '5.8" x 4.2" x 1"',
    },
    {
        brandName: 'Brembo',
        categoryName: 'Brake Discs',
        name: 'Brembo UV Coated Brake Disc 09.A427.11',
        description: 'Front brake rotor with UV coating for rust protection',
        weight: 9.5,
        dimensions: '12.6" diameter',
    },
    {
        brandName: 'Wagner',
        categoryName: 'Brake Pads',
        name: 'Wagner ThermoQuiet Ceramic QC1423',
        description: 'Ceramic rear disc brake pads, premium quiet formula',
        weight: 2.6,
        dimensions: '5.5" x 3.8" x 1"',
    },
    {
        brandName: 'Wagner',
        categoryName: 'Brake Pads',
        name: 'Wagner ThermoQuiet Ceramic QC712',
        description: 'Front ceramic brake pads, low dust',
        weight: 3.1,
        dimensions: '6.2" x 4.3" x 1.1"',
    },
    {
        brandName: 'Wagner',
        categoryName: 'Brake Pads',
        name: 'Wagner Semi-Metallic MX606',
        description: 'Rear semi-metallic brake pads, excellent heat dissipation',
        weight: 2.4,
        dimensions: '5.3" x 3.6" x 0.9"',
    },
    {
        brandName: 'Fram',
        categoryName: 'Oil Filters',
        name: 'Fram Extra Guard Oil Filter PH7317',
        description: 'Standard oil filter, 99% dirt removal efficiency',
        weight: 0.32,
        dimensions: '4.8" x 3.4"',
    },
    {
        brandName: 'Fram',
        categoryName: 'Oil Filters',
        name: 'Fram Ultra Synthetic Oil Filter XG11473',
        description: 'Synthetic blend oil filter, 20,000 mile protection',
        weight: 0.38,
        dimensions: '5" x 3.6"',
    },
    {
        brandName: 'Fram',
        categoryName: 'Air Filters',
        name: 'Fram Extra Guard Air Filter CA10262',
        description: 'Standard air filter with SureGrip ridges',
        weight: 0.4,
        dimensions: '12.5" x 9.2" x 2.2"',
    },
    {
        brandName: 'WIX',
        categoryName: 'Oil Filters',
        name: 'WIX Oil Filter 51356',
        description: 'Premium spin-on oil filter, 99.5% efficiency',
        weight: 0.34,
        dimensions: '4.6" x 3.5"',
    },
    {
        brandName: 'WIX',
        categoryName: 'Oil Filters',
        name: 'WIX Oil Filter 51056',
        description: 'Heavy-duty oil filter for trucks and SUVs',
        weight: 0.45,
        dimensions: '5.2" x 3.8"',
    },
    {
        brandName: 'WIX',
        categoryName: 'Air Filters',
        name: 'WIX Air Filter 49123',
        description: 'High-capacity pleated air filter',
        weight: 0.42,
        dimensions: '13" x 9.5" x 2.5"',
    },
    {
        brandName: 'Mobil 1',
        categoryName: 'Oil Filters',
        name: 'Mobil 1 Extended Performance Oil Filter M1-110',
        description: 'Advanced synthetic oil filter, 15,000 mile protection',
        weight: 0.36,
        dimensions: '4.7" x 3.5"',
    },
    {
        brandName: 'Mobil 1',
        categoryName: 'Oil Filters',
        name: 'Mobil 1 Oil Filter M1-102A',
        description: 'High-efficiency synthetic oil filter',
        weight: 0.33,
        dimensions: '4.5" x 3.3"',
    },
    {
        brandName: 'Mobil 1',
        categoryName: 'Fluids & Lubricants',
        name: 'Mobil 1 Full Synthetic 5W-30 (5 Quart)',
        description: 'Advanced full synthetic motor oil, superior engine protection',
        weight: 10.5,
        dimensions: '12" x 10" x 5"',
    },
    {
        brandName: 'Mobil 1',
        categoryName: 'Fluids & Lubricants',
        name: 'Mobil 1 Full Synthetic 0W-20 (5 Quart)',
        description: 'Full synthetic oil optimized for fuel economy',
        weight: 10.2,
        dimensions: '12" x 10" x 5"',
    },
    {
        brandName: 'Castrol',
        categoryName: 'Fluids & Lubricants',
        name: 'Castrol EDGE 5W-30 (5 Quart)',
        description: 'Advanced full synthetic with titanium technology',
        weight: 10.4,
        dimensions: '12" x 9.5" x 5"',
    },
    {
        brandName: 'Castrol',
        categoryName: 'Fluids & Lubricants',
        name: 'Castrol GTX High Mileage 10W-30 (5 Quart)',
        description: 'Conventional motor oil for vehicles over 75,000 miles',
        weight: 10.6,
        dimensions: '12" x 9.5" x 5"',
    },
    {
        brandName: 'Castrol',
        categoryName: 'Brake Fluid',
        name: 'Castrol DOT 4 Brake Fluid (12 oz)',
        description: 'DOT 4 synthetic brake fluid, high boiling point',
        weight: 0.85,
        dimensions: '6" x 3" x 2"',
    },
    {
        brandName: 'Monroe',
        categoryName: 'Shock Absorbers',
        name: 'Monroe Sensa-Trac G16339',
        description: 'Front shock absorber for Ford F-150, nitrogen gas-charged',
        weight: 6.5,
        dimensions: '22" x 4" x 4"',
    },
    {
        brandName: 'Monroe',
        categoryName: 'Shock Absorbers',
        name: 'Monroe OESpectrum 37264',
        description: 'Rear shock absorber, OE-quality replacement',
        weight: 5.8,
        dimensions: '20" x 3.8" x 3.8"',
    },
    {
        brandName: 'Monroe',
        categoryName: 'Struts',
        name: 'Monroe Quick-Strut 171661',
        description: 'Complete strut assembly with spring and mount',
        weight: 18.5,
        dimensions: '28" x 8" x 8"',
    },
    {
        brandName: 'Bilstein',
        categoryName: 'Shock Absorbers',
        name: 'Bilstein 5100 Series 24-186728',
        description: 'Front monotube shock, gas pressure technology',
        weight: 7.2,
        dimensions: '24" x 4.5" x 4.5"',
    },
    {
        brandName: 'Bilstein',
        categoryName: 'Shock Absorbers',
        name: 'Bilstein B6 4600 24-017293',
        description: 'Performance shock absorber for daily driving',
        weight: 6.8,
        dimensions: '22" x 4" x 4"',
    },
    {
        brandName: 'Champion',
        categoryName: 'Spark Plugs',
        name: 'Champion Copper Plus RC12ECC',
        description: 'Copper core spark plug for small engines',
        weight: 0.04,
        dimensions: '2.2"',
    },
    {
        brandName: 'Champion',
        categoryName: 'Spark Plugs',
        name: 'Champion Iridium 9410',
        description: 'Fine-wire iridium spark plug, 100,000 mile life',
        weight: 0.05,
        dimensions: '2.4"',
    },
    {
        brandName: 'Champion',
        categoryName: 'Wipers',
        name: 'Champion Wiper Blade 22"',
        description: 'All-season performance wiper blade',
        weight: 0.22,
        dimensions: '22"',
    },
    {
        brandName: 'Raybestos',
        categoryName: 'Brake Pads',
        name: 'Raybestos Professional Grade PGD1059',
        description: 'Premium brake pads with consistent performance',
        weight: 2.7,
        dimensions: '5.9" x 4" x 1"',
    },
    {
        brandName: 'Raybestos',
        categoryName: 'Brake Pads',
        name: 'Raybestos Element3 EHT699H',
        description: 'Hybrid technology ceramic brake pads',
        weight: 2.9,
        dimensions: '6.1" x 4.2" x 1"',
    },
    {
        brandName: 'Bosch',
        categoryName: 'Batteries',
        name: 'Bosch S4 Battery 12V 60Ah',
        description: 'Maintenance-free car battery, 540 CCA',
        weight: 38.0,
        dimensions: '9.5" x 6.9" x 7.5"',
    },
    {
        brandName: 'Denso',
        categoryName: 'Alternators',
        name: 'Denso Alternator 210-5172',
        description: 'Remanufactured alternator, 90 amp',
        weight: 12.5,
        dimensions: '7" x 5.5" x 5"',
    },
    {
        brandName: 'Denso',
        categoryName: 'Starters',
        name: 'Denso Starter 280-0353',
        description: 'Remanufactured starter motor',
        weight: 8.5,
        dimensions: '8" x 6" x 5"',
    },
];
exports.taxRatesData = [
    { name: 'Standard VAT', percentage: 15.00 },
    { name: 'Zero-Rated', percentage: 0.00 },
    { name: 'Export (Exempt)', percentage: 0.00 },
];
exports.suppliersData = [
    { name: 'AutoZone Parts Distributors', balance: 0 },
    { name: 'NAPA Auto Parts Supply', balance: 0 },
    { name: 'O\'Reilly Automotive Wholesale', balance: 0 },
    { name: 'Advance Auto Parts Distributor', balance: 0 },
    { name: 'CarQuest Auto Parts', balance: 0 },
    { name: 'Local Imports & Exports Ltd', balance: 0 },
    { name: 'Premium Parts International', balance: 0 },
];
exports.customersData = [
    { name: 'John\'s Auto Repair', phone: '+27-11-555-0101', email: 'contact@johnsauto.co.za', balance: 0 },
    { name: 'City Fleet Services', phone: '+27-11-555-0102', email: 'fleet@cityfleet.co.za', balance: 0 },
    { name: 'Express Delivery Co', phone: '+27-11-555-0103', email: 'maintenance@expressdelivery.co.za', balance: 0 },
    { name: 'Mike Johnson (Retail)', phone: '+27-82-555-0201', email: 'mike.j@email.com', balance: 0 },
    { name: 'Sarah Williams (Retail)', phone: '+27-83-555-0202', email: 'sarah.w@email.com', balance: 0 },
    { name: 'David Brown (Retail)', phone: '+27-84-555-0203', email: null, balance: 0 },
    { name: 'Lisa Anderson (Retail)', phone: '+27-85-555-0204', email: 'lisa.a@email.com', balance: 0 },
    { name: 'Metro Taxi Services', phone: '+27-11-555-0104', email: 'parts@metrotaxi.co.za', balance: 0 },
    { name: 'Budget Rent-A-Car', phone: '+27-11-555-0105', email: 'maintenance@budgetcar.co.za', balance: 0 },
    { name: 'Peter Smith (Retail)', phone: '+27-86-555-0205', email: null, balance: 0 },
];
async function seedMasterData(prisma, tenantId, branchId) {
    console.log('🌱 Seeding Automotive Master Data...');
    console.log('  ✓ Seeding brands...');
    const brandMap = {};
    for (const brandData of exports.automotiveBrands) {
        const brand = await prisma.brand.upsert({
            where: { name: brandData.name },
            update: {},
            create: brandData,
        });
        brandMap[brandData.name] = brand;
    }
    console.log('  ✓ Seeding product categories...');
    const categoryMap = {};
    for (const catData of exports.productCategoriesHierarchy.filter(c => !c.parentName)) {
        const category = await prisma.productCategory.upsert({
            where: { name: catData.name },
            update: {},
            create: { name: catData.name },
        });
        categoryMap[catData.name] = category;
    }
    for (const catData of exports.productCategoriesHierarchy.filter(c => c.parentName)) {
        const category = await prisma.productCategory.upsert({
            where: { name: catData.name },
            update: {},
            create: {
                name: catData.name,
                parentId: categoryMap[catData.parentName].id,
            },
        });
        categoryMap[catData.name] = category;
    }
    console.log('  ✓ Seeding tax rates...');
    const taxRateMap = {};
    for (const taxData of exports.taxRatesData) {
        let taxRate = await prisma.taxRate.findFirst({
            where: {
                tenantId,
                name: taxData.name,
            },
        });
        if (!taxRate) {
            taxRate = await prisma.taxRate.create({
                data: Object.assign({ tenantId }, taxData),
            });
        }
        taxRateMap[taxData.name] = taxRate;
    }
    console.log('  ✓ Seeding automotive products...');
    const productMap = {};
    for (const productData of exports.automotiveProducts) {
        const product = await prisma.product.upsert({
            where: { name: productData.name },
            update: {},
            create: {
                name: productData.name,
                description: productData.description,
                weight: productData.weight,
                dimensions: productData.dimensions,
                brandId: brandMap[productData.brandName].id,
                categoryId: categoryMap[productData.categoryName].id,
                taxRateId: taxRateMap['Standard VAT'].id,
                status: 'ACTIVE',
            },
        });
        productMap[productData.name] = product;
    }
    console.log('  ✓ Seeding suppliers...');
    for (const supplierData of exports.suppliersData) {
        const existing = await prisma.supplier.findFirst({
            where: {
                tenantId,
                name: supplierData.name,
            },
        });
        if (!existing) {
            await prisma.supplier.create({
                data: Object.assign({ tenantId }, supplierData),
            });
        }
    }
    console.log('  ✓ Seeding customers...');
    for (const customerData of exports.customersData) {
        const existing = await prisma.customer.findFirst({
            where: {
                tenantId,
                OR: customerData.email
                    ? [{ email: customerData.email }, { phone: customerData.phone }]
                    : [{ phone: customerData.phone }],
            },
        });
        if (!existing) {
            await prisma.customer.create({
                data: {
                    tenantId,
                    name: customerData.name,
                    phone: customerData.phone,
                    email: customerData.email,
                    balance: customerData.balance,
                },
            });
        }
    }
    console.log('  ✓ Seeding initial inventory...');
    const productsToStock = [
        { name: 'Bosch Oil Filter 0 986 452 061', quantity: 25, costPrice: 8.50, markup: 1.35 },
        { name: 'Fram Extra Guard Oil Filter PH7317', quantity: 30, costPrice: 6.99, markup: 1.40 },
        { name: 'WIX Oil Filter 51356', quantity: 20, costPrice: 9.25, markup: 1.32 },
        { name: 'Mobil 1 Extended Performance Oil Filter M1-110', quantity: 15, costPrice: 12.99, markup: 1.30 },
        { name: 'ACDelco Professional Oil Filter PF457G', quantity: 18, costPrice: 7.85, markup: 1.38 },
        { name: 'NGK Spark Plug BKR6E-11', quantity: 40, costPrice: 3.25, markup: 1.50 },
        { name: 'NGK Iridium IX Spark Plug 5464', quantity: 35, costPrice: 8.99, markup: 1.35 },
        { name: 'Bosch Platinum Spark Plug 4417', quantity: 28, costPrice: 6.50, markup: 1.40 },
        { name: 'Denso Iridium TT Spark Plug IK20TT', quantity: 25, costPrice: 9.75, markup: 1.33 },
        { name: 'Champion Iridium 9410', quantity: 22, costPrice: 7.99, markup: 1.36 },
        { name: 'Brembo PRIME Brake Pads P83047', quantity: 12, costPrice: 45.00, markup: 1.25 },
        { name: 'Brembo Ceramic Brake Pads P59079N', quantity: 10, costPrice: 52.00, markup: 1.23 },
        { name: 'Wagner ThermoQuiet Ceramic QC1423', quantity: 14, costPrice: 38.50, markup: 1.28 },
        { name: 'Wagner ThermoQuiet Ceramic QC712', quantity: 13, costPrice: 42.00, markup: 1.26 },
        { name: 'Raybestos Professional Grade PGD1059', quantity: 11, costPrice: 40.00, markup: 1.27 },
        { name: 'Bosch Air Filter 5456', quantity: 20, costPrice: 15.50, markup: 1.35 },
        { name: 'Denso Air Filter 143-3409', quantity: 18, costPrice: 17.25, markup: 1.32 },
        { name: 'Fram Extra Guard Air Filter CA10262', quantity: 22, costPrice: 12.99, markup: 1.38 },
        { name: 'Mobil 1 Full Synthetic 5W-30 (5 Quart)', quantity: 25, costPrice: 28.99, markup: 1.20 },
        { name: 'Mobil 1 Full Synthetic 0W-20 (5 Quart)', quantity: 20, costPrice: 30.99, markup: 1.19 },
        { name: 'Castrol EDGE 5W-30 (5 Quart)', quantity: 22, costPrice: 27.50, markup: 1.21 },
        { name: 'Castrol GTX High Mileage 10W-30 (5 Quart)', quantity: 18, costPrice: 19.99, markup: 1.25 },
        { name: 'Monroe Sensa-Trac G16339', quantity: 8, costPrice: 65.00, markup: 1.22 },
        { name: 'Monroe OESpectrum 37264', quantity: 7, costPrice: 58.00, markup: 1.24 },
        { name: 'Bilstein 5100 Series 24-186728', quantity: 5, costPrice: 125.00, markup: 1.18 },
        { name: 'ACDelco Gold Battery 48AGM', quantity: 6, costPrice: 185.00, markup: 1.15 },
        { name: 'Bosch S4 Battery 12V 60Ah', quantity: 5, costPrice: 165.00, markup: 1.17 },
        { name: 'Bosch ICON Wiper Blade 24A', quantity: 15, costPrice: 22.50, markup: 1.30 },
        { name: 'Castrol DOT 4 Brake Fluid (12 oz)', quantity: 20, costPrice: 6.99, markup: 1.40 },
        { name: 'Brembo UV Coated Brake Disc 09.A427.11', quantity: 8, costPrice: 55.00, markup: 1.20 },
    ];
    for (const stockItem of productsToStock) {
        const product = productMap[stockItem.name];
        if (!product) {
            console.warn(`    ⚠ Product not found: ${stockItem.name}`);
            continue;
        }
        const sellingPrice = (stockItem.costPrice * stockItem.markup).toFixed(2);
        await prisma.inventory.upsert({
            where: {
                branchId_productId: {
                    branchId,
                    productId: product.id,
                },
            },
            update: {},
            create: {
                tenantId,
                branchId,
                productId: product.id,
                quantity: stockItem.quantity,
                costPrice: stockItem.costPrice,
                sellingPrice: parseFloat(sellingPrice),
                barcode: `${product.id.substring(0, 12).replace(/-/g, '')}`,
            },
        });
    }
    console.log('✅ Automotive Master Data Seeding Complete!');
    console.log(`   - Brands: ${exports.automotiveBrands.length}`);
    console.log(`   - Categories: ${exports.productCategoriesHierarchy.length}`);
    console.log(`   - Products: ${exports.automotiveProducts.length}`);
    console.log(`   - Tax Rates: ${exports.taxRatesData.length}`);
    console.log(`   - Suppliers: ${exports.suppliersData.length}`);
    console.log(`   - Customers: ${exports.customersData.length}`);
    console.log(`   - Inventory Items: ${productsToStock.length}`);
}
//# sourceMappingURL=seed-master-data.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapCategory = mapCategory;
exports.getOrCreateCategory = getOrCreateCategory;
exports.getExistingCategories = getExistingCategories;
const CATEGORY_MAP = {
    'oil filter': 'Oil Filters',
    'oil filters': 'Oil Filters',
    'lube filter': 'Oil Filters',
    'air filter': 'Air Filters',
    'air filters': 'Air Filters',
    'engine air filter': 'Air Filters',
    'spark plug': 'Spark Plugs',
    'spark plugs': 'Spark Plugs',
    'ignition plug': 'Spark Plugs',
    'brake pad': 'Brake Pads',
    'brake pads': 'Brake Pads',
    'disc brake pad': 'Brake Pads',
    'brake disc': 'Brake Discs',
    'brake rotor': 'Brake Discs',
    'disc rotor': 'Brake Discs',
    'brake fluid': 'Brake Fluid',
    'dot 3': 'Brake Fluid',
    'dot 4': 'Brake Fluid',
    'shock absorber': 'Shock Absorbers',
    'shock': 'Shock Absorbers',
    'damper': 'Shock Absorbers',
    'battery': 'Batteries',
    'car battery': 'Batteries',
    'automotive battery': 'Batteries',
    'wiper blade': 'Wipers',
    'windshield wiper': 'Wipers',
    'wiper': 'Wipers',
    'motor oil': 'Fluids & Lubricants',
    'engine oil': 'Fluids & Lubricants',
    'transmission oil': 'Fluids & Lubricants',
    'coolant': 'Fluids & Lubricants',
};
function mapCategory(manufacturerCategory) {
    const normalized = manufacturerCategory.toLowerCase().trim();
    if (CATEGORY_MAP[normalized]) {
        return CATEGORY_MAP[normalized];
    }
    for (const [key, value] of Object.entries(CATEGORY_MAP)) {
        if (normalized.includes(key)) {
            return value;
        }
    }
    console.warn(`Unknown category: "${manufacturerCategory}", defaulting to "Engine Parts"`);
    return 'Engine Parts';
}
async function getOrCreateCategory(prisma, categoryName) {
    const category = await prisma.productCategory.findUnique({
        where: { name: categoryName },
    });
    if (category) {
        return category;
    }
    return await prisma.productCategory.create({
        data: { name: categoryName },
    });
}
async function getExistingCategories(prisma) {
    const categories = await prisma.productCategory.findMany({
        select: { id: true, name: true },
    });
    return new Map(categories.map(c => [c.name, c.id]));
}
//# sourceMappingURL=category-mapper.js.map
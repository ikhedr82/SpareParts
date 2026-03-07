import { PrismaClient } from '@prisma/client';

/**
 * Category mapping from manufacturer categories to our standard categories
 */
const CATEGORY_MAP: Record<string, string> = {
    // Oil Filters
    'oil filter': 'Oil Filters',
    'oil filters': 'Oil Filters',
    'lube filter': 'Oil Filters',

    // Air Filters
    'air filter': 'Air Filters',
    'air filters': 'Air Filters',
    'engine air filter': 'Air Filters',

    // Spark Plugs
    'spark plug': 'Spark Plugs',
    'spark plugs': 'Spark Plugs',
    'ignition plug': 'Spark Plugs',

    // Brake Pads
    'brake pad': 'Brake Pads',
    'brake pads': 'Brake Pads',
    'disc brake pad': 'Brake Pads',

    // Brake Discs
    'brake disc': 'Brake Discs',
    'brake rotor': 'Brake Discs',
    'disc rotor': 'Brake Discs',

    // Brake Fluid
    'brake fluid': 'Brake Fluid',
    'dot 3': 'Brake Fluid',
    'dot 4': 'Brake Fluid',

    // Shock Absorbers
    'shock absorber': 'Shock Absorbers',
    'shock': 'Shock Absorbers',
    'damper': 'Shock Absorbers',

    // Batteries
    'battery': 'Batteries',
    'car battery': 'Batteries',
    'automotive battery': 'Batteries',

    // Wipers
    'wiper blade': 'Wipers',
    'windshield wiper': 'Wipers',
    'wiper': 'Wipers',

    // Fluids & Lubricants
    'motor oil': 'Fluids & Lubricants',
    'engine oil': 'Fluids & Lubricants',
    'transmission oil': 'Fluids & Lubricants',
    'coolant': 'Fluids & Lubricants',
};

/**
 * Maps manufacturer category names to our standard category names
 */
export function mapCategory(manufacturerCategory: string): string {
    const normalized = manufacturerCategory.toLowerCase().trim();

    // Try exact match first
    if (CATEGORY_MAP[normalized]) {
        return CATEGORY_MAP[normalized];
    }

    // Try partial match
    for (const [key, value] of Object.entries(CATEGORY_MAP)) {
        if (normalized.includes(key)) {
            return value;
        }
    }

    // Default to "Engine Parts" if no match found
    console.warn(`Unknown category: "${manufacturerCategory}", defaulting to "Engine Parts"`);
    return 'Engine Parts';
}

/**
 * Gets or creates a category in the database
 */
export async function getOrCreateCategory(
    prisma: PrismaClient,
    categoryName: string
): Promise<{ id: string; name: string }> {
    const category = await prisma.productCategory.findUnique({
        where: { name: categoryName },
    });

    if (category) {
        return category;
    }

    // If not found, create it
    return await prisma.productCategory.create({
        data: { name: categoryName },
    });
}

/**
 * Gets all existing categories from database for validation
 */
export async function getExistingCategories(
    prisma: PrismaClient
): Promise<Map<string, string>> {
    const categories = await prisma.productCategory.findMany({
        select: { id: true, name: true },
    });

    return new Map(categories.map(c => [c.name, c.id]));
}

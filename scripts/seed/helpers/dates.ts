/**
 * Date helpers — Generate realistic historical dates for seeded data.
 * Business opened ~6 months ago. Daily operations since.
 */

/** Days ago from now */
export function daysAgo(n: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0);
    return d;
}

/** Specific date at a given hour */
export function dateAt(daysBack: number, hour: number, minute = 0): Date {
    const d = new Date();
    d.setDate(d.getDate() - daysBack);
    d.setHours(hour, minute, 0, 0);
    return d;
}

/** Today at specific time */
export function today(hour: number, minute = 0): Date {
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    return d;
}

/** Yesterday at specific time */
export function yesterday(hour: number, minute = 0): Date {
    return dateAt(1, hour, minute);
}

/** Start of day N days ago */
export function startOfDay(daysBack: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - daysBack);
    d.setHours(0, 0, 0, 0);
    return d;
}

/** Business opening date (6 months ago) */
export function businessOpenDate(): Date {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    d.setDate(1);
    d.setHours(8, 0, 0, 0);
    return d;
}

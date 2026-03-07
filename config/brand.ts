/**
 * Partivo — Global Brand Configuration
 * 
 * Single source of truth for brand identity across all portals.
 * Referenced by: Platform Admin, Tenant Admin, Customer Portal, Landing Website.
 */

export const BRAND = {
    /** Brand name */
    name: 'Partivo',

    /** Legal entity */
    legalName: 'Partivo Commerce Platform',

    /** Primary domain */
    domain: 'partivo.net',

    /** Full URL */
    url: 'https://partivo.net',

    /** Tagline */
    tagline: 'Multi-Tenant Spare Parts Commerce',

    /** Logo paths (relative to /public) */
    logo: '/brand/logo.svg',
    logoDark: '/brand/logo-dark.svg',
    icon: '/brand/logo-icon.svg',
    favicon: '/brand/favicon.svg',
    appIcon: '/brand/app-icon.svg',

    /** Color palette */
    colors: {
        /** Primary green — growth, commerce */
        primary: '#10B981',
        primaryLight: '#34D399',
        primaryDark: '#059669',

        /** Secondary blue — trust, infrastructure */
        secondary: '#0EA5E9',
        secondaryLight: '#38BDF8',
        secondaryDark: '#0284C7',

        /** Background tones */
        darkBg: '#064E3B',
        darkBgAlt: '#0C4A6E',

        /** Neutral */
        textLight: '#F1F5F9',
        textDark: '#1E293B',
    },

    /** Typography */
    fonts: {
        primary: "'Inter', 'Segoe UI', system-ui, sans-serif",
        arabic: "'Noto Sans Arabic', 'Segoe UI', system-ui, sans-serif",
        mono: "'JetBrains Mono', 'Cascadia Code', monospace",
    },

    /** OpenGraph metadata */
    og: {
        title: 'Partivo — Multi-Tenant Spare Parts Commerce',
        description: 'All-in-one SaaS platform for spare parts dealers. Manage inventory, sales, logistics, and finance.',
        image: '/brand/app-icon.svg',
        type: 'website',
    },

    /** Portal-specific titles */
    portals: {
        platform: 'Partivo Platform Admin',
        tenant: 'Partivo Business Portal',
        customer: 'Partivo Customer Portal',
        landing: 'Partivo — Spare Parts Commerce Platform',
    },
} as const;

export type Brand = typeof BRAND;

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface NavItemProps {
    href: string;
    icon: LucideIcon;
    label: string;
}

export function NavItem({ href, icon: Icon, label }: NavItemProps) {
    const pathname = usePathname();
    const isActive = pathname === href || pathname?.startsWith(href + '/');

    return (
        <Link
            href={href}
            className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActive
                    ? 'bg-primary text-white'
                    : 'text-slate-700 hover:bg-slate-100'
            )}
        >
            <Icon className="h-5 w-5" />
            <span className="font-medium text-sm">{label}</span>
        </Link>
    );
}

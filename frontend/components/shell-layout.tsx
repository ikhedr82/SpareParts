'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { removeToken } from '@/lib/auth';
import { LanguageSwitcher } from './language-switcher';
import { useLanguage } from '@/lib/i18n/LanguageContext';

import { BrandLogo } from './brand-logo';

interface ShellLayoutProps {
    children: React.ReactNode;
    title: string;
    navigation: React.ReactNode;
}

export function ShellLayout({ children, title, navigation }: ShellLayoutProps) {
    const router = useRouter();
    const { t } = useLanguage();

    const handleLogout = () => {
        removeToken();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-e border-slate-200 flex flex-col">
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <BrandLogo className="h-8" />
                        <p className="text-xs text-slate-500 mt-1">{title}</p>
                    </div>
                    <LanguageSwitcher />
                </div>

                <nav className="flex-1 p-4 space-y-1">{navigation}</nav>

                <div className="p-4 border-t border-slate-200">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium text-sm">{t('auth.logout')}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}

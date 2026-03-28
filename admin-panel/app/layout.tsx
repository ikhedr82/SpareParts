'use client';

import { Inter, Noto_Sans_Arabic } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Package, ShoppingCart, DollarSign, LayoutDashboard,
  CreditCard, ArrowRightLeft, Tag, Users
} from 'lucide-react';
import { LanguageProvider, useLanguage } from '@/lib/i18n/LanguageContext';
import { LanguageSwitcher } from '@/components/language-switcher';
import { BrandLogo } from '@/components/brand-logo';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoArabic = Noto_Sans_Arabic({ subsets: ['arabic'], variable: '--font-arabic' });

const navItems = [
  { href: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { href: '/procurement', icon: ShoppingCart, labelKey: 'portal.nav.orders' },
  { href: '/inventory', icon: Package, labelKey: 'portal.nav.catalog' },
  { href: '/pricing', icon: Tag, labelKey: 'portal.nav.pricing' },
  { href: '/financials', icon: CreditCard, labelKey: 'portal.nav.financials' },
  { href: '/substitutions', icon: ArrowRightLeft, labelKey: 'portal.nav.substitutions' },
  { href: '/crm/customers', icon: Users, labelKey: 'portal.nav.crm' },
];

function PortalShell({ children }: { children: React.ReactNode }) {
  const { t, dir } = useLanguage();
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-50" dir={dir}>
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden md:flex flex-col border-e border-gray-200">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <BrandLogo height={32} className="w-auto" />
            <p className="text-xs text-gray-400">{t('portal.subtitle')}</p>
          </div>
          <LanguageSwitcher />
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 me-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200 text-xs text-gray-400">
          {t('portal.title')} v1.2.0
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={`${inter.variable} ${notoArabic.variable} ${inter.className}`}>
        <LanguageProvider>
          <PortalShell>{children}</PortalShell>
        </LanguageProvider>
      </body>
    </html>
  );
}

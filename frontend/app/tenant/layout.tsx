'use client';

import { ShellLayout } from '@/components/shell-layout';
import { NavItem } from '@/components/nav-item';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ErrorBoundary } from '@/components/error-boundary';
import { LayoutDashboard, Building2, ShoppingCart, DollarSign, BarChart3, Package, Users, Truck, RotateCcw, FileText, ClipboardList } from 'lucide-react';

export default function TenantLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { t } = useLanguage();

    return (
        <ShellLayout
            title={t('dashboard.title')}
            navigation={
                <>
                    <NavItem href="/tenant" icon={LayoutDashboard} label={t('nav.dashboard')} />
                    <NavItem href="/tenant/branches" icon={Building2} label={t('nav.branches')} />
                    <NavItem href="/tenant/inventory" icon={Package} label={t('nav.inventory')} />
                    <NavItem href="/tenant/sales" icon={ShoppingCart} label={t('nav.sales')} />
                    <NavItem href="/tenant/purchase-orders" icon={ShoppingCart} label={t('nav.purchase_orders')} />
                    <NavItem href="/tenant/customers" icon={Users} label={t('nav.customers')} />
                    <NavItem href="/tenant/users" icon={Users} label={t('nav.users')} />
                    <NavItem href="/tenant/suppliers" icon={Truck} label={t('nav.suppliers')} />
                    <NavItem href="/tenant/finance" icon={DollarSign} label={t('nav.finance')} />
                    <NavItem href="/tenant/analytics" icon={BarChart3} label={t('nav.analytics')} />
                    <div className="my-2 border-t border-slate-200" />
                    <NavItem href="/tenant/returns" icon={RotateCcw} label={t('nav.returns')} />
                    <NavItem href="/tenant/quotes" icon={FileText} label={t('nav.quotes')} />
                    <NavItem href="/tenant/logistics" icon={Truck} label={t('nav.logistics')} />
                    <NavItem href="/tenant/warehouse" icon={ClipboardList} label={t('nav.warehouse')} />
                    <NavItem href="/tenant/billing" icon={DollarSign} label={t('nav.billing')} />
                </>
            }
        >
            <ErrorBoundary>
                {children}
            </ErrorBoundary>
        </ShellLayout>
    );
}

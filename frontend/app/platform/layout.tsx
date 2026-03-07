'use client';

import { ShellLayout } from '@/components/shell-layout';
import { NavItem } from '@/components/nav-item';
import { Building2, Users, DollarSign, HeadphonesIcon, Layers, Globe, Activity, Flag, Settings, Key } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function PlatformLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { t } = useLanguage();

    return (
        <ShellLayout
            title={t('platform.title')}
            navigation={
                <>
                    <NavItem href="/platform" icon={Building2} label={t('platform.nav.tenants')} />
                    <NavItem href="/platform/plans" icon={Layers} label={t('platform.nav.plans')} />
                    <NavItem href="/platform/currencies" icon={Globe} label={t('platform.nav.currencies')} />
                    <NavItem href="/platform/users" icon={Users} label={t('platform.nav.users')} />
                    <NavItem href="/platform/revenue" icon={DollarSign} label={t('platform.nav.revenue')} />
                    <NavItem href="/platform/support" icon={HeadphonesIcon} label={t('platform.nav.support')} />
                    <NavItem href="/platform/subscriptions" icon={DollarSign} label={t('platform.nav.subscriptions')} />
                    <NavItem href="/platform/health" icon={Activity} label={t('platform.nav.health')} />
                    <NavItem href="/platform/features" icon={Flag} label={t('platform.nav.features')} />
                    <NavItem href="/platform/settings" icon={Settings} label={t('platform.nav.settings')} />
                    <NavItem href="/platform/api-keys" icon={Key} label={t('platform.nav.api_keys')} />
                </>
            }
        >
            {children}
        </ShellLayout>
    );
}

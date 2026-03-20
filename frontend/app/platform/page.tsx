'use client';

import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { KPICard } from '@/components/kpi-card';
import apiClient from '@/lib/api';
import { Building2, Users, ShieldCheck, ShieldBan, DollarSign, Zap, TrendingUp } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import Link from 'next/link';
import { formatCurrency } from '@/lib/formatters';

interface Tenant {
    id: string;
    name: string;
    subdomain: string;
    status: 'ACTIVE' | 'SUSPENDED';
    plan: string;
    createdAt: string;
    _count: { users: number; branches: number };
}

interface PaginatedTenants {
    items: Tenant[];
    total: number;
    page: number;
    limit: number;
}

export default function PlatformPage() {
    const { t, language } = useLanguage();
    const isRtl = language === 'ar';

    const { data: paginatedData, isLoading: tenantsLoading, error } = useQuery<PaginatedTenants>({
        queryKey: ['platform-tenants-summary'],
        queryFn: async () => {
            const { data } = await apiClient.get('/api/platform/tenants', { params: { limit: 100 } });
            return data;
        },
    });

    const { data: billingStats } = useQuery({
        queryKey: ['platform-billing-stats-summary'],
        queryFn: async () => {
            const { data } = await apiClient.get('/api/platform/tenants/billing/stats');
            return data;
        },
    });

    const { data: revenueTrends } = useQuery({
        queryKey: ['platform-revenue-trends-summary'],
        queryFn: async () => {
            const { data } = await apiClient.get('/api/platform/tenants/revenue/trends');
            return data;
        },
    });

    const isLoading = tenantsLoading;
    const tenants = paginatedData?.items || [];
    const totalTenants = paginatedData?.total || 0;
    const activeTenants = tenants.filter(t2 => t2.status === 'ACTIVE').length;
    const totalUsers = tenants.reduce((sum, t2) => sum + (t2._count?.users || 0), 0);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="mb-8">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <Zap className="h-10 w-10 text-indigo-600" />
                    {t('platform.dashboard.title')}
                </h1>
                <p className="text-slate-500 mt-2 text-lg font-medium">{t('platform.dashboard.subtitle')}</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    <>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-[2.5rem] p-8 h-32 animate-pulse bg-slate-50" />
                        ))}
                    </>
                ) : (
                    <>
                        <KPICard title={t('platform.dashboard.total_tenants')} value={totalTenants} />
                        <KPICard title={t('platform.revenue.mrr') || 'MRR'} value={formatCurrency(billingStats?.mrr || 0)} />
                        <KPICard title={t('platform.dashboard.active_tenants')} value={activeTenants} />
                        <KPICard title={t('platform.dashboard.total_users')} value={totalUsers} />
                    </>
                )}
            </div>

            {/* Charts and Lists Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Pulse */}
                <div className="lg:col-span-1">
                    <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group h-full flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2 mb-2">
                                <TrendingUp className={`h-5 w-5 text-indigo-300 ${isRtl ? 'ml-2' : ''}`} />
                                {t('platform.revenue.expansion_pulse') || 'Revenue Pulse'}
                            </h3>
                            <div className="text-4xl font-black mb-1">{formatCurrency(billingStats?.mrr || 0)}</div>
                            <div className="text-indigo-200 text-sm font-medium">{t('platform.revenue.mrr_label') || 'Monthly Ecosystem Yield'}</div>

                            <div className="h-48 mt-8 -mx-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueTrends || []}>
                                        <defs>
                                            <linearGradient id="dashboardRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#fff" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#fff" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="#fff"
                                            strokeWidth={3}
                                            fill="url(#dashboardRevenue)"
                                            animationDuration={1500}
                                        />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-white p-2 rounded-lg shadow-xl border-none">
                                                            <p className="text-[10px] font-black text-indigo-600 uppercase">{payload[0].payload.month}</p>
                                                            <p className="text-sm font-bold text-slate-900">{formatCurrency(payload[0].value as number)}</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <Link href="/platform/revenue" className="relative z-10 mt-8">
                            <button className="w-full bg-white text-indigo-600 hover:bg-slate-50 py-4 rounded-2xl font-black text-sm shadow-xl active:scale-[0.98] transition-all">
                                {t('platform.revenue.view_ledger') || 'View Full Ledger'}
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Tenant List */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-900">{t('platform.dashboard.all_tenants')}</h2>
                        <Link
                            href="/platform/tenants"
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                        >
                            {t('platform.dashboard.view_all')} {isRtl ? '←' : '→'}
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="p-8 space-y-6 flex-1">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-20 animate-pulse bg-slate-50 rounded-2xl" />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center text-red-500">{t('common.error')}</div>
                    ) : tenants?.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">{t('platform.tenants.no_tenants')}</div>
                    ) : (
                        <div className="divide-y divide-slate-50 flex-1">
                            {tenants?.slice(0, 5).map(tenant => (
                                <div key={tenant.id} className="p-8 hover:bg-slate-50 transition-colors group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-white border border-transparent group-hover:border-slate-100 transition-all">
                                                <Building2 className="h-6 w-6 text-slate-400 group-hover:text-indigo-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{tenant.name}</h3>
                                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                                    {tenant.subdomain}.partivo.net · {tenant._count.users} {t('common.users').toLowerCase()}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${tenant.status === 'ACTIVE'
                                            ? 'bg-emerald-50 text-emerald-600'
                                            : 'bg-rose-50 text-rose-600'
                                            }`}>
                                            {tenant.status === 'ACTIVE' ? (
                                                <ShieldCheck className="h-3 w-3" />
                                            ) : (
                                                <ShieldBan className="h-3 w-3" />
                                            )}
                                            {tenant.status === 'ACTIVE' ? t('common.active') : t('common.suspended')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

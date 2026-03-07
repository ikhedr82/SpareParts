'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { SkeletonTable, EmptyState, DataTable, StatusBadge } from '@/components/ui-harden';
import { formatCurrency, formatDate } from '@/lib/formatters';
import {
    DollarSign, TrendingUp, CreditCard, Building2, AlertCircle,
    ArrowUpRight, ArrowDownRight, History, FileText, Users, Zap, RefreshCw, Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';

export default function PlatformRevenuePage() {
    const { t, language } = useLanguage();
    const isRtl = language === 'ar';

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);
    const [search, setSearch] = useState('');

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['platform-billing-stats'],
        queryFn: async () => {
            const res = await apiClient.get('/api/platform/tenants/billing/stats');
            return res.data;
        }
    });

    const { data: invoiceData, isLoading: invoicesLoading } = useQuery({
        queryKey: ['platform-global-invoices', page, limit, search],
        queryFn: async () => {
            const res = await apiClient.get('/api/platform/tenants/billing/invoices', {
                params: { page, limit, search }
            });
            return res.data;
        }
    });

    const { data: activity, isLoading: activityLoading } = useQuery({
        queryKey: ['platform-billing-activity'],
        queryFn: async () => {
            const res = await apiClient.get('/api/platform/tenants/billing/activity');
            return res.data;
        }
    });

    const { data: trends, isLoading: trendsLoading } = useQuery({
        queryKey: ['platform-revenue-trends'],
        queryFn: async () => {
            const res = await apiClient.get('/api/platform/tenants/revenue/trends');
            return res.data;
        }
    });

    if (statsLoading || invoicesLoading || activityLoading || trendsLoading) {
        return (
            <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <div className="text-center">
                    <p className="text-slate-900 font-black text-xl tracking-tight">{t('platform.revenue.loading_title')}</p>
                    <p className="text-slate-500 font-medium">{t('platform.revenue.loading_desc')}</p>
                </div>
            </div>
        );
    }

    const conversionRate = Math.round(((stats?.activeSubscribers || 0) / (stats?.totalTenants || 1)) * 100);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <DollarSign className="h-10 w-10 text-indigo-600" />
                        {t('platform.revenue.title')}
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg font-medium">
                        {t('platform.revenue.subtitle_prefix')} <span className="text-indigo-600 font-bold underline decoration-2">{stats?.totalTenants || 0}</span> {t('platform.revenue.subtitle_suffix')}
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 font-bold shadow-sm">
                        <FileText className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'} text-slate-400`} />
                        {t('common.export')}
                    </Button>
                    <Button className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold shadow-xl shadow-indigo-100">
                        <RefreshCw className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                        {t('platform.revenue.manual_sync')}
                    </Button>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title={t('platform.revenue.mrr')}
                    value={formatCurrency(stats?.mrr || 0)}
                    subtitle={`+12.5% ${t('platform.revenue.mrr_growth')}`}
                    icon={DollarSign}
                    color="indigo"
                />
                <StatsCard
                    title={t('platform.revenue.active_subs')}
                    value={stats?.activeSubscribers || 0}
                    subtitle={`${conversionRate}% ${t('platform.revenue.conv_rate')}`}
                    icon={Zap}
                    color="emerald"
                />
                <StatsCard
                    title={t('platform.revenue.past_due')}
                    value={formatCurrency((stats?.pastDueSubscribers || 0) * 149)}
                    subtitle={`${stats?.pastDueSubscribers || 0} ${t('platform.revenue.pending_subs')}`}
                    icon={AlertCircle}
                    color="rose"
                />
                <StatsCard
                    title={t('platform.revenue.projected')}
                    value={formatCurrency((stats?.mrr || 0) * 12)}
                    subtitle={t('platform.revenue.momentum')}
                    icon={TrendingUp}
                    color="blue"
                />
            </div>

            {/* Revenue Trend Chart */}
            <Card className="rounded-[2.5rem] border-none outline outline-1 outline-slate-100 shadow-sm overflow-hidden bg-white">
                <CardHeader className="p-8 pb-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                <TrendingUp className="h-6 w-6 text-indigo-600" />
                                {t('platform.revenue.growth_trajectory') || 'Growth Trajectory'}
                            </CardTitle>
                            <CardDescription>Historical monthly performance aggregation</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Synthesis</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 pt-4 h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trends || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                tickFormatter={(val) => `$${val}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '16px',
                                    border: 'none',
                                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                    padding: '12px 16px'
                                }}
                                cursor={{ stroke: '#4f46e5', strokeWidth: 2, strokeDasharray: '4 4' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="#4f46e5"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                                animationDuration={2000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Global Transaction Feed */}
                <div className="xl:col-span-2 space-y-6">
                    <Card className="border-slate-200 shadow-sm overflow-hidden border-none outline outline-1 outline-slate-100">
                        <CardHeader className="bg-white border-b border-slate-50 py-6 px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <History className="h-5 w-5 text-indigo-600" />
                                    {t('platform.revenue.transaction_feed')}
                                </CardTitle>
                                <CardDescription>{t('platform.revenue.live_ops')}</CardDescription>
                            </div>
                            <div className="relative max-w-xs w-full">
                                <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400`} />
                                <Input
                                    placeholder={t('common.search')}
                                    className={`${isRtl ? 'pr-10' : 'pl-10'} rounded-xl h-10 border-slate-200`}
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                                />
                            </div>
                        </CardHeader>
                        <DataTable
                            data={invoiceData?.items}
                            total={invoiceData?.total}
                            page={page}
                            limit={limit}
                            onPageChange={setPage}
                            onLimitChange={setLimit}
                            isLoading={invoicesLoading}
                            emptyTitle={t('platform.revenue.no_invoices')}
                            columns={[
                                {
                                    header: t('platform.revenue.tenant'),
                                    render: (inv) => (
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                                <Building2 className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 text-sm leading-tight">{inv.tenant?.name}</div>
                                                <div className="text-[10px] text-slate-400 font-mono">{inv.tenant?.subdomain}</div>
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    header: t('common.date') || 'Date',
                                    render: (inv) => <span className="text-sm font-medium text-slate-500">{formatDate(inv.createdAt)}</span>
                                },
                                {
                                    header: t('common.status') || 'Status',
                                    render: (inv) => <StatusBadge status={inv.status} />
                                },
                                {
                                    header: t('platform.revenue.amount'),
                                    align: isRtl ? 'left' : 'right',
                                    render: (inv) => (
                                        <span className="font-black text-slate-900 text-base">
                                            {formatCurrency(inv.amount)}
                                        </span>
                                    )
                                }
                            ]}
                        />
                    </Card>
                </div>

                {/* Growth Insights & Billing Log */}
                <div className="space-y-6">
                    <Card className="bg-indigo-600 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-200 border-none relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                        <div className="relative z-10 space-y-6">
                            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                                <Zap className={`h-5 w-5 text-indigo-300 fill-indigo-300 ${isRtl ? 'ml-2' : ''}`} />
                                {t('platform.revenue.expansion_pulse')}
                            </h3>
                            <div className="space-y-4">
                                <InsightRow label={t('platform.revenue.conv_velocity')} value="84%" trend="up" />
                                <InsightRow label={t('platform.revenue.churn_sens')} value="1.2%" trend="down" />
                                <InsightRow label={t('platform.revenue.ltv_avg')} value="$1,850" trend="up" />
                            </div>
                            <Button className="w-full bg-white text-indigo-600 hover:bg-slate-50 py-6 rounded-2xl font-black text-sm shadow-xl active:scale-[0.98] transition-all">
                                {t('platform.revenue.opt_hub')}
                            </Button>
                        </div>
                    </Card>

                    <Card className="rounded-3xl border-slate-100 shadow-sm p-8">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                            <FileText className="w-6 h-6 text-indigo-600" />
                            {t('platform.revenue.billing_log')}
                        </h3>
                        <div className="space-y-6">
                            {activity?.items?.length > 0 ? activity.items.map((log: any) => (
                                <ActivityItem
                                    key={log.id}
                                    label={t(`audit.actions.${log.action}`) || log.action.replace(/_/g, ' ')}
                                    desc={log.user?.email || 'System'}
                                    time={formatDate(log.createdAt)}
                                    icon={log.action.includes('CREATE') ? ArrowUpRight : log.action.includes('CANCEL') ? ArrowDownRight : TrendingUp}
                                    color={log.action.includes('CREATE') ? 'indigo' : log.action.includes('CANCEL') ? 'rose' : 'emerald'}
                                />
                            )) : (
                                <div className="text-center py-8">
                                    <p className="text-sm text-slate-400 font-medium italic">{t('platform.revenue.no_activity')}</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, subtitle, icon: Icon, color }: any) {
    const colors: any = {
        indigo: 'bg-indigo-50 text-indigo-600 shadow-indigo-100/50',
        emerald: 'bg-emerald-50 text-emerald-600 shadow-emerald-100/50',
        rose: 'bg-rose-50 text-rose-600 shadow-rose-100/50',
        blue: 'bg-blue-50 text-blue-600 shadow-blue-100/50',
    };

    return (
        <Card className="rounded-3xl p-8 border-none outline outline-1 outline-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${colors[color]} group-hover:scale-110 transition-transform duration-500`}>
                <Icon className="w-7 h-7" />
            </div>
            <h4 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">{title}</h4>
            <div className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{value}</div>
            <p className="text-slate-500 text-xs font-semibold">{subtitle}</p>
        </Card>
    );
}

function InsightRow({ label, value, trend }: any) {
    return (
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <span className="text-indigo-100/80 text-sm font-medium">{label}</span>
            <div className="flex items-center gap-2">
                <span className="font-black text-lg">{value}</span>
                {trend === 'up' ? <ArrowUpRight className="w-4 h-4 text-emerald-300" /> : <ArrowDownRight className="w-4 h-4 text-rose-300" />}
            </div>
        </div>
    );
}

function ActivityItem({ label, desc, time, icon: Icon, color }: any) {
    const colors: any = {
        indigo: 'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        rose: 'bg-rose-50 text-rose-600',
    };

    return (
        <div className="flex gap-4 group cursor-pointer hover:bg-slate-50 p-2 -m-2 rounded-xl transition-colors">
            <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${colors[color]} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 flex flex-col justify-center min-w-0">
                <div className="flex justify-between items-start gap-2">
                    <div className="font-bold text-slate-900 text-sm truncate uppercase tracking-tight">{label}</div>
                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{time}</span>
                </div>
                <div className="text-xs text-slate-500 font-medium truncate italic">{desc}</div>
            </div>
        </div>
    );
}

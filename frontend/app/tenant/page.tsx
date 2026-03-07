'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import apiClient from '@/lib/api';
import { KPICard } from '@/components/kpi-card';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend
} from 'recharts';

export default function TenantDashboard() {
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';

    const [kpis, setKpis] = useState<any>(null);
    const [salesData, setSalesData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const [dashboardRes, salesRes] = await Promise.all([
                    apiClient.get('/analytics/dashboard'),
                    apiClient.get('/analytics/sales?period=daily'),
                ]);
                setKpis(dashboardRes.data);
                setSalesData(salesRes.data || []);
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
                setError(t('common.error_occurred'));
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [t]);

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-10 bg-slate-200 rounded w-1/4" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-slate-200 rounded-xl" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-72 bg-slate-200 rounded-xl" />
                        <div className="h-72 bg-slate-200 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
                <AlertTriangle className="h-12 w-12 text-red-300 mb-4" />
                <p className="text-xl font-semibold text-slate-700">{t('common.error')}</p>
                <p className="text-slate-500 mt-1">{error}</p>
            </div>
        );
    }

    return (
        <div className={`p-8 ${isRTL ? 'rtl' : 'ltr'}`}>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">{t('dashboard.title')}</h1>
                <p className="text-slate-600 mt-1">{t('dashboard.subtitle')}</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPICard
                    title={t('dashboard.total_revenue')}
                    value={`${Number(kpis?.totalRevenue || 0).toLocaleString()}`}
                    change="12%"
                    positive
                />
                <KPICard
                    title={t('dashboard.total_sales')}
                    value={kpis?.salesCount ?? 0}
                    change="5"
                    positive
                />
                <KPICard
                    title={t('dashboard.avg_order_value')}
                    value={`${Number(kpis?.averageOrderValue || 0).toFixed(2)}`}
                />
                <KPICard
                    title={t('dashboard.gross_sales')}
                    value={`${Number(kpis?.totalSales || 0).toLocaleString()}`}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Sales Trend */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-indigo-500" />
                        {t('dashboard.sales_trend')}
                    </h2>
                    {salesData.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-slate-400">
                            <p>{t('dashboard.no_data')}</p>
                        </div>
                    ) : (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(str) => new Date(str).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' })}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        name={t('dashboard.revenue')}
                                        stroke="#4f46e5"
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Cash vs Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-6">{t('dashboard.payment_breakdown')}</h2>
                    {salesData.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-slate-400">
                            <p>{t('dashboard.no_data')}</p>
                        </div>
                    ) : (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesData}>
                                    <defs>
                                        <linearGradient id="cash" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        name={t('dashboard.revenue')}
                                        stroke="#4f46e5"
                                        fill="url(#cash)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            {/* Branch Performance & Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('dashboard.branch_performance')}</h2>
                    {(!kpis?.branchPerformance || kpis.branchPerformance.length === 0) ? (
                        <p className="text-slate-400 text-sm py-8 text-center">{t('dashboard.no_data')}</p>
                    ) : (
                        <div className="space-y-4">
                            {kpis.branchPerformance.map((branch: any, i: number) => (
                                <div key={branch.id || i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                            <span className="text-indigo-600 font-bold">{i + 1}</span>
                                        </div>
                                        <p className="font-semibold text-slate-900">{branch.name}</p>
                                    </div>
                                    <p className="font-bold text-slate-900">{Number(branch.revenue || 0).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('dashboard.quick_stats')}</h2>
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">{t('dashboard.open_sessions')}</p>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <p className="font-semibold text-slate-900">
                                    {kpis?.openSessions ?? 0}
                                </p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">{t('dashboard.unpaid_invoices')}</p>
                            <p className="font-semibold text-slate-900">
                                {kpis?.unpaidInvoices ?? 0} {t('common.total').toLowerCase()}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">{t('dashboard.stock_alerts')}</p>
                            <p className={`font-semibold ${(kpis?.lowStockCount ?? 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {kpis?.lowStockCount ?? 0} {t('dashboard.low_stock').toLowerCase()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

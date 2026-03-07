'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { BarChart3, TrendingUp, ShoppingCart, Package, Users, Loader2, AlertCircle } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';

interface AnalyticsData {
    revenueTrend: { period: string; revenue: number; }[];
    topProducts: { name: string; sold: number; revenue: number; }[];
    salesByBranch: { branchName: string; total: number; count: number; }[];
    kpis: {
        totalRevenue: number;
        totalSales: number;
        avgOrderValue: number;
        totalCustomers: number;
    };
}

export default function AnalyticsPage() {
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';

    const { data, isLoading, isError } = useQuery<AnalyticsData>({
        queryKey: ['analytics'],
        queryFn: async () => {
            const { data } = await apiClient.get('/analytics');
            return data;
        },
    });

    if (isLoading) {
        return (
            <div className={`p-8 ${isRTL ? 'rtl' : 'ltr'}`}>
                <div className="p-12 text-center text-slate-400">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3" />
                    <p>{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className={`p-8 ${isRTL ? 'rtl' : 'ltr'}`}>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-8">
                    <BarChart3 className="h-8 w-8 text-indigo-600" />
                    {t('analytics.title')}
                </h1>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
                    <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                    <p className="text-amber-800 font-medium">{t('analytics.no_data')}</p>
                    <p className="text-amber-700 text-sm mt-1">{t('analytics.no_data_hint')}</p>
                </div>
            </div>
        );
    }

    const kpiCards = [
        { label: t('analytics.total_revenue'), value: `${Number(data.kpis.totalRevenue).toFixed(2)}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
        { label: t('analytics.total_sales'), value: data.kpis.totalSales.toString(), icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: t('analytics.avg_order'), value: `${Number(data.kpis.avgOrderValue).toFixed(2)}`, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: t('analytics.total_customers'), value: data.kpis.totalCustomers.toString(), icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className={`p-8 ${isRTL ? 'rtl' : 'ltr'} space-y-8`}>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-indigo-600" />
                {t('analytics.title')}
            </h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiCards.map(card => (
                    <div key={card.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-4`}>
                            <card.icon className={`h-5 w-5 ${card.color}`} />
                        </div>
                        <p className="text-sm text-slate-500 font-medium">{card.label}</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Revenue Trend */}
            {data.revenueTrend?.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-6">{t('analytics.revenue_trend')}</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={data.revenueTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={false} name={t('analytics.total_revenue')} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Sales By Branch */}
            {data.salesByBranch?.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-6">{t('analytics.sales_by_branch')}</h2>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={data.salesByBranch}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="branchName" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="total" fill="#6366f1" name={t('analytics.total_revenue')} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Top Products */}
            {data.topProducts?.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <h2 className="text-lg font-bold text-slate-900 p-6 border-b border-slate-200">{t('analytics.top_products')}</h2>
                    <table className={`w-full ${isRTL ? 'text-right' : 'text-left'}`}>
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-3">{t('common.name')}</th>
                                <th className="px-6 py-3">{t('analytics.units_sold')}</th>
                                <th className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-right'}`}>{t('analytics.total_revenue')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.topProducts.map((p, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-3 text-sm font-medium text-slate-900">{p.name}</td>
                                    <td className="px-6 py-3 text-sm text-slate-600">{p.sold}</td>
                                    <td className={`px-6 py-3 text-sm font-semibold text-slate-900 ${isRTL ? 'text-left' : 'text-right'}`}>
                                        {Number(p.revenue).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

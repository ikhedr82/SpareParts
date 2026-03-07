'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { ShoppingCart, DollarSign, ArrowRightLeft, CreditCard, Loader2, Package } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Link from 'next/link';

interface DashboardSummary {
  pendingOrders: number;
  totalSpent: number;
  pendingSubstitutions: number;
  availableCredit: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch orders for dashboard stats
      const [ordersRes, balanceRes, subsRes] = await Promise.allSettled([
        api.get('/portal/orders'),
        api.get('/portal/financials/balance'),
        api.get('/portal/substitutions/pending'),
      ]);

      const orders = ordersRes.status === 'fulfilled' ? ordersRes.value.data : [];
      const balance = balanceRes.status === 'fulfilled' ? balanceRes.value.data : null;
      const subs = subsRes.status === 'fulfilled' ? subsRes.value.data : [];

      const pendingOrders = orders.filter((o: any) => o.status === 'PENDING').length;
      const totalSpent = orders.reduce((sum: number, o: any) => sum + (Number(o.totalAmount) || 0), 0);

      setData({
        pendingOrders,
        totalSpent,
        pendingSubstitutions: subs.length,
        availableCredit: balance?.availableCredit || 0,
        recentOrders: orders.slice(0, 5),
      });
    } catch {
      // Silent fail - dashboard is best-effort
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const stats = [
    { icon: ShoppingCart, label: t('portal.dashboard.pending_orders'), value: data?.pendingOrders ?? 0, color: 'blue', href: '/procurement' },
    { icon: DollarSign, label: t('portal.dashboard.total_spent'), value: (data?.totalSpent ?? 0).toLocaleString(), color: 'green', href: '/financials' },
    { icon: ArrowRightLeft, label: t('portal.dashboard.pending_subs'), value: data?.pendingSubstitutions ?? 0, color: 'yellow', href: '/substitutions' },
    { icon: CreditCard, label: t('portal.dashboard.available_credit'), value: (data?.availableCredit ?? 0).toLocaleString(), color: 'purple', href: '/financials' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'SHIPPED': return 'bg-blue-100 text-blue-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{t('portal.dashboard.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('portal.dashboard.subtitle')}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <Link key={i} href={stat.href} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow group">
            <div className={`p-3 rounded-full me-4 ${colorMap[stat.color]}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm text-gray-500">{stat.label}</div>
              <div className="text-2xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{stat.value}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">{t('portal.dashboard.recent_orders')}</h2>
          <Link href="/procurement" className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
            {t('common.details')} →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('common.order')} #</th>
                <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('common.status')}</th>
                <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('common.amount')}</th>
                <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('common.date')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(!data?.recentOrders || data.recentOrders.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">
                    {t('portal.dashboard.no_recent_orders')}
                  </td>
                </tr>
              )}
              {data?.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 whitespace-nowrap font-medium text-gray-900 text-sm">
                    {order.orderNumber || order.id.substring(0, 8)}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700 font-medium">
                    {Number(order.totalAmount).toLocaleString()}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, FileText, CheckCircle, Clock, Truck } from 'lucide-react';
import apiClient from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface PurchaseOrder {
    id: string; supplierName: string;
    status: 'DRAFT' | 'ORDERED' | 'RECEIVED';
    totalCost: number; createdAt: string; items: any[];
}

const STATUS_COLORS: Record<string, string> = {
    RECEIVED: 'bg-green-100 text-green-700',
    ORDERED: 'bg-blue-100 text-blue-700',
    DRAFT: 'bg-slate-100 text-slate-700',
};

export default function PurchaseOrdersPage() {
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';

    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            const response = await apiClient.get('/purchase-orders');
            setOrders(response.data);
        } catch (err) { console.error('Failed to fetch purchase orders:', err); }
        finally { setLoading(false); }
    };

    const statusLabel = (s: string) => {
        if (s === 'DRAFT') return t('purchase_orders.status_draft');
        if (s === 'ORDERED') return t('purchase_orders.status_ordered');
        if (s === 'RECEIVED') return t('purchase_orders.status_received');
        return s;
    };

    const filteredOrders = orders.filter(o =>
        o.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={`p-8 ${isRTL ? 'rtl' : 'ltr'}`}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{t('purchase_orders.title')}</h1>
                    <p className="text-slate-600 mt-1">{t('purchase_orders.subtitle')}</p>
                </div>
                <Link
                    href="/tenant/purchase-orders/new"
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
                >
                    <Plus className="h-4 w-4" /> {t('purchase_orders.create')}
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center gap-4">
                    <div className={`relative flex-1 max-w-md`}>
                        <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400`} />
                        <input
                            type="text"
                            placeholder={t('purchase_orders.search_placeholder')}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500`}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-500">{t('common.loading')}</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>{t('purchase_orders.no_orders')}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className={`w-full ${isRTL ? 'text-right' : 'text-left'}`}>
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-700">{t('purchase_orders.order_id')}</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">{t('purchase_orders.supplier')}</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">{t('common.date')}</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">{t('common.status')}</th>
                                    <th className={`px-6 py-4 font-semibold text-slate-700 ${isRTL ? 'text-left' : 'text-right'}`}>{t('common.total')}</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 font-medium text-slate-900">#{order.id.slice(0, 8).toUpperCase()}</td>
                                        <td className="px-6 py-4 text-slate-600">{order.supplierName}</td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                                                {order.status === 'RECEIVED' && <CheckCircle className="w-3 h-3" />}
                                                {order.status === 'ORDERED' && <Truck className="w-3 h-3" />}
                                                {order.status === 'DRAFT' && <Clock className="w-3 h-3" />}
                                                {statusLabel(order.status)}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 font-medium text-slate-900 ${isRTL ? 'text-left' : 'text-right'}`}>
                                            {Number(order.totalCost).toFixed(2)}
                                        </td>
                                        <td className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}>
                                            <Link href={`/tenant/purchase-orders/${order.id}`}
                                                className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                                                {t('purchase_orders.view_details')}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

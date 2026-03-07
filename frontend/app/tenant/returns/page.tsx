'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import Link from 'next/link';
import { RotateCcw, Plus, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import apiClient from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface PurchaseReturn {
    id: string; purchaseOrderId: string;
    status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
    purchaseOrder: { id: string; };
    items: any[];
}

const STATUS_CLASSES: Record<string, string> = {
    APPROVED: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    REQUESTED: 'bg-yellow-100 text-yellow-700',
    SHIPPED: 'bg-purple-100 text-purple-700',
    CANCELLED: 'bg-slate-100 text-slate-700',
};

export default function PurchaseReturnsPage() {
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';
    const [searchTerm, setSearchTerm] = useState('');

    const { data: returns, isLoading } = useQuery<PurchaseReturn[]>({
        queryKey: ['purchase-returns'],
        queryFn: async () => {
            const { data } = await apiClient.get('/purchase-returns');
            return data;
        },
    });

    const statusLabel = (s: string) => {
        const map: Record<string, string> = {
            REQUESTED: t('returns.status_requested'), APPROVED: t('returns.status_approved'),
            REJECTED: t('returns.status_rejected'), SHIPPED: t('returns.status_shipped'),
            COMPLETED: t('returns.status_completed'), CANCELLED: t('returns.status_cancelled'),
        };
        return map[s] || s;
    };

    const filteredReturns = returns?.filter(r =>
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.purchaseOrderId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const dateLocale = language === 'ar' ? arSA : enUS;

    return (
        <div className={`p-8 ${isRTL ? 'rtl' : 'ltr'}`}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <RotateCcw className="h-8 w-8 text-indigo-600" />
                        {t('returns.title')}
                    </h1>
                    <p className="text-slate-600 mt-1">{t('returns.subtitle')}</p>
                </div>
                <Link href="/tenant/returns/new"
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                    <Plus className="h-4 w-4" /> {t('returns.create')}
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-4">
                    <div className={`relative flex-1 max-w-md`}>
                        <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400`} />
                        <input type="text" placeholder={t('returns.search_placeholder')}
                            className={`${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} w-full py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 text-sm`}
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 hover:bg-slate-50 text-sm font-medium">
                        <Filter className="h-4 w-4" /> {t('returns.filter')}
                    </button>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center text-slate-500">{t('common.loading')}</div>
                ) : (
                    <table className={`w-full ${isRTL ? 'text-right' : 'text-left'} border-collapse`}>
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">{t('returns.return_id')}</th>
                                <th className="px-6 py-4">{t('returns.po_reference')}</th>
                                <th className="px-6 py-4">{t('common.date')}</th>
                                <th className="px-6 py-4">{t('common.status')}</th>
                                <th className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}>{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {!filteredReturns || filteredReturns.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">{t('returns.no_returns')}</td></tr>
                            ) : filteredReturns.map(ret => (
                                <tr key={ret.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{ret.id.substring(0, 8)}…</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">PO-{ret.purchaseOrderId.substring(0, 8)}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {format(new Date(ret.createdAt), 'MMM d, yyyy', { locale: dateLocale })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CLASSES[ret.status] || 'bg-slate-100 text-slate-700'}`}>
                                            {statusLabel(ret.status)}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}>
                                        <Link href={`/tenant/returns/${ret.id}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                                            {t('returns.view_details')}
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

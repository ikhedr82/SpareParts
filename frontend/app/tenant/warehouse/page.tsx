'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ClipboardList, ArrowRight, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import apiClient from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const STATUS_CLASSES: Record<string, string> = {
    CREATED: 'bg-blue-50 text-blue-700 border-blue-100',
    PICKING: 'bg-yellow-50 text-yellow-700 border-yellow-100 animate-pulse',
    PICKED: 'bg-green-50 text-green-700 border-green-100',
    PACKED: 'bg-purple-50 text-purple-700 border-purple-100',
    CANCELLED: 'bg-red-50 text-red-700 border-red-100',
};

export default function WarehousePage() {
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';
    const dateLocale = language === 'ar' ? arSA : enUS;

    const { data: pickLists, isLoading } = useQuery({
        queryKey: ['picklists'],
        queryFn: async () => {
            const { data } = await apiClient.get('/warehouse/picklists');
            return data;
        },
    });

    return (
        <div className={`p-8 ${isRTL ? 'rtl' : 'ltr'}`}>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('warehouse.title')}</h1>
            <p className="text-slate-600 mb-8">{t('warehouse.pick_lists')}</p>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <table className={`w-full ${isRTL ? 'text-right' : 'text-left'}`}>
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="px-6 py-4">{t('warehouse.pick_lists')}</th>
                            <th className="px-6 py-4">{t('common.order')}</th>
                            <th className="px-6 py-4">{t('common.items')}</th>
                            <th className="px-6 py-4">{t('common.date')}</th>
                            <th className="px-6 py-4">{t('common.status')}</th>
                            <th className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}>{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading && (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-500">{t('common.loading')}</td></tr>
                        )}
                        {!isLoading && (!pickLists || pickLists.length === 0) && (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-500">{t('common.no_data')}</td></tr>
                        )}
                        {pickLists?.map((pl: any) => (
                            <tr key={pl.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">
                                    <div className="flex items-center gap-2">
                                        <ClipboardList className="h-4 w-4 text-slate-400" />
                                        {pl.id.substring(0, 8)}…
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">{pl.order ? `ORD-${pl.order.orderNumber}` : '-'}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{pl.items?.length || 0}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {format(new Date(pl.createdAt), 'MMM d, p', { locale: dateLocale })}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_CLASSES[pl.status] || 'bg-slate-50 text-slate-700'}`}>
                                        {pl.status}
                                    </span>
                                </td>
                                <td className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}>
                                    <Link href={`/tenant/warehouse/${pl.id}`}
                                        className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1">
                                        {t('warehouse.packs')}
                                        {isRTL ? <ArrowLeft className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

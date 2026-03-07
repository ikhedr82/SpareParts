'use client';

import { useQuery } from '@tanstack/react-query';
import { format, isPast } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import Link from 'next/link';
import { FileText, Plus, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import apiClient from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Quote {
    id: string; quoteNumber: string; customerName: string;
    status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED';
    total: number; validUntil: string; createdAt: string;
}

export default function QuotesPage() {
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';
    const [searchTerm, setSearchTerm] = useState('');
    const dateLocale = language === 'ar' ? arSA : enUS;

    const { data: quotes, isLoading } = useQuery<Quote[]>({
        queryKey: ['quotes'],
        queryFn: async () => {
            const { data } = await apiClient.get('/sales-extensions/quotes');
            return data;
        },
    });

    const statusLabel = (s: string) => {
        const map: Record<string, string> = {
            DRAFT: t('quotes.status_draft'), SENT: t('quotes.status_sent'),
            ACCEPTED: t('quotes.status_accepted'), REJECTED: t('quotes.status_rejected'),
            EXPIRED: t('quotes.status_expired'), CONVERTED: t('quotes.status_converted'),
        };
        return map[s] || s;
    };

    const getStatusColor = (status: string, validUntil: string) => {
        if (status !== 'CONVERTED' && status !== 'REJECTED' && isPast(new Date(validUntil)))
            return 'bg-red-50 text-red-700 border-red-200';
        const map: Record<string, string> = {
            ACCEPTED: 'bg-blue-100 text-blue-700', CONVERTED: 'bg-green-100 text-green-700',
            REJECTED: 'bg-red-100 text-red-700', SENT: 'bg-purple-100 text-purple-700',
            DRAFT: 'bg-slate-100 text-slate-700', EXPIRED: 'bg-amber-100 text-amber-700',
        };
        return map[status] || 'bg-slate-100 text-slate-700';
    };

    const filteredQuotes = quotes?.filter(q =>
        q.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`p-8 ${isRTL ? 'rtl' : 'ltr'}`}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <FileText className="h-8 w-8 text-indigo-600" />
                        {t('quotes.title')}
                    </h1>
                    <p className="text-slate-600 mt-1">{t('quotes.subtitle')}</p>
                </div>
                <Link href="/tenant/quotes/new"
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                    <Plus className="h-4 w-4" /> {t('quotes.new_quote')}
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-4">
                    <div className={`relative flex-1 max-w-md`}>
                        <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400`} />
                        <input type="text" placeholder={t('quotes.search_placeholder')}
                            className={`${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} w-full py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 text-sm`}
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 hover:bg-slate-50 text-sm font-medium">
                        <Filter className="h-4 w-4" /> {t('quotes.filter')}
                    </button>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center text-slate-500">{t('common.loading')}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className={`w-full ${isRTL ? 'text-right' : 'text-left'} border-collapse`}>
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">{t('quotes.quote_number')}</th>
                                    <th className="px-6 py-4">{t('quotes.customer')}</th>
                                    <th className="px-6 py-4">{t('common.total')}</th>
                                    <th className="px-6 py-4">{t('quotes.valid_until')}</th>
                                    <th className="px-6 py-4">{t('common.status')}</th>
                                    <th className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}>{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {!filteredQuotes || filteredQuotes.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                        {t('quotes.no_quotes')}
                                    </td></tr>
                                ) : filteredQuotes.map(quote => (
                                    <tr key={quote.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{quote.quoteNumber}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{quote.customerName}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">{Number(quote.total).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {format(new Date(quote.validUntil), 'MMM d, yyyy', { locale: dateLocale })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(quote.status, quote.validUntil)}`}>
                                                {statusLabel(quote.status)}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}>
                                            <Link href={`/tenant/quotes/${quote.id}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                                                {t('quotes.view_details')}
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

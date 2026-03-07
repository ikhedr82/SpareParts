'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { Search, Eye, Filter, FileText, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { format } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';

interface Invoice {
    id: string;
    invoiceNumber: string;
    amount: number;
    status: string;
    createdAt: string;
    issuedAt: string;
    sale: {
        id: string;
        customerName?: string;
    };
}

export default function InvoicesPage() {
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';
    const dateLocale = language === 'ar' ? arSA : enUS;

    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState('ALL');

    const fetchInvoices = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.get('/invoices');
            setInvoices(res.data);
        } catch (error: any) {
            console.error('Failed to fetch invoices:', error);
            setError(error.response?.data?.message || t('common.error_occurred'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const filteredInvoices = invoices.filter(inv =>
        filterStatus === 'ALL' || inv.status === filterStatus
    );

    const statusLabel = (s: string) => {
        const map: Record<string, string> = {
            PAID: t('finance.status_paid'),
            UNPAID: t('finance.status_unpaid'),
            VOID: t('finance.status_void'),
        };
        return map[s] || s;
    };

    return (
        <div className={`p-8 ${isRTL ? 'rtl' : 'ltr'}`}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{t('finance.invoices')}</h1>
                    <p className="text-slate-600">{t('finance.invoices_desc')}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <select
                            className={`pl-3 ${isRTL ? 'pl-8 pr-3' : 'pr-8'} py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white text-sm`}
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="ALL">{t('finance.all_statuses')}</option>
                            <option value="PAID">{t('finance.status_paid')}</option>
                            <option value="UNPAID">{t('finance.status_unpaid')}</option>
                            <option value="VOID">{t('finance.status_void')}</option>
                        </select>
                        <Filter className={`absolute ${isRTL ? 'left-2' : 'right-2'} top-2.5 w-4 h-4 text-slate-500 pointer-events-none`} />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className={`w-full ${isRTL ? 'text-right' : 'text-left'}`}>
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-900">{t('finance.invoice_no')}</th>
                            <th className="px-6 py-4 font-semibold text-slate-900">{t('finance.date_issued')}</th>
                            <th className="px-6 py-4 font-semibold text-slate-900">{t('sales.customer')}</th>
                            <th className="px-6 py-4 font-semibold text-slate-900">{t('finance.amount')}</th>
                            <th className="px-6 py-4 font-semibold text-slate-900">{t('common.status')}</th>
                            <th className={`px-6 py-4 font-semibold text-slate-900 ${isRTL ? 'text-left' : 'text-right'}`}>{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {loading ? (
                            <tr><td colSpan={6} className="p-12 text-center text-slate-500">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                {t('common.loading')}
                            </td></tr>
                        ) : error ? (
                            <tr><td colSpan={6} className="p-12 text-center text-red-500">
                                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                                {error}
                            </td></tr>
                        ) : filteredInvoices.length === 0 ? (
                            <tr><td colSpan={6} className="p-12 text-center text-slate-500">
                                <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                {t('finance.no_invoices')}
                            </td></tr>
                        ) : (
                            filteredInvoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-slate-400" />
                                        {invoice.invoiceNumber}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 text-sm">
                                        {format(new Date(invoice.issuedAt || invoice.createdAt), 'MMM d, yyyy', { locale: dateLocale })}
                                    </td>
                                    <td className="px-6 py-4 text-slate-900 text-sm">
                                        {invoice.sale?.customerName || t('sales.walk_in')}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900 text-sm">
                                        {Number(invoice.amount).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${invoice.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                            invoice.status === 'UNPAID' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-slate-100 text-slate-700'
                                            }`}>
                                            {statusLabel(invoice.status)}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}>
                                        <button className="text-slate-400 hover:text-indigo-600 p-2" title={t('common.view')}>
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

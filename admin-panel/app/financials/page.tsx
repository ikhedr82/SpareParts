'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { CreditCard, DollarSign, FileText, Loader2, RefreshCcw, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface BalanceInfo {
    currency: string;
    creditLimit: number;
    currentBalance: number;
    availableCredit: number;
    paymentTerms: string;
}

interface Invoice {
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    status: string;
    dueDate: string;
    createdAt: string;
}

export default function FinancialsPage() {
    const { t } = useLanguage();
    const [balance, setBalance] = useState<BalanceInfo | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchFinancials = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [balRes, invRes] = await Promise.allSettled([
                api.get('/portal/financials/balance'),
                api.get('/portal/financials/invoices')
            ]);

            if (balRes.status === 'fulfilled') {
                setBalance(balRes.value.data);
            }
            if (invRes.status === 'fulfilled') {
                setInvoices(invRes.value.data || []);
            }
            if (balRes.status === 'rejected' && invRes.status === 'rejected') {
                setError(t('common.error_occurred'));
            }
        } catch (err: any) {
            setError(err.response?.data?.message || t('common.error_occurred'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchFinancials();
    }, [fetchFinancials]);

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'PAID': return 'bg-green-100 text-green-800 border-green-200';
            case 'OVERDUE': return 'bg-red-100 text-red-800 border-red-200';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-800">{t('portal.financials.title')}</h1>
                    <button
                        onClick={fetchFinancials}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <RefreshCcw className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Balance Cards */}
            {balance && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <span className="text-sm text-gray-500">{t('portal.financials.credit_limit')}</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {Number(balance.creditLimit).toLocaleString()} <span className="text-sm text-gray-400">{balance.currency}</span>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                                <FileText className="w-5 h-5" />
                            </div>
                            <span className="text-sm text-gray-500">{t('portal.financials.current_balance')}</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {Number(balance.currentBalance).toLocaleString()} <span className="text-sm text-gray-400">{balance.currency}</span>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <span className="text-sm text-gray-500">{t('portal.financials.available_credit')}</span>
                        </div>
                        <div className="text-2xl font-bold text-green-700">
                            {Number(balance.availableCredit).toLocaleString()} <span className="text-sm text-gray-400">{balance.currency}</span>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                <FileText className="w-5 h-5" />
                            </div>
                            <span className="text-sm text-gray-500">{t('portal.financials.payment_terms')}</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {balance.paymentTerms || 'N/A'}
                        </div>
                    </div>
                </div>
            )}

            {/* Invoices Table */}
            <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">{t('portal.financials.invoices')}</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('finance.invoice_no')}</th>
                                <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('common.amount')}</th>
                                <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('common.status')}</th>
                                <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('common.date')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {invoices.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                                        {t('finance.no_invoices')}
                                    </td>
                                </tr>
                            )}
                            {invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                        {inv.invoiceNumber || inv.id.substring(0, 8)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-semibold">
                                        {Number(inv.totalAmount).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(inv.status)}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {new Date(inv.createdAt).toLocaleDateString()}
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

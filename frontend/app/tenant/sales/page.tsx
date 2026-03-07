'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
    ShoppingCart, Search, Plus, Eye, RotateCcw, XCircle,
    Loader2, ChevronLeft, ChevronRight, AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import Link from 'next/link';
import { useDebounce } from '@/lib/hooks/useDebounce';

interface Sale {
    id: string;
    saleNumber?: string;
    customerName?: string;
    total: number;
    status: 'COMPLETED' | 'REFUNDED' | 'VOIDED' | 'PENDING';
    paymentMethod?: string;
    branchName?: string;
    createdAt: string;
    itemCount?: number;
}

interface SalesResponse {
    data: Sale[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const STATUS_CLASSES: Record<string, string> = {
    COMPLETED: 'bg-green-100 text-green-700',
    REFUNDED: 'bg-blue-100 text-blue-700',
    VOIDED: 'bg-slate-100 text-slate-600',
    PENDING: 'bg-yellow-100 text-yellow-700',
};

export default function SalesPage() {
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';
    const queryClient = useQueryClient();

    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [confirmAction, setConfirmAction] = useState<{ type: 'void' | 'refund'; saleId: string } | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const debouncedSearch = useDebounce(searchInput, 300);

    const { data, isLoading, isError } = useQuery<SalesResponse>({
        queryKey: ['sales', page, debouncedSearch],
        queryFn: async () => {
            const { data } = await apiClient.get('/sales', {
                params: { page, limit: 25, search: debouncedSearch || undefined },
            });
            return data;
        },
        placeholderData: (prev) => prev,
    });

    const voidMutation = useMutation({
        mutationFn: async (saleId: string) => {
            await apiClient.post('/sales/void', { saleId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            setConfirmAction(null);
            setActionError(null);
        },
        onError: (err: any) => {
            setActionError(err.response?.data?.message || t('common.error_occurred'));
        },
    });

    const refundMutation = useMutation({
        mutationFn: async (saleId: string) => {
            await apiClient.post('/sales/refund', { saleId, items: [] });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            setConfirmAction(null);
            setActionError(null);
        },
        onError: (err: any) => {
            setActionError(err.response?.data?.message || t('common.error_occurred'));
        },
    });

    const handleConfirm = useCallback(() => {
        if (!confirmAction) return;
        if (confirmAction.type === 'void') voidMutation.mutate(confirmAction.saleId);
        else refundMutation.mutate(confirmAction.saleId);
    }, [confirmAction, voidMutation, refundMutation]);

    const statusLabel = (s: string) => {
        const map: Record<string, string> = {
            COMPLETED: t('sales.status_completed'),
            REFUNDED: t('sales.status_refunded'),
            VOIDED: t('sales.status_voided'),
            PENDING: t('sales.status_pending'),
        };
        return map[s] || s;
    };

    const isPending = voidMutation.isPending || refundMutation.isPending;

    return (
        <div className={`p-8 ${isRTL ? 'rtl' : 'ltr'}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <ShoppingCart className="h-8 w-8 text-indigo-600" />
                        {t('sales.title')}
                    </h1>
                    <p className="text-slate-600 mt-1">{t('sales.subtitle')}</p>
                </div>
                <Link href="/tenant/sales/new"
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
                    <Plus className="h-4 w-4" /> {t('sales.new_sale')}
                </Link>
            </div>

            {/* Search bar */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center gap-4">
                    <div className={`relative flex-1 max-w-md`}>
                        <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400`} />
                        <input
                            type="text"
                            placeholder={t('sales.search_placeholder')}
                            value={searchInput}
                            onChange={e => { setSearchInput(e.target.value); setPage(1); }}
                            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm`}
                        />
                    </div>
                </div>

                {/* Table */}
                {isError ? (
                    <div className="p-12 text-center">
                        <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
                        <p className="text-red-600 font-medium">{t('common.error')}</p>
                    </div>
                ) : isLoading ? (
                    <div className="p-12 text-center text-slate-400">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        {t('common.loading')}
                    </div>
                ) : !data?.data?.length ? (
                    <div className="p-12 text-center text-slate-400">
                        <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>{t('sales.no_sales')}</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className={`w-full ${isRTL ? 'text-right' : 'text-left'}`}>
                                <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase font-semibold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">{t('sales.sale_id')}</th>
                                        <th className="px-6 py-4">{t('sales.customer')}</th>
                                        <th className="px-6 py-4">{t('sales.branch')}</th>
                                        <th className="px-6 py-4">{t('common.date')}</th>
                                        <th className="px-6 py-4">{t('common.status')}</th>
                                        <th className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}>{t('common.total')}</th>
                                        <th className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}>{t('common.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.data.map(sale => (
                                        <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900 text-sm">
                                                #{sale.saleNumber || sale.id.slice(0, 8).toUpperCase()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {sale.customerName || t('sales.walk_in')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {sale.branchName || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {new Date(sale.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASSES[sale.status] || 'bg-slate-100 text-slate-600'}`}>
                                                    {sale.status === 'COMPLETED' && <CheckCircle className="w-3 h-3" />}
                                                    {sale.status === 'PENDING' && <Clock className="w-3 h-3" />}
                                                    {statusLabel(sale.status)}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 font-semibold text-slate-900 text-sm ${isRTL ? 'text-left' : 'text-right'}`}>
                                                {Number(sale.total).toFixed(2)}
                                            </td>
                                            <td className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}>
                                                <div className={`flex items-center gap-1 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                                                    <Link href={`/tenant/sales/${sale.id}`}
                                                        className="p-2 text-slate-400 hover:text-indigo-600 rounded transition-colors" title={t('common.view')}>
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    {sale.status === 'COMPLETED' && (
                                                        <>
                                                            <button
                                                                onClick={() => { setConfirmAction({ type: 'refund', saleId: sale.id }); setActionError(null); }}
                                                                className="p-2 text-slate-400 hover:text-blue-600 rounded transition-colors" title={t('sales.refund')}>
                                                                <RotateCcw className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => { setConfirmAction({ type: 'void', saleId: sale.id }); setActionError(null); }}
                                                                className="p-2 text-slate-400 hover:text-red-600 rounded transition-colors" title={t('sales.void')}>
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className={`px-6 py-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500`}>
                            <span>
                                {t('common.showing')} {((page - 1) * 25) + 1}–{Math.min(page * 25, data.total)} {t('common.of')} {data.total}
                            </span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 transition-colors">
                                    {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                                </button>
                                <span className="font-medium text-slate-900">{page} / {data.totalPages}</span>
                                <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page >= data.totalPages}
                                    className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 transition-colors">
                                    {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Confirmation Dialog */}
            {confirmAction && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-50 rounded-full">
                                {confirmAction.type === 'void'
                                    ? <XCircle className="h-6 w-6 text-red-600" />
                                    : <RotateCcw className="h-6 w-6 text-blue-600" />}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">
                                {confirmAction.type === 'void' ? t('sales.void_confirm_title') : t('sales.refund_confirm_title')}
                            </h3>
                        </div>
                        <p className="text-slate-600 text-sm mb-6">
                            {confirmAction.type === 'void' ? t('sales.void_confirm_msg') : t('sales.refund_confirm_msg')}
                        </p>
                        {actionError && (
                            <p className="text-red-600 text-sm flex items-center gap-1 mb-4">
                                <AlertCircle className="h-3 w-3" /> {actionError}
                            </p>
                        )}
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setConfirmAction(null)}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium">
                                {t('common.cancel')}
                            </button>
                            <button onClick={handleConfirm} disabled={isPending}
                                className={`px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2 ${confirmAction.type === 'void' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                {t('common.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

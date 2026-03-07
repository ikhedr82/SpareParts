'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { ArrowRightLeft, Check, X, Loader2, RefreshCcw, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Substitution {
    id: string;
    status: string;
    createdAt: string;
    originalProduct: { id: string; name: string };
    substituteProduct: { id: string; name: string };
    order: { orderNumber: string };
}

export default function SubstitutionsPage() {
    const { t } = useLanguage();
    const [items, setItems] = useState<Substitution[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchPending = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/portal/substitutions/pending');
            setItems(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || t('common.error_occurred'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchPending();
    }, [fetchPending]);

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        if (actionLoading) return;

        const confirmMsg = action === 'approve'
            ? t('portal.substitutions.approve_confirm')
            : t('portal.substitutions.reject_confirm');

        if (!window.confirm(confirmMsg)) return;

        setActionLoading(id);
        try {
            await api.patch(`/portal/substitutions/${id}/${action}`);
            // Remove from list after successful action
            setItems(prev => prev.filter(s => s.id !== id));
        } catch (err: any) {
            alert(err.response?.data?.message || t('common.error_occurred'));
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-800">{t('portal.substitutions.title')}</h1>
                    <button
                        onClick={fetchPending}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        disabled={loading}
                    >
                        <RefreshCcw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>{items.length} {t('portal.substitutions.pending_count')}</span>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Substitution Cards */}
            {loading && (
                <div className="flex items-center justify-center min-h-[300px]">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                        <p className="text-gray-500">{t('common.loading')}</p>
                    </div>
                </div>
            )}

            {!loading && items.length === 0 && !error && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
                    <ArrowRightLeft className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">{t('portal.substitutions.no_pending')}</p>
                    <p className="text-gray-400 text-sm mt-1">{t('portal.substitutions.no_pending_desc')}</p>
                </div>
            )}

            {!loading && items.map((sub) => (
                <div key={sub.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="text-xs text-gray-400 mb-2">
                                {t('common.order')}: <span className="font-mono font-semibold text-gray-600">{sub.order.orderNumber}</span>
                            </div>
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 flex-1 min-w-[200px]">
                                    <div className="text-xs text-red-500 font-medium mb-1">{t('portal.substitutions.original')}</div>
                                    <div className="font-semibold text-gray-900">{sub.originalProduct.name}</div>
                                </div>
                                <ArrowRightLeft className="w-5 h-5 text-gray-400 shrink-0" />
                                <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3 flex-1 min-w-[200px]">
                                    <div className="text-xs text-green-500 font-medium mb-1">{t('portal.substitutions.proposed')}</div>
                                    <div className="font-semibold text-gray-900">{sub.substituteProduct.name}</div>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 mt-3">
                                {t('common.date')}: {new Date(sub.createdAt).toLocaleDateString()}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 shrink-0">
                            <button
                                onClick={() => handleAction(sub.id, 'approve')}
                                disabled={actionLoading === sub.id}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                                <Check className="w-4 h-4" />
                                {t('portal.substitutions.approve')}
                            </button>
                            <button
                                onClick={() => handleAction(sub.id, 'reject')}
                                disabled={actionLoading === sub.id}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                                <X className="w-4 h-4" />
                                {t('portal.substitutions.reject')}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

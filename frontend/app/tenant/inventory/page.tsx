'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Package, Edit, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, X } from 'lucide-react';
import apiClient from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface InventoryItem {
    id: string;
    productId: string;
    branchId: string;
    quantity: number;
    sellingPrice: number;
    costPrice: number;
    product: {
        name: string;
        sku: string;
        category?: { name: string };
    };
    branch: {
        name: string;
    };
}

interface PaginatedResponse {
    items: InventoryItem[];
    total: number;
    page: number;
    limit: number;
}

type ModalStage = 'form' | 'confirm';

export default function InventoryPage() {
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';

    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit] = useState(25);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
    const [adjustmentQty, setAdjustmentQty] = useState<string>('');
    const [adjustmentReason, setAdjustmentReason] = useState('');
    const [modalStage, setModalStage] = useState<ModalStage>('form');
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const totalPages = Math.ceil(total / limit);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); // reset page on new search
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchInventory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
            });
            if (debouncedSearch) params.set('search', debouncedSearch);

            const response = await apiClient.get<PaginatedResponse>(`/inventory?${params}`);
            setInventory(response.data.items);
            setTotal(response.data.total);
        } catch (err) {
            console.error('Failed to fetch inventory:', err);
            setError(t('common.error_occurred'));
        } finally {
            setLoading(false);
        }
    }, [page, limit, debouncedSearch, t]);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    const handleAdjustClick = (item: InventoryItem) => {
        setAdjustingItem(item);
        setAdjustmentQty('');
        setAdjustmentReason('');
        setModalStage('form');
        setErrorMsg(null);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!adjustmentReason.trim()) {
            setErrorMsg(t('inventory.reason_required'));
            return;
        }
        const qtyChange = Number(adjustmentQty);
        if (isNaN(qtyChange) || qtyChange === 0) return;
        setErrorMsg(null);
        setModalStage('confirm');
    };

    const handleConfirmAdjust = async () => {
        if (!adjustingItem) return;
        const qtyChange = Number(adjustmentQty);
        setSubmitting(true);
        try {
            await apiClient.post('/inventory/adjust', {
                branchId: adjustingItem.branchId,
                productId: adjustingItem.productId,
                quantityChange: qtyChange,
                reason: adjustmentReason,
                unitCost: qtyChange > 0 ? adjustingItem.costPrice : undefined,
            });
            setSuccessMsg(t('inventory.adjust_success'));
            setAdjustingItem(null);
            fetchInventory();
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            console.error('Failed to adjust stock:', err);
            setErrorMsg(t('inventory.adjust_error'));
            setModalStage('form');
        } finally {
            setSubmitting(false);
        }
    };

    const closeModal = () => {
        setAdjustingItem(null);
        setErrorMsg(null);
    };

    const startIndex = (page - 1) * limit + 1;
    const endIndex = Math.min(page * limit, total);

    return (
        <div className={`p-8 ${isRTL ? 'rtl' : 'ltr'}`}>
            {/* Toast */}
            {successMsg && (
                <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg animate-slide-in">
                    <CheckCircle className="h-4 w-4" />
                    <span>{successMsg}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{t('inventory.title')}</h1>
                    <p className="text-slate-600 mt-1">{t('inventory.subtitle')}</p>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 border-b border-slate-200 flex items-center gap-4">
                    <div className={`relative flex-1 max-w-md`}>
                        <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400`} />
                        <input
                            type="text"
                            placeholder={t('inventory.search_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none`}
                        />
                    </div>
                    {total > 0 && (
                        <span className="text-sm text-slate-500 shrink-0">
                            {t('common.showing')} {startIndex}–{endIndex} {t('common.of')} {total}
                        </span>
                    )}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-flex items-center gap-2 text-slate-500">
                            <div className="h-4 w-4 border-2 border-slate-300 border-t-primary rounded-full animate-spin" />
                            {t('common.loading')}
                        </div>
                    </div>
                ) : error ? (
                    <div className="p-12 text-center">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-red-300" />
                        <p className="text-red-600">{error}</p>
                    </div>
                ) : inventory.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p className="font-medium">{t('inventory.no_items')}</p>
                        <p className="text-sm mt-1">{t('inventory.no_items_hint')}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className={`w-full ${isRTL ? 'text-right' : 'text-left'}`}>
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-700">{t('inventory.product')}</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">{t('inventory.branch')}</th>
                                    <th className={`px-6 py-4 font-semibold text-slate-700 ${isRTL ? 'text-left' : 'text-right'}`}>{t('inventory.stock')}</th>
                                    <th className={`px-6 py-4 font-semibold text-slate-700 ${isRTL ? 'text-left' : 'text-right'}`}>{t('inventory.cost_price')}</th>
                                    <th className={`px-6 py-4 font-semibold text-slate-700 ${isRTL ? 'text-left' : 'text-right'}`}>{t('inventory.selling_price')}</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {inventory.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{item.product.name}</div>
                                            <div className="text-xs text-slate-500">{item.product.sku}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{item.branch.name}</td>
                                        <td className={`px-6 py-4 font-medium ${isRTL ? 'text-left' : 'text-right'}`}>
                                            <span className={`px-2 py-0.5 rounded-full text-sm font-semibold ${
                                                item.quantity < 5
                                                    ? 'bg-red-100 text-red-700'
                                                    : item.quantity < 10
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-green-100 text-green-700'
                                            }`}>
                                                {item.quantity}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'} text-slate-600`}>
                                            {Number(item.costPrice).toFixed(2)}
                                        </td>
                                        <td className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'} font-medium text-slate-900`}>
                                            {Number(item.sellingPrice).toFixed(2)}
                                        </td>
                                        <td className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}>
                                            <button
                                                onClick={() => handleAdjustClick(item)}
                                                className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1 ml-auto"
                                            >
                                                <Edit className="h-3 w-3" />
                                                {t('inventory.adjust')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && totalPages > 1 && (
                    <div className={`px-6 py-4 border-t border-slate-200 flex items-center justify-between`}>
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                            {t('common.previous')}
                        </button>
                        <span className="text-sm text-slate-500">
                            {t('inventory.page_of').replace('{{page}}', String(page)).replace('{{total}}', String(totalPages))}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {t('common.next')}
                            {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                    </div>
                )}
            </div>

            {/* Adjust Stock Modal */}
            {adjustingItem && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
                        {/* Modal Header */}
                        <div className="flex items-start justify-between mb-5">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    {modalStage === 'form' ? t('inventory.adjust_title') : t('inventory.confirm_adjust_title')}
                                </h2>
                                <p className="text-sm text-slate-500 mt-0.5">{t('inventory.adjust_subtitle')}</p>
                            </div>
                            <button onClick={closeModal} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
                                <X className="h-4 w-4 text-slate-500" />
                            </button>
                        </div>

                        {/* Item Info */}
                        <div className="bg-slate-50 rounded-xl p-4 mb-5">
                            <p className="font-semibold text-slate-900">{adjustingItem.product.name}</p>
                            <p className="text-sm text-slate-500 mt-0.5">
                                {adjustingItem.branch.name} • {t('inventory.stock')}: {adjustingItem.quantity}
                            </p>
                        </div>

                        {modalStage === 'form' ? (
                            /* Stage 1: Form */
                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        {t('inventory.quantity_change')}
                                    </label>
                                    <input
                                        type="number"
                                        value={adjustmentQty}
                                        onChange={(e) => setAdjustmentQty(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="-5 or 10"
                                        required
                                    />
                                    <p className="text-xs text-slate-500 mt-1">{t('inventory.quantity_change_hint')}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        {t('inventory.reason')}
                                    </label>
                                    <input
                                        type="text"
                                        value={adjustmentReason}
                                        onChange={(e) => setAdjustmentReason(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                        placeholder={t('inventory.reason_placeholder')}
                                        required
                                    />
                                </div>
                                {errorMsg && (
                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" /> {errorMsg}
                                    </p>
                                )}
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg font-medium"
                                    >
                                        {t('common.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!adjustmentQty || !adjustmentReason || Number(adjustmentQty) === 0}
                                        className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                                    >
                                        {t('inventory.confirm_adjust')} →
                                    </button>
                                </div>
                            </form>
                        ) : (
                            /* Stage 2: Confirmation */
                            <div>
                                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                                    <p className="text-sm text-amber-800">
                                        {t('inventory.confirm_adjust_msg')
                                            .replace('{{change}}', adjustmentQty)
                                            .replace('{{product}}', adjustingItem.product.name)}
                                    </p>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setModalStage('form')}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg font-medium"
                                    >
                                        {t('common.back')}
                                    </button>
                                    <button
                                        onClick={handleConfirmAdjust}
                                        disabled={submitting}
                                        className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {submitting ? (
                                            <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <CheckCircle className="h-4 w-4" />
                                        )}
                                        {submitting ? t('common.loading') : t('common.confirm')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

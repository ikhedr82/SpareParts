'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { useToast } from '@/components/toast';
import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { SkeletonTable, EmptyState, DataTable, StatusBadge } from '@/components/ui-harden';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { formatDate } from '@/lib/formatters';
import { Label } from '@/components/ui/label';
import {
    Globe, Plus, Loader2, MoreHorizontal, X, Edit, Trash2, AlertCircle, RefreshCw, ArrowRightLeft,
    TrendingUp, Coins, Search, ShieldCheck
} from 'lucide-react';

interface Currency {
    id: string;
    code: string;
    name: string;
    symbol: string;
    isActive: boolean;
}

interface ExchangeRate {
    id: string;
    fromCurrencyId: string;
    toCurrencyId: string;
    rate: number;
    source?: string;
    effectiveAt: string;
    fromCurrencyRef: Currency;
    toCurrencyRef: Currency;
}

export default function PlatformCurrenciesPage() {
    const { t, language } = useLanguage();
    const isRtl = language === 'ar';
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    // Currencies State
    const [currPage, setCurrPage] = useState(1);
    const [currLimit, setCurrLimit] = useState(25);
    const [currSearch, setCurrSearch] = useState('');

    // Rates State
    const [ratePage, setRatePage] = useState(1);
    const [rateLimit, setRateLimit] = useState(10);
    const [rateSearch, setRateSearch] = useState('');

    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'delete' | 'rate' | null>(null);
    const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const [form, setForm] = useState<Partial<Currency>>({
        code: '',
        name: '',
        symbol: '',
        isActive: true,
    });

    const { data: configData } = useQuery<any[]>({
        queryKey: ['platform-config'],
        queryFn: async () => {
            const { data } = await apiClient.get('/api/platform/config');
            return data;
        },
    });

    const baseCurrencyCode = configData?.find(c => c.key === 'PLATFORM_BASE_CURRENCY')?.value;

    const [rateForm, setRateForm] = useState({
        fromCurrencyId: '',
        toCurrencyId: '',
        rate: 1,
        source: 'Manual'
    });

    const { data: currencyData, isLoading: currenciesLoading } = useQuery<{ items: Currency[]; total: number }>({
        queryKey: ['platform-currencies', currPage, currLimit, currSearch],
        queryFn: async () => {
            const { data } = await apiClient.get('/api/platform/currencies', {
                params: { page: currPage, limit: currLimit, search: currSearch }
            });
            return data;
        },
    });

    const { data: rateData, isLoading: ratesLoading } = useQuery<{ items: ExchangeRate[]; total: number }>({
        queryKey: ['platform-exchange-rates', ratePage, rateLimit, rateSearch],
        queryFn: async () => {
            const { data } = await apiClient.get('/api/platform/currencies/rates', {
                params: { page: ratePage, limit: rateLimit, search: rateSearch }
            });
            return data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (dto: Partial<Currency>) => {
            await apiClient.post('/api/platform/currencies', dto);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-currencies'] });
            showToast('success', t('common.success') || 'Currency created');
            closeModal();
        },
        onError: (err: any) => {
            showToast('error', err.response?.data?.message || t('common.error'));
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, dto }: { id: string; dto: Partial<Currency> }) => {
            await apiClient.patch(`/api/platform/currencies/${selectedCurrency?.code}`, dto);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-currencies'] });
            showToast('success', t('common.success') || 'Currency updated');
            closeModal();
        },
        onError: (err: any) => {
            showToast('error', err.response?.data?.message || t('common.error'));
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            // We use id in backend for deletePlan but for currency we might use code.
            // Looking at controller: @Delete(':id') async remove(@Param('id') id: string... deletePlan(id))
            // Wait, CurrenciesController uses deletePlan? No, deletePlan(id) was in PlansController.
            // CurrenciesController doesn't have a DELETE method in the file I saw.
            // Let me check if I should add it.
            showToast('info', 'Delete operation not yet implemented for currencies');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-currencies'] });
            closeModal();
        },
    });

    const rateMutation = useMutation({
        mutationFn: async (dto: typeof rateForm) => {
            await apiClient.post('/api/platform/currencies/rates', dto);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-exchange-rates'] });
            showToast('success', t('common.success') || 'Rate updated');
            setModalMode(null);
        },
        onError: (err: any) => {
            showToast('error', err.response?.data?.message || t('common.error'));
        },
    });

    const setBaseCurrencyMutation = useMutation({
        mutationFn: async (code: string) => {
            await apiClient.post('/api/platform/config', {
                key: 'PLATFORM_BASE_CURRENCY',
                value: code,
                description: 'The standard currency for all platform-wide billing and aggregation',
                type: 'STRING'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-config'] });
            showToast('success', 'Platform Base Currency updated');
        },
        onError: (err: any) => {
            showToast('error', err.response?.data?.message || 'Failed to update base currency');
        }
    });

    const openCreateModal = () => {
        setForm({ code: '', name: '', symbol: '', isActive: true });
        setModalMode('create');
    };

    const openEditModal = (curr: Currency) => {
        setSelectedCurrency(curr);
        setForm({ ...curr });
        setModalMode('edit');
        setOpenMenuId(null);
    };

    const closeModal = () => {
        setModalMode(null);
        setSelectedCurrency(null);
        setOpenMenuId(null);
    };

    return (
        <div className="p-8 text-slate-900 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Globe className="h-10 w-10 text-indigo-600" />
                        {t('platform.currencies_manage.title') || 'Currencies & Rates'}
                    </h1>
                    <p className="text-slate-500 font-medium text-lg mt-1">{t('platform.currencies_manage.subtitle') || 'Global standard for multi-tenant financial operations'}</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        onClick={() => setModalMode('rate')}
                        className="h-12 px-6 rounded-2xl border-slate-200 font-bold shadow-sm"
                    >
                        <ArrowRightLeft className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'} text-indigo-500`} />
                        {t('platform.currencies_manage.update_rate')}
                    </Button>
                    <Button
                        onClick={openCreateModal}
                        className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold shadow-xl shadow-indigo-100"
                    >
                        <Plus className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                        {t('platform.currencies_manage.create')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                {/* Currencies Management */}
                <div className="xl:col-span-2 space-y-6">
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                                        <Coins className="h-5 w-5 text-indigo-600" />
                                        {t('platform.currencies_manage.supported_title') || 'Supported Currencies'}
                                    </CardTitle>
                                    <CardDescription>{t('platform.currencies_manage.supported_desc') || 'Define currencies available for platform-wide use'}</CardDescription>
                                </div>
                                <div className="relative max-w-xs w-full">
                                    <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400`} />
                                    <Input
                                        placeholder={t('common.search')}
                                        className={`${isRtl ? 'pr-10' : 'pl-10'} rounded-xl h-10`}
                                        value={currSearch}
                                        onChange={e => { setCurrSearch(e.target.value); setCurrPage(1); }}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <DataTable
                            data={currencyData?.items}
                            total={currencyData?.total}
                            page={currPage}
                            limit={currLimit}
                            onPageChange={setCurrPage}
                            onLimitChange={setCurrLimit}
                            isLoading={currenciesLoading}
                            emptyTitle={t('platform.currencies_manage.no_currencies') || 'No currencies found'}
                            columns={[
                                {
                                    header: t('platform.currencies_manage.code') || 'Code',
                                    render: (curr) => (
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="font-black text-indigo-600 border-indigo-100 bg-indigo-50/30 rounded-lg px-2.5 py-1">
                                                {curr.code}
                                            </Badge>
                                            {baseCurrencyCode === curr.code && (
                                                <Badge className="bg-emerald-500 text-white border-none rounded-lg text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 animate-pulse">
                                                    Base
                                                </Badge>
                                            )}
                                        </div>
                                    )
                                },
                                { header: t('platform.currencies_manage.name') || 'Name', accessor: 'name', className: 'font-bold text-slate-900' },
                                { header: t('platform.currencies_manage.symbol') || 'Symbol', accessor: 'symbol', className: 'font-mono font-bold text-slate-500' },
                                {
                                    header: t('platform.currencies_manage.active') || 'Status',
                                    render: (curr) => <StatusBadge status={curr.isActive ? 'ACTIVE' : 'INACTIVE'} />
                                },
                                {
                                    header: '',
                                    align: 'right',
                                    render: (curr) => (
                                        <div className="relative">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === curr.id ? null : curr.id); }}
                                                className="h-8 w-8 text-slate-400 hover:text-slate-600"
                                            >
                                                <MoreHorizontal className="h-5 w-5" />
                                            </Button>
                                            {openMenuId === curr.id && (
                                                <Card className={`absolute ${isRtl ? 'left-0' : 'right-0'} top-10 z-20 shadow-xl py-1 w-36 border border-slate-200 overflow-hidden ${isRtl ? 'text-right' : 'text-left'} bg-white`}>
                                                    <button
                                                        onClick={() => { setBaseCurrencyMutation.mutate(curr.code); setOpenMenuId(null); }}
                                                        className={`w-full ${isRtl ? 'text-right' : 'text-left'} px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 font-black uppercase tracking-tighter`}
                                                    >
                                                        <ShieldCheck className={`h-4 w-4 text-indigo-400 ${isRtl ? 'ml-2' : ''}`} /> Set Base
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(curr)}
                                                        className={`w-full ${isRtl ? 'text-right' : 'text-left'} px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium`}
                                                    >
                                                        <Edit className={`h-4 w-4 text-slate-400 ${isRtl ? 'ml-2' : ''}`} /> {t('common.edit')}
                                                    </button>
                                                    <button
                                                        onClick={() => { setSelectedCurrency(curr); setModalMode('delete'); setOpenMenuId(null); }}
                                                        className={`w-full ${isRtl ? 'text-right' : 'text-left'} px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium`}
                                                    >
                                                        <Trash2 className={`h-4 w-4 text-red-400 ${isRtl ? 'ml-2' : ''}`} /> {t('common.delete')}
                                                    </button>
                                                </Card>
                                            )}
                                        </div>
                                    )
                                }
                            ]}
                        />
                    </Card>
                </div>

                {/* Exchange Rates */}
                <Card className="border-slate-200 shadow-sm flex flex-col">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-indigo-600" />
                                {t('platform.currencies_manage.rates_title') || 'Exchange Rates'}
                            </CardTitle>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={() => queryClient.invalidateQueries({ queryKey: ['platform-exchange-rates'] })}>
                                <RefreshCw className={`h-4 w-4 ${ratesLoading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                        <CardDescription>{t('platform.currencies_manage.rates_desc') || 'System-wide conversion rules'}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                        {ratesLoading ? (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => <div key={i} className="h-16 animate-pulse bg-slate-50 rounded-xl" />)}
                            </div>
                        ) : rateData?.items.length === 0 ? (
                            <EmptyState title={t('platform.currencies_manage.no_rates') || 'No rates'} description={t('platform.currencies_manage.no_rates_desc') || 'Define conversion rules'} />
                        ) : (
                            rateData?.items.map(rate => (
                                <div key={rate.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group hover:border-indigo-100 transition-colors">
                                    <div className="space-y-1">
                                        <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                                            <span className="text-indigo-600">1 {rate.fromCurrencyId}</span>
                                            <ArrowRightLeft className="h-3 w-3 text-slate-300" />
                                            <span>{rate.rate} {rate.toCurrencyId}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                            <Badge variant="outline" className="text-[8px] px-1.5 py-0 border-slate-200 text-slate-400 font-bold">{rate.source || 'MANUAL'}</Badge>
                                            <span>·</span>
                                            <span>{formatDate(rate.effectiveAt)}</span>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-200 shadow-sm group-hover:scale-110 transition-transform">
                                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                    <CardFooter className="bg-slate-50/10 border-t border-slate-50 p-2">
                        <Button
                            variant="ghost"
                            className="w-full text-xs font-bold text-indigo-600 hover:text-indigo-700 h-9"
                            onClick={() => setModalMode('rate')}
                        >
                            {t('platform.currencies_manage.sync_now') || 'Configure Sync'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Modal Currency */}
            {(modalMode === 'create' || modalMode === 'edit') && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <Card className="max-w-md w-full p-0 shadow-2xl border-none overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 p-6">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-bold">{modalMode === 'create' ? t('platform.currencies_manage.create') || 'Add Currency' : t('common.edit') || 'Edit Currency'}</CardTitle>
                                <Button variant="ghost" size="icon" onClick={closeModal} className="rounded-full">
                                    <X className="h-5 w-5 text-slate-400" />
                                </Button>
                            </div>
                        </CardHeader>
                        <form onSubmit={e => {
                            e.preventDefault();
                            if (modalMode === 'create') createMutation.mutate(form);
                            else if (selectedCurrency) updateMutation.mutate({ id: selectedCurrency.id, dto: form });
                        }} className="p-6 space-y-5">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400" required>
                                    {t('platform.currencies_manage.iso_code') || 'Currency Code (ISO)'}
                                </Label>
                                <Input required maxLength={3} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. USD" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-semibold uppercase" />
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400" required>
                                    {t('platform.currencies_manage.name_label') || 'Currency Name'}
                                </Label>
                                <Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. US Dollar" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-semibold" />
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400" required>
                                    {t('platform.currencies_manage.symbol_label') || 'Symbol'}
                                </Label>
                                <Input required value={form.symbol} onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))} placeholder="e.g. $" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-semibold" />
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <input type="checkbox" className="h-5 w-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} id="isActive" />
                                <Label htmlFor="isActive" className="text-sm font-bold text-slate-700 cursor-pointer">{t('platform.currencies_manage.active_label') || 'Active and available'}</Label>
                            </div>
                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <Button type="button" variant="outline" onClick={closeModal} className="rounded-xl h-11 px-6">{t('common.cancel') || 'Cancel'}</Button>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-xl h-11 px-8 bg-indigo-600 font-bold min-w-[120px]">
                                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    {t('common.save') || 'Save'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Rate Modal */}
            {modalMode === 'rate' && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <Card className="max-w-md w-full p-0 shadow-2xl border-none overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 p-6">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-bold">{t('platform.currencies_manage.update_rate') || 'Update Rate'}</CardTitle>
                                <Button variant="ghost" size="icon" onClick={closeModal} className="rounded-full">
                                    <X className="h-5 w-5 text-slate-400" />
                                </Button>
                            </div>
                        </CardHeader>
                        <form onSubmit={e => { e.preventDefault(); rateMutation.mutate(rateForm); }} className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400" required>
                                        {t('common.from') || 'From'}
                                    </Label>
                                    <select required value={rateForm.fromCurrencyId} onChange={e => setRateForm(f => ({ ...f, fromCurrencyId: e.target.value }))} className="w-full h-14 px-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-semibold text-sm outline-none">
                                        <option value="">{t('common.select') || 'Select...'}</option>
                                        {currencyData?.items.map(c => <option key={c.id} value={c.code}>{c.code}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400" required>
                                        {t('common.to') || 'To'}
                                    </Label>
                                    <select required value={rateForm.toCurrencyId} onChange={e => setRateForm(f => ({ ...f, toCurrencyId: e.target.value }))} className="w-full h-14 px-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-semibold text-sm outline-none">
                                        <option value="">{t('common.select') || 'Select...'}</option>
                                        {currencyData?.items.map(c => <option key={c.id} value={c.code}>{c.code}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400" required>
                                    {t('platform.currencies_manage.rate_label') || 'Rate'}
                                </Label>
                                <Input type="number" step="0.0000000001" required value={rateForm.rate} onChange={e => setRateForm(f => ({ ...f, rate: parseFloat(e.target.value) }))} className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-semibold" />
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {t('platform.currencies_manage.source_label') || 'Source'}
                                </Label>
                                <Input type="text" value={rateForm.source} onChange={e => setRateForm(f => ({ ...f, source: e.target.value }))} className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-semibold" placeholder="Manual" />
                            </div>
                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <Button type="button" variant="outline" onClick={closeModal} className="rounded-xl h-11 px-6">{t('common.cancel') || 'Cancel'}</Button>
                                <Button type="submit" disabled={rateMutation.isPending} className="rounded-xl h-11 px-8 bg-indigo-600 font-bold min-w-[120px]">
                                    {rateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    {t('common.save') || 'Update'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}


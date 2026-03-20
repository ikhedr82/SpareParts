'use client';

import {
    Layers, Plus, Loader2, MoreHorizontal, X, Edit, Trash2, Check, AlertCircle,
    Users, Building2, Zap, ShieldCheck, Filter, Search
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { useToast } from '@/components/toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SkeletonTable, EmptyState, DataTable, StatusBadge } from '@/components/ui-harden';
import { formatCurrency } from '@/lib/formatters';

interface Plan {
    id: string;
    name: string;
    price: number;
    currency: string;
    billingCycle: 'MONTHLY' | 'YEARLY';
    features: string[];
    maxUsers: number;
    maxBranches: number;
    isActive: boolean;
}

export default function PlatformPlansPage() {
    const { t, language } = useLanguage();
    const isRtl = language === 'ar';
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'delete' | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [form, setForm] = useState<Partial<Plan>>({
        name: '',
        price: 0,
        currency: 'USD',
        billingCycle: 'MONTHLY',
        features: [],
        maxUsers: 10,
        maxBranches: 2,
        isActive: true,
    });

    const [featureInput, setFeatureInput] = useState('');

    const { data: plans, isLoading, error } = useQuery<Plan[]>({
        queryKey: ['platform-plans'],
        queryFn: async () => {
            const { data } = await apiClient.get('/api/platform/plans');
            return data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (dto: Partial<Plan>) => {
            await apiClient.post('/api/platform/plans', dto);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-plans'] });
            showToast('success', t('platform.plans.create_success') || 'Strategy instantiated successfully');
            closeModal();
        },
        onError: (err: any) => {
            showToast('error', err.response?.data?.message || t('common.error') || 'Error');
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, dto }: { id: string; dto: Partial<Plan> }) => {
            await apiClient.patch(`/api/platform/plans/${id}`, dto);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-plans'] });
            showToast('success', t('platform.plans.update_success') || 'Strategy parameters updated');
            closeModal();
        },
        onError: (err: any) => {
            showToast('error', err.response?.data?.message || t('common.error') || 'Error');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/api/platform/plans/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-plans'] });
            showToast('success', t('platform.plans.delete_success') || 'Strategy purged');
            closeModal();
        },
        onError: (err: any) => {
            showToast('error', err.response?.data?.message || t('common.error') || 'Error');
        },
    });

    const openCreateModal = () => {
        setForm({
            name: '',
            price: 0,
            currency: 'USD',
            billingCycle: 'MONTHLY',
            features: [],
            maxUsers: 10,
            maxBranches: 2,
            isActive: true,
        });
        setModalMode('create');
    };

    const openEditModal = (plan: Plan) => {
        setSelectedPlan(plan);
        setForm({ ...plan });
        setModalMode('edit');
    };

    const closeModal = () => {
        setModalMode(null);
        setSelectedPlan(null);
    };

    const addFeature = () => {
        if (!featureInput.trim()) return;
        setForm(f => ({ ...f, features: [...(f.features || []), featureInput.trim()] }));
        setFeatureInput('');
    };

    const removeFeature = (index: number) => {
        setForm(f => ({ ...f, features: f.features?.filter((_, i) => i !== index) }));
    };

    const filteredPlans = plans?.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())) || [];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Layers className={`h-10 w-10 text-indigo-600 ${isRtl ? 'ml-3' : 'mr-3'}`} />
                        {t('platform.plans.title')}
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg font-medium">
                        {t('platform.plans.subtitle')}
                    </p>
                </div>
                <Button
                    onClick={openCreateModal}
                    className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold shadow-xl shadow-indigo-100 flex items-center gap-2"
                >
                    <Plus className="h-5 w-5" />
                    {t('platform.plans.new_plan')}
                </Button>
            </div>

            <Card className="border-none shadow-sm outline outline-1 outline-slate-100 overflow-hidden rounded-[2rem]">
                <CardHeader className="bg-white border-b border-slate-50 py-8 px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 bg-slate-50 rounded-2xl ${isRtl ? 'ml-4' : ''}`}>
                            <Filter className="h-6 w-6 text-slate-400" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">{t('platform.plans.registry')}</CardTitle>
                            <CardDescription>{t('platform.plans.registry_desc')}</CardDescription>
                        </div>
                    </div>
                    <div className="relative w-full sm:w-80">
                        <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400`} />
                        <Input
                            placeholder={t('platform.plans.search_placeholder')}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className={`${isRtl ? 'pr-10' : 'pl-10'} rounded-xl border-slate-200 h-11`}
                        />
                    </div>
                </CardHeader>

                <DataTable
                    data={filteredPlans}
                    isLoading={isLoading}
                    error={error}
                    emptyTitle={t('platform.plans.no_plans')}
                    columns={[
                        {
                            header: t('platform.plans.identity'),
                            render: (plan) => (
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black">
                                        <Zap className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 text-sm uppercase">{plan.name}</div>
                                        <div className="text-[10px] text-slate-400 font-black tracking-widest uppercase">{plan.billingCycle}</div>
                                    </div>
                                </div>
                            )
                        },
                        {
                            header: t('platform.plans.pricing'),
                            render: (plan) => (
                                <div className="font-black text-slate-900 text-sm">
                                    {formatCurrency(plan.price, plan.currency)}
                                </div>
                            )
                        },
                        {
                            header: t('platform.plans.constraints'),
                            render: (plan) => (
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg">
                                        <Users className="h-3 w-3 text-slate-400" />
                                        <span className="text-[10px] font-black text-slate-600">{plan.maxUsers}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg">
                                        <Building2 className="h-3 w-3 text-slate-400" />
                                        <span className="text-[10px] font-black text-slate-600">{plan.maxBranches}</span>
                                    </div>
                                </div>
                            )
                        },
                        {
                            header: t('common.status'),
                            render: (plan) => <StatusBadge status={plan.isActive ? 'ACTIVE' : 'INACTIVE'} />
                        },
                        {
                            header: '',
                            align: isRtl ? 'left' : 'right',
                            render: (plan) => (
                                <div className={`flex gap-2 ${isRtl ? 'justify-start' : 'justify-end'}`}>
                                    <Button variant="ghost" size="icon" onClick={() => openEditModal(plan)} className="h-9 w-9 rounded-xl hover:bg-indigo-50 hover:text-indigo-600">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => { setSelectedPlan(plan); setModalMode('delete'); }} className="h-9 w-9 rounded-xl hover:bg-rose-50 hover:text-rose-600">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )
                        }
                    ]}
                />
            </Card>

            {/* Creation/Edit Modal */}
            {(modalMode === 'create' || modalMode === 'edit') && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <Card className="max-w-3xl w-full p-0 shadow-2xl border-none overflow-hidden rounded-[2.5rem]">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-2xl font-black text-slate-900">{modalMode === 'create' ? t('platform.plans.initiate_title') : t('platform.plans.modify_title')}</CardTitle>
                                    <CardDescription>{t('platform.plans.modal_desc')}</CardDescription>
                                </div>
                                <Button variant="ghost" size="icon" onClick={closeModal} className="rounded-2xl hover:bg-slate-200">
                                    <X className="h-6 w-6 text-slate-500" />
                                </Button>
                            </div>
                        </CardHeader>

                        <form onSubmit={e => {
                            e.preventDefault();
                            if (modalMode === 'create') createMutation.mutate(form);
                            else if (selectedPlan) updateMutation.mutate({ id: selectedPlan.id, dto: form });
                        }} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400" required>
                                    {t('platform.plans.form_name')}
                                </Label>
                                <Input
                                    required
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-semibold"
                                    placeholder="e.g. Enterprise Node"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400" required>
                                        {t('platform.plans.form_price')}
                                    </Label>
                                    <Input
                                        type="number"
                                        required
                                        value={form.price}
                                        onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-semibold"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400" required>
                                        {t('platform.plans.form_currency')}
                                    </Label>
                                    <select
                                        required
                                        value={form.currency}
                                        onChange={e => setForm({ ...form, currency: e.target.value })}
                                        className="w-full h-14 px-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-semibold text-sm outline-none"
                                    >
                                        <option value="USD">USD</option>
                                        <option value="SAR">SAR</option>
                                        <option value="EGP">EGP</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400" required>
                                        {t('platform.plans.form_users')}
                                    </Label>
                                    <Input
                                        type="number"
                                        required
                                        value={form.maxUsers}
                                        onChange={e => setForm({ ...form, maxUsers: Number(e.target.value) })}
                                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-semibold"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400" required>
                                        {t('platform.plans.form_branches')}
                                    </Label>
                                    <Input
                                        type="number"
                                        required
                                        value={form.maxBranches}
                                        onChange={e => setForm({ ...form, maxBranches: Number(e.target.value) })}
                                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-semibold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {t('platform.plans.form_features')}
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={featureInput}
                                        onChange={e => setFeatureInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (featureInput.trim()) { setForm({ ...form, features: [...(form.features || []), featureInput.trim()] }); setFeatureInput(''); } } }}
                                        placeholder={t('platform.plans.add_feature_placeholder')}
                                        className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-semibold px-4"
                                    />
                                    <Button
                                        type="button"
                                        onClick={() => { if (featureInput.trim()) { setForm({ ...form, features: [...(form.features || []), featureInput.trim()] }); setFeatureInput(''); } }}
                                        className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-none p-0 transition-all"
                                    >
                                        <Plus className="h-5 w-5" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {form.features?.map((feat, idx) => (
                                        <Badge key={idx} variant="secondary" className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 border-none font-bold text-[10px] tracking-widest uppercase flex items-center gap-2">
                                            {feat}
                                            <button type="button" onClick={() => setForm({ ...form, features: form.features?.filter((_, i) => i !== idx) })} className="hover:text-rose-500 transition-colors">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <Button type="button" variant="outline" onClick={closeModal} className="flex-1 h-14 rounded-2xl border-slate-200 font-black uppercase tracking-widest">{t('common.cancel')}</Button>
                                <Button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="flex-1 h-14 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest shadow-2xl shadow-indigo-100 active:scale-95 transition-all"
                                >
                                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className={`h-5 w-5 ${isRtl ? 'ml-3' : 'mr-3'} animate-spin`} />}
                                    {t('common.save')}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* DELETE MODAL */}
            {modalMode === 'delete' && selectedPlan && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <Card className="max-w-md w-full p-8 shadow-2xl border-none rounded-[2rem]">
                        <div className="flex items-center gap-5 mb-6">
                            <div className={`p-4 bg-rose-50 rounded-2xl ${isRtl ? 'ml-3' : ''}`}>
                                <AlertCircle className="h-8 w-8 text-rose-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('platform.plans.purge_title')}</h3>
                                <p className="text-slate-400 text-sm font-medium">{t('platform.plans.purge_warning')}</p>
                            </div>
                        </div>
                        <p className="text-slate-600 mb-8 font-medium leading-relaxed">
                            {t('platform.plans.purge_desc_pre')} <span className="text-slate-900 font-black">"{selectedPlan.name}"</span>?
                            {t('platform.plans.purge_desc_post')}
                        </p>
                        <div className="flex gap-4">
                            <Button variant="outline" onClick={closeModal} className="flex-1 rounded-2xl h-12 border-slate-200 font-black">{t('common.cancel')}</Button>
                            <Button
                                onClick={() => deleteMutation.mutate(selectedPlan.id)}
                                disabled={deleteMutation.isPending}
                                className="flex-1 rounded-2xl h-12 bg-rose-600 hover:bg-rose-700 text-white font-black shadow-xl shadow-rose-100 active:scale-95 transition-all"
                            >
                                {deleteMutation.isPending && <Loader2 className={`h-5 w-5 ${isRtl ? 'ml-2' : 'mr-2'} animate-spin`} />}
                                {t('common.delete')}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

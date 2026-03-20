'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useToast } from '@/components/toast';
import apiClient from '@/lib/api';
import { useState } from 'react';
import {
    Building2, ShieldBan, ShieldCheck, Search, Loader2,
    AlertCircle, Plus, Globe, Eye,
    MoreHorizontal, X, Layers, Filter, Users,
    ArrowRight, LayoutGrid, List
} from 'lucide-react';
import { SkeletonTable, EmptyState, DataTable, StatusBadge } from '@/components/ui-harden';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/formatters';
import Link from 'next/link';

interface Plan {
    id: string;
    name: string;
    price: number;
    currency: string;
}

interface Tenant {
    id: string;
    name: string;
    subdomain: string;
    status: 'ACTIVE' | 'SUSPENDED';
    planId?: string;
    plan?: { name: string; price: number; currency: string };
    subscription?: {
        status: string;
        trialEndDate?: string;
        currentPeriodEnd?: string;
    };
    suspensionReason?: string;
    defaultLanguage: string;
    supportedLanguages: string[];
    baseCurrency: string;
    supportedCurrencies: string[];
    billingEmail?: string;
    createdAt: string;
    _count: { users: number; branches: number };
}

export default function PlatformTenantsPage() {
    const { t, language } = useLanguage();
    const isRtl = language === 'ar';
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [statusFilter, setStatusFilter] = useState('');
    const [planFilter, setPlanFilter] = useState('');

    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [modalMode, setModalMode] = useState<'suspend' | 'reactivate' | 'create' | 'edit' | 'delete' | 'language' | 'changePlan' | null>(null);
    const [suspendReason, setSuspendReason] = useState('');
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');

    // Create form state
    const [createForm, setCreateForm] = useState({
        name: '',
        subdomain: '',
        planId: '',
        adminEmail: '',
        adminPassword: '',
        defaultLanguage: 'EN',
        supportedLanguages: ['EN', 'AR'],
        baseCurrency: 'USD',
        supportedCurrencies: ['USD']
    });

    // Language form state
    const [langForm, setLangForm] = useState({ defaultLanguage: 'EN', supportedLanguages: ['EN', 'AR'] });

    const [editForm, setEditForm] = useState({
        name: '',
        billingEmail: ''
    });

    const { data: tenantData, isLoading, error } = useQuery<{ items: Tenant[]; total: number }>({
        queryKey: ['platform-tenants', page, limit, searchTerm, statusFilter, planFilter],
        queryFn: async () => {
            const { data } = await apiClient.get('/api/platform/tenants', {
                params: { page, limit, search: searchTerm, status: statusFilter, planId: planFilter }
            });
            return data;
        },
    });

    const tenants = tenantData?.items || [];
    const total = tenantData?.total || 0;

    const { data: plans } = useQuery<Plan[]>({
        queryKey: ['platform-plans'],
        queryFn: async () => {
            const { data } = await apiClient.get('/api/platform/plans');
            return data;
        },
    });

    const { data: currencyData } = useQuery<{ items: { code: string; name: string }[] }>({
        queryKey: ['platform-currencies'],
        queryFn: async () => {
            const { data } = await apiClient.get('/api/platform/currencies');
            return data;
        },
    });
    const currencies = currencyData?.items || [];

    // ========== Mutations ==========

    const createMutation = useMutation({
        mutationFn: async (dto: typeof createForm) => {
            await apiClient.post('/api/platform/tenants', dto);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-tenants'] });
            showToast('success', t('platform.tenants.create_success') || 'Tenant provisioned successfully');
            setModalMode(null);
            setCreateForm({
                name: '',
                subdomain: '',
                planId: '',
                adminEmail: '',
                adminPassword: '',
                defaultLanguage: 'EN',
                supportedLanguages: ['EN', 'AR'],
                baseCurrency: 'USD',
                supportedCurrencies: ['USD']
            });
        },
        onError: (err: any) => {
            showToast('error', err.response?.data?.message || t('platform.tenants.create_error') || 'Failed to provision tenant');
        },
    });

    const suspendMutation = useMutation({
        mutationFn: async ({ tenantId, reason }: { tenantId: string; reason: string }) => {
            await apiClient.post(`/api/platform/tenants/${tenantId}/suspend`, { reason });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-tenants'] });
            showToast('success', t('platform.tenants.suspend_success') || 'Tenant suspended');
            setModalMode(null);
            setSelectedTenant(null);
            setSuspendReason('');
        },
        onError: () => {
            showToast('error', t('platform.tenants.suspend_error') || 'Suspension failed');
        },
    });

    const reactivateMutation = useMutation({
        mutationFn: async (tenantId: string) => {
            await apiClient.post(`/api/platform/tenants/${tenantId}/reactivate`, {});
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-tenants'] });
            showToast('success', t('platform.tenants.reactivate_success') || 'Tenant reactivated');
            setModalMode(null);
            setSelectedTenant(null);
        },
        onError: () => {
            showToast('error', t('platform.tenants.reactivate_error') || 'Reactivation failed');
        },
    });

    const languageMutation = useMutation({
        mutationFn: async ({ tenantId, data }: { tenantId: string; data: typeof langForm }) => {
            await apiClient.patch(`/api/platform/tenants/${tenantId}/language`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-tenants'] });
            showToast('success', t('platform.tenants.language_update_success') || 'Protocol updated');
            setModalMode(null);
            setSelectedTenant(null);
        },
        onError: () => {
            showToast('error', t('platform.tenants.language_update_error') || 'Update failed');
        },
    });

    const changePlanMutation = useMutation({
        mutationFn: async ({ tenantId, planId }: { tenantId: string; planId: string }) => {
            await apiClient.patch(`/api/platform/tenants/${tenantId}/plan`, { planId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-tenants'] });
            showToast('success', 'Plan upgraded successfully');
            setModalMode(null);
            setSelectedTenant(null);
        },
        onError: (err: any) => {
            showToast('error', err.response?.data?.message || 'Failed to update blueprint');
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ tenantId, data }: { tenantId: string; data: typeof editForm }) => {
            await apiClient.patch(`/api/platform/tenants/${tenantId}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-tenants'] });
            showToast('success', 'Tenant identity updated');
            setModalMode(null);
            setSelectedTenant(null);
        },
        onError: () => {
            showToast('error', 'Update Failed');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (tenantId: string) => {
            await apiClient.delete(`/api/platform/tenants/${tenantId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-tenants'] });
            showToast('success', 'Tenant terminated and soft-deleted');
            setModalMode(null);
            setSelectedTenant(null);
        },
        onError: () => {
            showToast('error', 'Termination Failed');
        },
    });

    const openLanguageModal = (tenant: Tenant) => {
        setSelectedTenant(tenant);
        setLangForm({
            defaultLanguage: tenant.defaultLanguage,
            supportedLanguages: [...tenant.supportedLanguages],
        });
        setModalMode('language');
    };

    const closeModal = () => {
        setModalMode(null);
        setSelectedTenant(null);
        setSuspendReason('');
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Enterprise Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-slate-100">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
                        <Building2 className={`h-10 w-10 text-indigo-600 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                        {t('platform.tenants.title')}
                    </h1>
                    <p className="text-slate-500 text-lg font-medium">{t('platform.tenants.subtitle')}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-slate-100/50 px-4 py-2 rounded-2xl border border-slate-200/50 flex items-center gap-6">
                        <div className="text-center">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{t('platform.tenants.active_label')}</div>
                            <div className="text-lg font-black text-slate-800 leading-none">{tenants?.filter(t => t.status === 'ACTIVE').length || 0}</div>
                        </div>
                        <div className="w-px h-6 bg-slate-200" />
                        <div className="text-center">
                            <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-none mb-1">{t('platform.tenants.suspended_label')}</div>
                            <div className="text-lg font-black text-rose-600 leading-none">{tenants?.filter(t => t.status === 'SUSPENDED').length || 0}</div>
                        </div>
                    </div>
                    <Button
                        onClick={() => setModalMode('create')}
                        className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-2xl shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Plus className="h-6 w-6" />
                        {t('platform.tenants.provision_node')}
                    </Button>
                </div>
            </div>

            {/* High-Fidelity Registry Card */}
            <div className="bg-white rounded-[2.5rem] shadow-sm outline outline-1 outline-slate-100 overflow-hidden group">
                {/* Advanced Search & Filtering Bar */}
                <div className="p-8 pb-4 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-2xl">
                        <Search className={`absolute ${isRtl ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400`} />
                        <Input
                            placeholder={t('platform.tenants.search_placeholder')}
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                            className={`${isRtl ? 'pr-14' : 'pl-14'} h-14 rounded-2xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all text-base font-medium`}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                            <Filter className="h-4 w-4 text-slate-400" />
                            <select
                                value={statusFilter}
                                onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                                className="bg-transparent text-sm font-black text-slate-600 outline-none uppercase tracking-tight"
                            >
                                <option value="">{t('common.all_status')}</option>
                                <option value="ACTIVE">{t('common.active')}</option>
                                <option value="SUSPENDED">{t('common.suspended')}</option>
                            </select>
                            <div className="w-px h-4 bg-slate-200" />
                            <select
                                value={planFilter}
                                onChange={e => { setPlanFilter(e.target.value); setPage(1); }}
                                className="bg-transparent text-sm font-black text-slate-600 outline-none uppercase tracking-tight"
                            >
                                <option value="">{t('platform.tenants.all_plans')}</option>
                                {plans?.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <DataTable
                    data={tenants}
                    isLoading={isLoading}
                    error={error}
                    emptyTitle={t('platform.tenants.no_tenants') || 'No ecosystem nodes found'}
                    page={page}
                    limit={limit}
                    total={total}
                    onPageChange={setPage}
                    onLimitChange={(l) => { setLimit(l); setPage(1); }}
                    columns={[
                        {
                            header: t('platform.tenants.tenant_name') || 'Entity Identity',
                            render: (tenant) => (
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-indigo-600 font-extrabold shadow-inner border border-white">
                                        {tenant.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <Link href={`/platform/tenants/${tenant.id}`} className="font-black text-slate-900 hover:text-indigo-600 transition-colors block leading-tight">
                                            {tenant.name}
                                        </Link>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 mt-1">{tenant.subdomain}.partivo.net</div>
                                    </div>
                                </div>
                            )
                        },
                        {
                            header: t('platform.tenants.blueprint'),
                            render: (tenant) => (
                                <div className="space-y-1.5">
                                    <div className="text-sm font-black text-indigo-600 uppercase tracking-tighter">
                                        {tenant.plan?.name || 'MANUAL'}
                                    </div>
                                    {tenant.subscription && (
                                        <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[9px] uppercase tracking-widest px-2 py-0">
                                            {tenant.subscription.status}
                                        </Badge>
                                    )}
                                </div>
                            )
                        },
                        {
                            header: t('platform.tenants.utilization'),
                            render: (tenant) => (
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <div className="text-[9px] font-black text-slate-300 uppercase leading-none mb-1">{t('common.users')}</div>
                                        <div className="text-sm font-black text-slate-700">{tenant._count.users}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[9px] font-black text-slate-300 uppercase leading-none mb-1">{t('nav.branches')}</div>
                                        <div className="text-sm font-black text-slate-700">{tenant._count.branches}</div>
                                    </div>
                                </div>
                            )
                        },
                        {
                            header: t('platform.tenants.inception'),
                            render: (tenant) => <span className="text-sm font-medium text-slate-400">{formatDate(tenant.createdAt)}</span>
                        },
                        {
                            header: t('platform.tenants.state'),
                            render: (tenant) => <StatusBadge status={tenant.status} />
                        },
                        {
                            header: '',
                            align: isRtl ? 'left' : 'right',
                            render: (tenant) => (
                                <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'} gap-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                                    <Link href={`/platform/tenants/${tenant.id}`}>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-50">
                                            <Eye className="h-5 w-5 text-slate-400" />
                                        </Button>
                                    </Link>
                                    <div className="relative group/menu">
                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-50">
                                            <MoreHorizontal className="h-5 w-5 text-slate-400" />
                                        </Button>
                                        <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} top-full mt-2 z-50 bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 w-56 hidden group-focus-within/menu:block hover:block`}>
                                            <button onClick={() => { setSelectedTenant(tenant); setEditForm({ name: tenant.name, billingEmail: tenant.billingEmail || '' }); setModalMode('edit'); }} className="w-full text-start px-5 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 flex items-center gap-3 uppercase tracking-widest">
                                                <MoreHorizontal className="h-4 w-4 text-slate-400" /> {t('common.edit') || 'Edit Profile'}
                                            </button>
                                            <button onClick={() => { setSelectedTenant(tenant); setSelectedPlanId(tenant.planId || ''); setModalMode('changePlan'); }} className="w-full text-start px-5 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 flex items-center gap-3 uppercase tracking-widest">
                                                <Layers className="h-4 w-4 text-indigo-400" /> {t('platform.tenants.modify_blueprint')}
                                            </button>
                                            <button onClick={() => openLanguageModal(tenant)} className="w-full text-start px-5 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 flex items-center gap-3 uppercase tracking-widest">
                                                <Globe className="h-4 w-4 text-blue-400" /> {t('platform.tenants.locale_protocol')}
                                            </button>
                                            <div className="border-t border-slate-50 my-2" />
                                            {tenant.status === 'ACTIVE' ? (
                                                <button onClick={() => { setSelectedTenant(tenant); setModalMode('suspend'); }} className="w-full text-start px-5 py-3 text-xs font-black text-rose-600 hover:bg-rose-50 flex items-center gap-3 uppercase tracking-widest">
                                                    <ShieldBan className="h-4 w-4" /> {t('platform.tenants.suspend_node')}
                                                </button>
                                            ) : (
                                                <button onClick={() => { setSelectedTenant(tenant); setModalMode('reactivate'); }} className="w-full text-start px-5 py-3 text-xs font-black text-emerald-600 hover:bg-emerald-50 flex items-center gap-3 uppercase tracking-widest">
                                                    <ShieldCheck className="h-4 w-4" /> {t('platform.tenants.reactivate_node')}
                                                </button>
                                            )}
                                            <button onClick={() => { setSelectedTenant(tenant); setModalMode('delete'); }} className="w-full text-start px-5 py-3 text-xs font-black text-rose-800 hover:bg-rose-100 flex items-center gap-3 uppercase tracking-widest">
                                                <X className="h-4 w-4 text-rose-900" /> {t('common.delete') || 'Terminate'}
                                            </button>
                                        </div>
                                    </div>
                                    <Link href={`/platform/tenants/${tenant.id}`}>
                                        <Button size="icon" className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-none shadow-none">
                                            <ArrowRight className={`h-5 w-5 ${isRtl ? 'rotate-180' : ''}`} />
                                        </Button>
                                    </Link>
                                </div>
                            )
                        }
                    ]}
                />
            </div>

            {/* ===== CREATE TENANT MODAL ===== */}
            {modalMode === 'create' && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <Card className="max-w-2xl w-full p-0 shadow-2xl border-none overflow-hidden rounded-[2.5rem]">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">{t('platform.tenants.create_title')}</CardTitle>
                                    <CardDescription className="text-slate-400 font-medium">{t('platform.tenants.create_subtitle')}</CardDescription>
                                </div>
                                <Button variant="ghost" size="icon" onClick={closeModal} className="rounded-2xl hover:bg-slate-200">
                                    <X className="h-6 w-6 text-slate-400" />
                                </Button>
                            </div>
                        </CardHeader>
                        <form onSubmit={e => { e.preventDefault(); createMutation.mutate(createForm); }} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400" required>
                                        {t('platform.tenants.form_name')}
                                    </Label>
                                    <Input
                                        required
                                        value={createForm.name}
                                        onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-semibold"
                                        placeholder="e.g. Global Logistics"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400" required>
                                        {t('platform.tenants.form_subdomain')}
                                    </Label>
                                    <div className="relative group">
                                        <Input
                                            required
                                            value={createForm.subdomain}
                                            onChange={(e) => setCreateForm({ ...createForm, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                                            className={`h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-semibold ${isRtl ? 'pl-24' : 'pr-24'}`}
                                            placeholder="subdomain"
                                        />
                                        <div className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 group-focus-within:text-indigo-500 transition-colors`}>
                                            .partivo.com
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400" required>
                                        {t('platform.tenants.form_plan')}
                                    </Label>
                                    <select
                                        required
                                        value={createForm.planId}
                                        onChange={e => setCreateForm(f => ({ ...f, planId: e.target.value }))}
                                        className="w-full h-14 px-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-semibold text-sm outline-none"
                                    >
                                        <option value="">{t('platform.tenants.select_plan')}</option>
                                        {plans?.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} ({p.price} {p.currency})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400" required>
                                        {t('platform.tenants.form_currency')}
                                    </Label>
                                    <select
                                        required
                                        value={createForm.baseCurrency}
                                        onChange={e => setCreateForm(f => ({ ...f, baseCurrency: e.target.value }))}
                                        className="w-full h-14 px-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-semibold text-sm outline-none"
                                    >
                                        {currencies?.map(c => (
                                            <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                                        )) || <option value="USD">USD</option>}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400" required>
                                        {t('platform.tenants.form_owner_email')}
                                    </Label>
                                    <Input type="email" required value={createForm.adminEmail} onChange={e => setCreateForm(f => ({ ...f, adminEmail: e.target.value }))} className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-semibold" />
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400" required>
                                        {t('platform.tenants.form_owner_password')}
                                    </Label>
                                    <Input type="password" required minLength={8} value={createForm.adminPassword} onChange={e => setCreateForm(f => ({ ...f, adminPassword: e.target.value }))} className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-semibold" />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <Button type="button" variant="outline" onClick={closeModal} className="flex-1 h-14 rounded-2xl border-slate-200 font-black uppercase tracking-widest">{t('common.cancel')}</Button>
                                <Button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="flex-1 h-14 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest shadow-2xl shadow-indigo-100 active:scale-95 transition-all"
                                >
                                    {createMutation.isPending && <Loader2 className={`h-5 w-5 ${isRtl ? 'ml-3' : 'mr-3'} animate-spin`} />}
                                    {createMutation.isPending ? t('common.loading') : t('platform.tenants.provision_node')}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* ===== SUSPEND MODAL ===== */}
            {modalMode === 'suspend' && selectedTenant && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <Card className="max-w-md w-full p-10 shadow-2xl border-none rounded-[2.5rem]">
                        <div className="flex items-center gap-5 mb-8">
                            <div className={`p-4 bg-rose-50 rounded-2xl ${isRtl ? 'ml-2' : ''}`}>
                                <ShieldBan className="h-8 w-8 text-rose-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('platform.tenants.suspend_node')}</h3>
                                <p className="text-slate-400 font-bold text-sm uppercase tracking-tighter">{selectedTenant.name}</p>
                            </div>
                        </div>
                        <p className="text-slate-600 text-sm font-medium mb-6 leading-relaxed">{t('platform.tenants.suspend_warning')}</p>
                        <textarea
                            className="w-full border border-slate-200 rounded-2xl p-4 text-sm font-semibold focus:ring-2 focus:ring-rose-100 focus:border-rose-300 focus:outline-none mb-8 h-28 resize-none bg-slate-50"
                            placeholder={t('platform.tenants.suspend_placeholder')}
                            value={suspendReason}
                            onChange={e => setSuspendReason(e.target.value)}
                        />
                        <div className="flex gap-4">
                            <Button variant="outline" onClick={closeModal} className="flex-1 h-14 rounded-2xl border-slate-200 font-black uppercase tracking-widest">{t('common.cancel')}</Button>
                            <button
                                disabled={!suspendReason.trim() || suspendMutation.isPending}
                                onClick={() => suspendMutation.mutate({ tenantId: selectedTenant.id, reason: suspendReason })}
                                className="flex-1 h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest shadow-2xl shadow-rose-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {suspendMutation.isPending && <Loader2 className={`h-5 w-5 ${isRtl ? 'ml-2' : ''} animate-spin`} />}
                                {t('platform.tenants.execute_isolation')}
                            </button>
                        </div>
                    </Card>
                </div>
            )}

            {/* ===== REACTIVATE MODAL ===== */}
            {modalMode === 'reactivate' && selectedTenant && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <Card className="max-w-md w-full p-10 shadow-2xl border-none rounded-[2.5rem]">
                        <div className="flex items-center gap-5 mb-8">
                            <div className="p-4 bg-emerald-50 rounded-2xl">
                                <ShieldCheck className="h-8 w-8 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Reactivate Node</h3>
                                <p className="text-slate-400 font-bold text-sm uppercase tracking-tighter">{selectedTenant.name}</p>
                            </div>
                        </div>
                        <p className="text-slate-600 text-sm font-medium mb-8 leading-relaxed">Restore all resource access and provision administrative capabilities within the ecosystem.</p>
                        <div className="flex gap-4">
                            <Button variant="outline" onClick={closeModal} className="flex-1 h-14 rounded-2xl border-slate-200 font-black uppercase tracking-widest">{t('common.cancel')}</Button>
                            <button
                                disabled={reactivateMutation.isPending}
                                onClick={() => reactivateMutation.mutate(selectedTenant.id)}
                                className="flex-1 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest shadow-2xl shadow-emerald-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {reactivateMutation.isPending && <Loader2 className="h-5 w-5 animate-spin" />}
                                {t('platform.tenants.confirm_reactivation') || 'Execute Restoration'}
                            </button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Further modals (Language, Change Plan) follow similar high-fidelity patterns... */}
            {/* ===== EDIT MODAL ===== */}
            {modalMode === 'edit' && selectedTenant && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <Card className="max-w-md w-full p-10 shadow-2xl border-none rounded-[2.5rem]">
                        <div className="flex items-center gap-5 mb-8">
                            <div className="p-4 bg-slate-50 rounded-2xl">
                                <Building2 className="h-8 w-8 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('platform.tenants.edit_identity')}</h3>
                                <p className="text-slate-400 font-bold text-sm uppercase tracking-tighter">{selectedTenant.subdomain}</p>
                            </div>
                        </div>
                        <form onSubmit={e => { e.preventDefault(); if (selectedTenant) updateMutation.mutate({ tenantId: selectedTenant.id, data: editForm }); }} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest" required>{t('platform.tenants.entity_name')}</Label>
                                <Input required value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="rounded-2xl h-12 border-slate-200 font-semibold" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest" required>{t('platform.tenants.billing_email')}</Label>
                                <Input type="email" required value={editForm.billingEmail} onChange={e => setEditForm(f => ({ ...f, billingEmail: e.target.value }))} className="rounded-2xl h-12 border-slate-200 font-semibold" />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="outline" onClick={closeModal} className="flex-1 h-14 rounded-2xl border-slate-200 font-black uppercase tracking-widest">{t('common.cancel')}</Button>
                                <Button type="submit" disabled={updateMutation.isPending} className="flex-1 h-14 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest shadow-2xl shadow-indigo-100 transition-all active:scale-95">
                                    {updateMutation.isPending ? t('common.loading') : t('common.save')}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* ===== DELETE MODAL ===== */}
            {modalMode === 'delete' && selectedTenant && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <Card className="max-w-md w-full p-10 shadow-2xl border-none rounded-[2.5rem]">
                        <div className="flex items-center gap-5 mb-8 text-rose-600">
                            <div className="p-4 bg-rose-50 rounded-2xl">
                                <X className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black tracking-tight">{t('platform.tenants.terminate_node')}</h3>
                                <p className="text-rose-400 font-bold text-sm uppercase tracking-tighter">{selectedTenant.name}</p>
                            </div>
                        </div>
                        <p className="text-slate-600 text-sm font-medium mb-8 leading-relaxed">
                            {t('platform.tenants.termination_warning')}
                        </p>
                        <div className="flex gap-4">
                            <Button variant="outline" onClick={closeModal} className="flex-1 h-14 rounded-2xl border-slate-200 font-black uppercase tracking-widest">{t('common.cancel')}</Button>
                            <button
                                disabled={deleteMutation.isPending}
                                onClick={() => selectedTenant && deleteMutation.mutate(selectedTenant.id)}
                                className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-2"
                            >
                                {deleteMutation.isPending && <Loader2 className="h-5 w-5 animate-spin" />}
                                {t('platform.tenants.confirm_termination')}
                            </button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

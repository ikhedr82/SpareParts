'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { useToast } from '@/components/toast';
import { SkeletonTable, EmptyState, DataTable, StatusBadge } from '@/components/ui-harden';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { formatDate, formatCurrency } from '@/lib/formatters';
import {
    CreditCard, Calendar, Search, Filter, AlertCircle,
    MoreHorizontal, ArrowRightLeft, ShieldCheck, Zap,
    Building2, Users, Receipt, Clock, Power, Shield, Loader2
} from 'lucide-react';

interface Subscription {
    id: string;
    tenantId: string;
    tenant: { name: string; subdomain: string };
    plan: { id: string; name: string; price: number; currency: string };
    status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING';
    startDate: string;
    endDate: string | null;
    nextBillingDate: string | null;
}

export default function PlatformSubscriptionsPage() {
    const { t, language } = useLanguage();
    const isRtl = language === 'ar';
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
    const [modalMode, setModalMode] = useState<'force_renewal' | 'override' | 'change_plan' | null>(null);
    const [overrideForm, setOverrideForm] = useState({ nextBillingDate: '', billingCycle: 'MONTHLY' });
    const [selectedPlanId, setSelectedPlanId] = useState('');

    const { data: plans } = useQuery<{ id: string; name: string }[]>({
        queryKey: ['platform-plans-minimal'],
        queryFn: async () => {
            const { data } = await apiClient.get('/api/platform/plans');
            return data;
        },
    });

    const { data: subData, isLoading, error } = useQuery<{ items: Subscription[]; total: number }>({
        queryKey: ['platform-subscriptions', page, limit, searchTerm, statusFilter],
        queryFn: async () => {
            const { data } = await apiClient.get('/api/platform/subscriptions', {
                params: { page, limit, search: searchTerm, status: statusFilter || undefined }
            });
            return data;
        },
    });

    const killSwitchMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/api/platform/subscriptions/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-subscriptions'] });
            showToast('success', t('platform.subscriptions.cancel_success') || 'Subscription terminated successfully');
        },
        // ...
    });

    const forceRenewalMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiClient.post(`/api/platform/subscriptions/${id}/force-renewal`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-subscriptions'] });
            showToast('success', 'Manual renewal triggered');
            setModalMode(null);
        },
        onError: (err: any) => {
            showToast('error', err.response?.data?.message || 'Renewal Failed');
        }
    });

    const overrideMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {
            await apiClient.patch(`/api/platform/subscriptions/${id}/override`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-subscriptions'] });
            showToast('success', 'Billing override applied');
            setModalMode(null);
        },
        onError: (err: any) => {
            showToast('error', err.response?.data?.message || 'Override Failed');
        }
    });

    const changePlanMutation = useMutation({
        mutationFn: async ({ tenantId, planId }: { tenantId: string; planId: string }) => {
            await apiClient.patch(`/api/platform/tenants/${tenantId}/plan`, { planId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-subscriptions'] });
            showToast('success', t('platform.subscriptions.plan_change_success') || 'Subscription strategy updated');
            setModalMode(null);
        },
        onError: (err: any) => {
            showToast('error', err.response?.data?.message || 'Plan Change Failed');
        }
    });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <CreditCard className="h-10 w-10 text-indigo-600" />
                        {t('platform.subscriptions.title') || 'Subscription Lifecycle'}
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg font-medium">
                        {t('platform.subscriptions.subtitle') || 'Global ecosystem billing management and administrative overrides'}
                    </p>
                </div>
            </div>

            {/* Stats / KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title={t('platform.subscriptions.total_active') || 'Total Active'} value={subData?.total || 0} icon={ShieldCheck} color="indigo" />
                <KPICard title={t('platform.subscriptions.past_due') || 'Past Due'} value={subData?.items?.filter(s => s.status === 'PAST_DUE').length || 0} icon={AlertCircle} color="amber" />
                <KPICard title={t('platform.subscriptions.mrr_pulse') || 'MRR Pulse'} value={formatCurrency(subData?.items?.reduce((acc, s) => acc + (s.status === 'ACTIVE' ? s.plan.price : 0), 0) || 0)} icon={Zap} color="emerald" />
            </div>

            <Card className="border-none shadow-sm outline outline-1 outline-slate-100 overflow-hidden rounded-[2rem]">
                <CardHeader className="bg-white border-b border-slate-50 py-8 px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-50 rounded-2xl">
                            <Filter className="h-6 w-6 text-slate-400" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">{t('platform.subscriptions.hub_registry') || 'Lifecycle Hub'}</CardTitle>
                            <CardDescription>{t('platform.subscriptions.registry_desc') || 'Monitor and manage tenant subscription states'}</CardDescription>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative w-full sm:w-80">
                            <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400`} />
                            <Input
                                placeholder={t('platform.subscriptions.search_placeholder')}
                                value={searchTerm}
                                onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                                className={`${isRtl ? 'pr-10' : 'pl-10'} rounded-xl border-slate-200 h-11`}
                            />
                        </div>
                        <div className="flex gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                            {['', 'ACTIVE', 'PAST_DUE', 'CANCELED'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => { setStatusFilter(s); setPage(1); }}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all uppercase
                                        ${statusFilter === s ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {s || t('common.all') || 'ALL'}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardHeader>

                <DataTable
                    data={subData?.items}
                    total={subData?.total}
                    page={page}
                    limit={limit}
                    onPageChange={setPage}
                    onLimitChange={setLimit}
                    isLoading={isLoading}
                    emptyTitle={t('platform.subscriptions.no_subs') || 'No subscriptions tracked'}
                    columns={[
                        {
                            header: t('platform.subscriptions.tenant') || 'Tenant Entity',
                            render: (sub) => (
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                                        <Building2 className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 text-sm leading-tight uppercase">{sub.tenant.name}</div>
                                        <div className="text-[10px] text-indigo-500 font-bold tracking-widest uppercase mt-0.5">{sub.tenant.subdomain}</div>
                                    </div>
                                </div>
                            )
                        },
                        {
                            header: t('platform.subscriptions.current_plan') || 'Active Strategy',
                            render: (sub) => (
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                                        <span className="font-bold text-slate-900 text-sm">{sub.plan.name}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mt-0.5">
                                        {formatCurrency(sub.plan.price, sub.plan.currency)} / Cycle
                                    </span>
                                </div>
                            )
                        },
                        {
                            header: t('common.status') || 'Lifecycle Status',
                            render: (sub) => <StatusBadge status={sub.status} />
                        },
                        {
                            header: t('platform.subscriptions.next_billing') || 'Next Pulse',
                            render: (sub) => (
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                    <Clock className="h-4 w-4 text-slate-300" />
                                    {sub.nextBillingDate ? formatDate(sub.nextBillingDate) : t('common.manual') || 'MANUAL'}
                                </div>
                            )
                        },
                        {
                            header: '',
                            align: isRtl ? 'left' : 'right',
                            render: (sub) => (
                                <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'} gap-2`}>
                                    <div className="relative group/actions">
                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-50">
                                            <MoreHorizontal className="h-5 w-5 text-slate-400" />
                                        </Button>
                                        <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} top-full mt-2 z-50 bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 w-56 hidden group-focus-within/actions:block hover:block`}>
                                            <button
                                                onClick={() => { setSelectedSubscription(sub); setModalMode('force_renewal'); }}
                                                className="w-full text-start px-5 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 flex items-center gap-3 uppercase tracking-widest"
                                            >
                                                <Zap className="h-4 w-4 text-amber-500" /> Force Renewal
                                            </button>
                                            <button
                                                onClick={() => { setSelectedSubscription(sub); setOverrideForm({ nextBillingDate: sub.nextBillingDate?.split('T')[0] || '', billingCycle: sub.plan.price > 0 ? 'MONTHLY' : 'MONTHLY' }); setModalMode('override'); }}
                                                className="w-full text-start px-5 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 flex items-center gap-3 uppercase tracking-widest"
                                            >
                                                <Calendar className="h-4 w-4 text-blue-500" /> Override Billing
                                            </button>
                                            <button
                                                onClick={() => { setSelectedSubscription(sub); setSelectedPlanId(sub.plan.id || ''); setModalMode('change_plan'); }}
                                                className="w-full text-start px-5 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 flex items-center gap-3 uppercase tracking-widest"
                                            >
                                                <ArrowRightLeft className="h-4 w-4 text-indigo-500" /> Change Strategy
                                            </button>
                                            <div className="border-t border-slate-50 my-2" />
                                            <button
                                                disabled={sub.status === 'CANCELED'}
                                                onClick={() => {
                                                    if (confirm(t('platform.subscriptions.kill_confirm'))) {
                                                        killSwitchMutation.mutate(sub.id);
                                                    }
                                                }}
                                                className="w-full text-start px-5 py-3 text-xs font-black text-rose-600 hover:bg-rose-50 flex items-center gap-3 uppercase tracking-widest"
                                            >
                                                <Power className="h-4 w-4 text-rose-400" /> {t('platform.subscriptions.kill_switch')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    ]}
                />
            </Card>

            {/* ===== FORCE RENEWAL MODAL ===== */}
            {modalMode === 'force_renewal' && selectedSubscription && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <Card className="max-w-md w-full p-10 shadow-2xl border-none rounded-[2.5rem]">
                        <div className="flex items-center gap-5 mb-8">
                            <div className="p-4 bg-amber-50 rounded-2xl">
                                <Zap className="h-8 w-8 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Force Renewal</h3>
                                <p className="text-slate-400 font-bold text-sm uppercase tracking-tighter">{selectedSubscription.tenant.name}</p>
                            </div>
                        </div>
                        <p className="text-slate-600 text-sm font-medium mb-8 leading-relaxed">
                            This will immediately trigger a billing cycle renewal, extending the subscription period and generating a manual invoice.
                        </p>
                        <div className="flex gap-4">
                            <Button variant="outline" onClick={() => setModalMode(null)} className="flex-1 h-14 rounded-2xl border-slate-200 font-black uppercase tracking-widest">{t('common.cancel')}</Button>
                            <button
                                onClick={() => forceRenewalMutation.mutate(selectedSubscription.id)}
                                disabled={forceRenewalMutation.isPending}
                                className="flex-1 h-14 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-widest shadow-2xl shadow-amber-100 transition-all flex items-center justify-center gap-2"
                            >
                                {forceRenewalMutation.isPending && <Loader2 className="h-5 w-5 animate-spin" />}
                                Confirm Renewal
                            </button>
                        </div>
                    </Card>
                </div>
            )}

            {/* ===== OVERRIDE BILLING MODAL ===== */}
            {modalMode === 'override' && selectedSubscription && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <Card className="max-w-md w-full p-10 shadow-2xl border-none rounded-[2.5rem]">
                        <div className="flex items-center gap-5 mb-8">
                            <div className="p-4 bg-blue-50 rounded-2xl">
                                <Calendar className="h-8 w-8 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Override Billing</h3>
                                <p className="text-slate-400 font-bold text-sm uppercase tracking-tighter">{selectedSubscription.tenant.name}</p>
                            </div>
                        </div>
                        <form onSubmit={e => { e.preventDefault(); overrideMutation.mutate({ id: selectedSubscription.id, data: overrideForm }); }} className="space-y-6">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400" required>
                                    {t('platform.subscriptions.form_next_billing') || 'Next Billing Date'}
                                </Label>
                                <Input
                                    type="date"
                                    required
                                    value={overrideForm.nextBillingDate}
                                    onChange={e => setOverrideForm(f => ({ ...f, nextBillingDate: e.target.value }))}
                                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-semibold"
                                />
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400" required>
                                    {t('platform.subscriptions.form_cycle') || 'Billing Cycle'}
                                </Label>
                                <select
                                    required
                                    value={overrideForm.billingCycle}
                                    onChange={e => setOverrideForm(f => ({ ...f, billingCycle: e.target.value as any }))}
                                    className="w-full h-14 px-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-semibold text-sm outline-none"
                                >
                                    <option value="MONTHLY">{t('common.monthly')}</option>
                                    <option value="YEARLY">{t('common.yearly')}</option>
                                </select>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="outline" onClick={() => setModalMode(null)} className="flex-1 h-14 rounded-2xl border-slate-200 font-black uppercase tracking-widest">{t('common.cancel')}</Button>
                                <Button type="submit" disabled={overrideMutation.isPending} className="flex-1 h-14 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest shadow-2xl shadow-indigo-100 transition-all active:scale-95">
                                    {overrideMutation.isPending ? t('common.loading') : 'Apply Override'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* ===== CHANGE PLAN MODAL ===== */}
            {modalMode === 'change_plan' && selectedSubscription && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <Card className="max-w-md w-full p-10 shadow-2xl border-none rounded-[2.5rem]">
                        <div className="flex items-center gap-5 mb-8">
                            <div className="p-4 bg-indigo-50 rounded-2xl">
                                <ArrowRightLeft className="h-8 w-8 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Change Strategy</h3>
                                <p className="text-slate-400 font-bold text-sm uppercase tracking-tighter">{selectedSubscription.tenant.name}</p>
                            </div>
                        </div>
                        <form onSubmit={e => { e.preventDefault(); changePlanMutation.mutate({ tenantId: selectedSubscription.tenantId, planId: selectedPlanId }); }} className="space-y-6">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400" required>
                                    {t('platform.subscriptions.form_select_plan') || 'Select Strategy'}
                                </Label>
                                <select
                                    required
                                    value={selectedPlanId}
                                    onChange={e => setSelectedPlanId(e.target.value)}
                                    className="w-full h-14 px-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-semibold text-sm outline-none"
                                >
                                    <option value="">{t('platform.subscriptions.choose_plan') || 'Select Strategy'}</option>
                                    {plans?.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                                <p className="text-[10px] font-bold text-amber-800 uppercase leading-relaxed">
                                    Strategic shifts will immediately re-calculate resource boundaries and update the recurring billing pulse.
                                </p>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="outline" onClick={() => setModalMode(null)} className="flex-1 h-14 rounded-2xl border-slate-200 font-black uppercase tracking-widest">{t('common.cancel')}</Button>
                                <Button type="submit" disabled={changePlanMutation.isPending || !selectedPlanId} className="flex-1 h-14 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest shadow-2xl shadow-indigo-100 transition-all active:scale-95">
                                    {changePlanMutation.isPending ? t('common.loading') : 'Apply Shift'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}

function KPICard({ title, value, icon: Icon, color }: any) {
    const colors: any = {
        indigo: 'bg-indigo-50 text-indigo-600',
        amber: 'bg-amber-50 text-amber-600',
        emerald: 'bg-emerald-50 text-emerald-600',
    };

    return (
        <Card className="rounded-[2.5rem] p-8 border-none outline outline-1 outline-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${colors[color]} group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                <Icon className="w-7 h-7" />
            </div>
            <h4 className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-2">{title}</h4>
            <div className="text-4xl font-black text-slate-900 tracking-tight">{value}</div>
        </Card>
    );
}

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import {
    Users, Building2, Package, CreditCard,
    Calendar, ShieldCheck, ShieldBan, ArrowLeft,
    Clock, Activity, ChevronRight, ExternalLink,
    Zap, Receipt, History, AlertCircle, TrendingUp,
    LayoutDashboard, Database, Shield
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useToast } from '@/components/toast';
import {
    Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton, EmptyState, StatusBadge, DataTable, JsonView } from '@/components/ui-harden';
import { formatCurrency, formatDate } from '@/lib/formatters';
import Link from 'next/link';
import { useState } from 'react';

interface TenantDetails {
    id: string;
    name: string;
    subdomain: string;
    status: 'ACTIVE' | 'SUSPENDED';
    plan: {
        id: string;
        name: string;
    };
    subscription?: {
        status: string;
        nextBillingDate: string;
        currentPeriodEnd: string;
    };
    _count: {
        users: number;
        branches: number;
        products: number;
    };
    planLimits: {
        maxUsers: number;
        maxBranches: number;
        maxProducts: number;
    };
    createdAt: string;
    baseCurrency: string;
}

export default function TenantDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { t, language } = useLanguage();
    const isRtl = language === 'ar';
    const [activeTab, setActiveTab] = useState<'overview' | 'billing' | 'activity'>('overview');
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const { data: tenant, isLoading, error } = useQuery<TenantDetails>({
        queryKey: ['platform-tenant', id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/api/platform/tenants/${id}`);
            return data;
        },
    });

    const { data: invoices, isLoading: isInvoicesLoading } = useQuery({
        queryKey: ['tenant-invoices', id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/api/platform/tenants/${id}/invoices`);
            return data;
        },
        enabled: activeTab === 'billing' || !!tenant,
    });

    const { data: activities, isLoading: isActivityLoading } = useQuery({
        queryKey: ['tenant-activity', id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/api/platform/tenants/${id}/activity`, {
                params: { limit: 20 }
            });
            return data.items;
        },
        enabled: activeTab === 'activity' || !!tenant,
    });

    const suspendMutation = useMutation({
        mutationFn: async () => {
            await apiClient.post(`/api/platform/tenants/${id}/suspend`, { reason: 'Administrative Suspension' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-tenant', id] });
            showToast('success', 'Tenant cluster suspended successfully');
        },
        onError: (err: any) => showToast('error', err.response?.data?.message || 'Failed to suspend tenant'),
    });

    const reactivateMutation = useMutation({
        mutationFn: async () => {
            await apiClient.post(`/api/platform/tenants/${id}/reactivate`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-tenant', id] });
            showToast('success', 'Tenant cluster reactivated successfully');
        },
        onError: (err: any) => showToast('error', err.response?.data?.message || 'Failed to reactivate tenant'),
    });

    const interventionMutation = useMutation({
        mutationFn: async () => {
            await apiClient.post(`/api/platform/tenants/${id}/intervention`);
        },
        onSuccess: () => {
            showToast('success', 'Direct intervention protocol initiated and logged');
        },
        onError: (err: any) => showToast('error', err.response?.data?.message || 'Failed to initiate intervention'),
    });

    if (isLoading) {
        return (
            <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center gap-6 pb-8 border-b border-slate-100">
                    <Skeleton className="h-16 w-16 rounded-2xl" />
                    <div className="space-y-3 flex-1">
                        <Skeleton className="h-10 w-64 rounded-xl" />
                        <Skeleton className="h-5 w-48 rounded-lg" />
                    </div>
                    <div className="flex gap-3">
                        <Skeleton className="h-12 w-32 rounded-xl" />
                        <Skeleton className="h-12 w-48 rounded-xl" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Skeleton className="h-40 rounded-[2rem]" />
                    <Skeleton className="h-40 rounded-[2rem]" />
                    <Skeleton className="h-40 rounded-[2rem]" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Skeleton className="h-[600px] rounded-[2.5rem]" />
                    </div>
                    <div>
                        <Skeleton className="h-96 rounded-[2.5rem]" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !tenant) {
        return (
            <div className="p-24 text-center max-w-2xl mx-auto animate-in zoom-in duration-300">
                <div className="h-24 w-24 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <ShieldBan className="h-12 w-12" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">{t('platform.tenants.not_found') || 'Entity Missing'}</h2>
                <p className="text-slate-500 text-lg font-medium leading-relaxed mb-10">
                    {t('platform.tenants.not_found_desc') || "The specified tenant descriptor could not be resolved within the secure cluster context."}
                </p>
                <Button onClick={() => router.push('/platform/tenants')} className="rounded-2xl h-14 px-10 bg-slate-900 hover:bg-slate-800 font-bold shadow-xl shadow-slate-100">
                    <ArrowLeft className="h-5 w-5 mr-3" />
                    {t('platform.tenants.back_to_list') || 'Return to Registry'}
                </Button>
            </div>
        );
    }

    const usageStats = [
        { label: 'Users', current: tenant._count.users, limit: tenant.planLimits.maxUsers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Branches', current: tenant._count.branches, limit: tenant.planLimits.maxBranches, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Products', current: tenant._count.products, limit: tenant.planLimits.maxProducts, icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    const getActionColor = (action: string) => {
        if (action.includes('CREATE')) return 'text-emerald-500 bg-emerald-50';
        if (action.includes('UPDATE')) return 'text-amber-500 bg-amber-50';
        if (action.includes('DELETE')) return 'text-rose-500 bg-rose-50';
        return 'text-indigo-500 bg-indigo-50';
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
            {/* Unified Management Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="flex items-start gap-6">
                    <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-200">
                        <Shield className="w-10 h-10" />
                    </div>
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{tenant.name}</h1>
                            <StatusBadge status={tenant.status} />
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-sm tracking-widest bg-slate-50 w-fit px-3 py-1 rounded-xl">
                            <Database className="w-4 h-4" />
                            {tenant.subdomain}.partivo.net
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <Link href={`/platform/audit-logs?tenantId=${id}`}>
                        <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 font-black shadow-sm bg-white hover:bg-slate-50 flex items-center gap-3">
                            <History className="h-5 w-5 text-indigo-500" />
                            {t('platform.tenants.view_audit_logs')}
                        </Button>
                    </Link>
                    <Link href={`/platform/subscriptions?search=${tenant.subdomain}`}>
                        <Button className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black shadow-2xl shadow-indigo-100 flex items-center gap-3">
                            <Zap className="h-5 w-5" />
                            {t('platform.tenants.manage_subscriptions')}
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 p-1.5 bg-slate-100/50 w-fit rounded-[1.5rem] border border-slate-200/50">
                {[
                    { id: 'overview', icon: LayoutDashboard, label: '360 Overview' },
                    { id: 'billing', icon: Receipt, label: 'Financial Feed' },
                    { id: 'activity', icon: Activity, label: 'Ecosystem Pulse' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl text-sm font-black transition-all duration-300 uppercase tracking-widest ${activeTab === tab.id
                            ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100/50 scale-105'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-300'}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Main Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    {activeTab === 'overview' && (
                        <>
                            {/* Resource Utilization */}
                            <Card className="border-none shadow-sm outline outline-1 outline-slate-100 rounded-[2.5rem] overflow-hidden bg-white group">
                                <CardHeader className="p-10 pb-5">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <CardTitle className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                                <TrendingUp className="text-emerald-500 w-7 h-7" />
                                                Resource Quotas
                                            </CardTitle>
                                            <CardDescription className="text-slate-400 font-medium tracking-tight">Real-time resource consumption relative to provisioned capacity</CardDescription>
                                        </div>
                                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-black px-4 py-1.5 rounded-xl uppercase tracking-widest text-[10px]">Synchronized</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-10 pt-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
                                        {usageStats.map((stat) => {
                                            const percent = stat.limit > 0 ? Math.min((stat.current / stat.limit) * 100, 100) : 0;
                                            const isCritical = percent > 90;
                                            return (
                                                <div key={stat.label} className="space-y-6 group/stat">
                                                    <div className="flex items-center justify-between">
                                                        <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover/stat:rotate-12 transition-transform duration-500`}>
                                                            <stat.icon className="h-6 w-6" />
                                                        </div>
                                                        <div className={`text-sm font-black ${isCritical ? 'text-rose-500' : 'text-slate-400'} uppercase tracking-widest`}>
                                                            {Math.round(percent)}%
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="flex items-end justify-between">
                                                            <div>
                                                                <div className="text-3xl font-black text-slate-900 leading-none">{stat.current}</div>
                                                                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">{stat.label}</div>
                                                            </div>
                                                            <div className="text-[10px] text-slate-300 font-bold mb-1">CAP: {stat.limit}</div>
                                                        </div>
                                                        <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                                            <div
                                                                className={`h-full transition-all duration-1000 ease-out rounded-full ${isCritical ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]' : 'bg-indigo-600 shadow-[0_0_12px_rgba(79,70,229,0.3)]'
                                                                    }`}
                                                                style={{ width: `${percent}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Deep Dive Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <Card className="border-none shadow-sm outline outline-1 outline-slate-100 rounded-[2rem] overflow-hidden">
                                    <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
                                        <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-3">
                                            <ShieldCheck className="w-5 h-5 text-indigo-500" />
                                            Identity & Governance
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8 space-y-6">
                                        {[
                                            { label: 'Cluster Inception', value: formatDate(tenant.createdAt), icon: Calendar },
                                            { label: 'Ecosystem Currency', value: tenant.baseCurrency, icon: Database, badge: true },
                                            { label: 'Internal Descriptor', value: tenant.id, icon: LayoutDashboard, mono: true },
                                        ].map((item) => (
                                            <div key={item.label} className="flex justify-between items-start gap-4">
                                                <div className="flex items-center gap-3">
                                                    <item.icon className="w-4 h-4 text-slate-300" />
                                                    <span className="text-sm text-slate-400 font-bold uppercase tracking-wider">{item.label}</span>
                                                </div>
                                                {item.badge ? (
                                                    <Badge className="bg-slate-100 text-slate-700 border-none font-black px-3 py-0.5 rounded-lg uppercase tracking-tighter">{item.value}</Badge>
                                                ) : item.mono ? (
                                                    <span className="font-mono text-[10px] bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-slate-500 break-all text-right max-w-[140px] leading-tight">{item.value}</span>
                                                ) : (
                                                    <span className="text-sm font-black text-slate-900 text-right">{item.value}</span>
                                                )}
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-sm outline outline-1 outline-slate-100 rounded-[2rem] overflow-hidden">
                                    <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
                                        <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-3">
                                            <Zap className="w-5 h-5 text-amber-500" />
                                            Subscription Vector
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8 space-y-6">
                                        {[
                                            { label: 'Deployment Strategy', value: tenant.plan.name, icon: Zap, highlight: true },
                                            { label: 'Lifecycle State', value: tenant.subscription?.status || 'UNPROVISIONED', icon: Shield, status: true },
                                            { label: 'Re-Provision Date', value: tenant.subscription?.nextBillingDate ? formatDate(tenant.subscription.nextBillingDate) : 'MANUAL', icon: Clock },
                                        ].map((item) => (
                                            <div key={item.label} className="flex justify-between items-center gap-4">
                                                <div className="flex items-center gap-3">
                                                    <item.icon className="w-4 h-4 text-slate-300" />
                                                    <span className="text-sm text-slate-400 font-bold uppercase tracking-wider">{item.label}</span>
                                                </div>
                                                {item.status ? (
                                                    <StatusBadge status={item.value} />
                                                ) : item.highlight ? (
                                                    <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl uppercase tracking-tighter">{item.value}</span>
                                                ) : (
                                                    <span className="text-sm font-black text-slate-900">{item.value}</span>
                                                )}
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    )}

                    {activeTab === 'billing' && (
                        <Card className="border-none shadow-sm outline outline-1 outline-slate-100 rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-10 pb-5">
                                <CardTitle className="text-2xl font-black text-slate-900 mb-2">{t('platform.tenants.financial_ledger') || 'Financial Ledger'}</CardTitle>
                                <CardDescription>Comprehensive history of settlement vectors and invoice states</CardDescription>
                            </CardHeader>
                            <DataTable
                                data={invoices || []}
                                isLoading={isInvoicesLoading}
                                emptyTitle="No ledger entries found"
                                columns={[
                                    {
                                        header: 'Trace ID',
                                        render: (inv) => <span className="font-mono text-[10px] text-slate-400">{inv.id.split('-')[0]}...</span>
                                    },
                                    {
                                        header: 'Quantum',
                                        render: (inv) => <span className="font-black text-slate-900">{formatCurrency(inv.amount, inv.currency)}</span>
                                    },
                                    {
                                        header: 'Settlement Status',
                                        render: (inv) => <StatusBadge status={inv.status} />
                                    },
                                    {
                                        header: 'Emission Date',
                                        render: (inv) => <span className="text-sm font-medium text-slate-500">{formatDate(inv.createdAt)}</span>
                                    }
                                ]}
                            />
                        </Card>
                    )}

                    {activeTab === 'activity' && (
                        <Card className="border-none shadow-sm outline outline-1 outline-slate-100 rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-10 pb-5 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-black text-slate-900 mb-2">{t('platform.tenants.pulse_stream') || 'Ecosystem Pulse'}</CardTitle>
                                    <CardDescription>Real-time audit stream of administrative and automated operations</CardDescription>
                                </div>
                                <Link href={`/platform/audit-logs?tenantId=${id}`}>
                                    <Button variant="ghost" className="font-black text-indigo-600 hover:bg-indigo-50 rounded-xl px-6 uppercase tracking-widest text-[10px]">Deep Audit</Button>
                                </Link>
                            </CardHeader>
                            <DataTable
                                data={activities || []}
                                isLoading={isActivityLoading}
                                emptyTitle="Pulse stream currently silent"
                                columns={[
                                    {
                                        header: 'Operation Vector',
                                        render: (act) => (
                                            <div className="flex items-start gap-4">
                                                <div className={`p-2.5 rounded-xl ${getActionColor(act.action)}`}>
                                                    <Activity className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-900 text-sm uppercase tracking-tight">{act.action.replace(/_/g, ' ')}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{act.entityType}</div>
                                                </div>
                                            </div>
                                        )
                                    },
                                    {
                                        header: 'Initiator',
                                        render: (act) => (
                                            <div className="text-sm font-bold text-slate-600 truncate max-w-[150px]">
                                                {act.user?.email || 'System Core'}
                                            </div>
                                        )
                                    },
                                    {
                                        header: 'Temporal Mark',
                                        render: (act) => <span className="text-sm font-medium text-slate-400 whitespace-nowrap">{formatDate(act.createdAt)}</span>
                                    },
                                    {
                                        header: '',
                                        align: 'right',
                                        render: (act) => (
                                            <Button variant="ghost" size="icon" onClick={() => { }} className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ChevronRight className="w-4 h-4 text-slate-300" />
                                            </Button>
                                        )
                                    }
                                ]}
                            />
                        </Card>
                    )}
                </div>

                {/* Tactical Actions Sidebar */}
                <div className="space-y-10">
                    <Card className="border-none shadow-2xl shadow-indigo-100 rounded-[2.5rem] bg-indigo-600 text-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-45 transition-transform duration-1000">
                            <Shield className="w-32 h-32" />
                        </div>
                        <CardHeader className="p-10 relative z-10">
                            <CardTitle className="text-2xl font-black tracking-tighter uppercase whitespace-nowrap">Tactical Override</CardTitle>
                            <CardDescription className="text-indigo-100/70 font-bold text-sm">Direct administrative intervention layer</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 pt-0 space-y-4 relative z-10">
                            <Button className="w-full h-16 rounded-[1.5rem] bg-white/10 hover:bg-white/20 text-white border-none font-black text-sm uppercase tracking-widest justify-start px-6 gap-4 backdrop-blur-md transition-all active:scale-95">
                                <Users className="w-5 h-5 text-indigo-200" /> User Directory
                            </Button>
                            <Button className="w-full h-16 rounded-[1.5rem] bg-white/10 hover:bg-white/20 text-white border-none font-black text-sm uppercase tracking-widest justify-start px-6 gap-4 backdrop-blur-md transition-all active:scale-95">
                                <Building2 className="w-5 h-5 text-indigo-200" /> Node Network
                            </Button>
                            <Button className="w-full h-16 rounded-[1.5rem] bg-white/10 hover:bg-white/20 text-white border-none font-black text-sm uppercase tracking-widest justify-start px-6 gap-4 backdrop-blur-md transition-all active:scale-95">
                                <Activity className="w-5 h-5 text-indigo-200" /> Protocol Logs
                            </Button>
                            <div className="pt-4 mt-4 border-t border-indigo-500/50 space-y-3">
                                <Button
                                    onClick={() => interventionMutation.mutate()}
                                    disabled={interventionMutation.isPending}
                                    className="w-full h-16 rounded-[1.5rem] bg-indigo-500 hover:bg-indigo-400 text-white border-none font-black text-sm uppercase tracking-widest transition-all active:scale-95"
                                >
                                    {interventionMutation.isPending ? <Activity className="animate-spin" /> : <ShieldCheck className="w-5 h-5 mr-3" />}
                                    Direct Intervention
                                </Button>
                                <Button
                                    onClick={() => tenant.status === 'ACTIVE' ? suspendMutation.mutate() : reactivateMutation.mutate()}
                                    disabled={suspendMutation.isPending || reactivateMutation.isPending}
                                    className={`w-full h-16 rounded-[1.5rem] ${tenant.status === 'ACTIVE' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'} text-white border-none font-black text-sm uppercase tracking-widest shadow-2xl shadow-rose-900/40 transition-all active:scale-95`}
                                >
                                    {(suspendMutation.isPending || reactivateMutation.isPending) ? (
                                        <Activity className="animate-spin" />
                                    ) : (
                                        <>
                                            {tenant.status === 'ACTIVE' ? <ShieldBan className="w-5 h-5 mr-3" /> : <Zap className="w-5 h-5 mr-3" />}
                                            {tenant.status === 'ACTIVE' ? 'Suspend Cluster' : 'Reactivate Cluster'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm outline outline-1 outline-slate-100 rounded-[2.5rem] bg-slate-50/50">
                        <CardHeader className="p-8">
                            <CardTitle className="text-xl font-black text-slate-800 tracking-tight">Intelligence Note</CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-10 text-center">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-8 h-8 text-indigo-400" />
                            </div>
                            <p className="text-sm font-bold text-slate-400 leading-relaxed max-w-[220px] mx-auto uppercase tracking-widest">
                                Dynamic support ticket integration pending manual provision...
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

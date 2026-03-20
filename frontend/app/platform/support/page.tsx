'use client';

import {
    HeadphonesIcon, Search, AlertCircle, CheckCircle, Clock,
    AlertTriangle, Plus, Loader2, X, Filter, MoreHorizontal, Eye, RefreshCw
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { useToast } from '@/components/toast';
import { SkeletonTable, EmptyState, DataTable, StatusBadge } from '@/components/ui-harden';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/formatters';

interface Ticket {
    id: string;
    subject: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
    createdAt: string;
    tenantId?: string;
    tenant?: { name: string; subdomain: string };
}

export default function PlatformSupportPage() {
    const { t, language } = useLanguage();
    const isRtl = language === 'ar';
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [statusFilter, setStatusFilter] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createForm, setCreateForm] = useState({
        subject: '',
        description: '',
        priority: 'MEDIUM' as const,
        tenantId: ''
    });

    const { data: ticketData, isLoading, error } = useQuery<{ items: Ticket[]; total: number }>({
        queryKey: ['platform-tickets', page, limit, searchTerm, statusFilter],
        queryFn: async () => {
            const { data } = await apiClient.get('/api/platform/support', {
                params: { page, limit, search: searchTerm, status: statusFilter }
            });
            return data;
        },
    });

    const { data: tenantData } = useQuery<{ items: any[] }>({
        queryKey: ['platform-tenants-minimal'],
        queryFn: async () => {
            const { data } = await apiClient.get('/api/platform/tenants', { params: { limit: 100 } });
            return data;
        },
    });
    const tenants = tenantData?.items || [];

    const createMutation = useMutation({
        mutationFn: async (dto: typeof createForm) => {
            await apiClient.post('/api/platform/support', dto);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-tickets'] });
            showToast('success', t('platform.support.create_success'));
            setIsCreateModalOpen(false);
            setCreateForm({ subject: '', description: '', priority: 'MEDIUM', tenantId: '' });
        },
        onError: (err: any) => {
            showToast('error', err.response?.data?.message || t('platform.support.create_error'));
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            await apiClient.patch(`/api/platform/support/${id}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-tickets'] });
            showToast('success', t('platform.support.status_updated'));
        },
        onError: () => {
            showToast('error', t('platform.support.status_error'));
        }
    });

    const stats = {
        total: ticketData?.total || 0,
        open: ticketData?.items?.filter(t => t.status === 'OPEN').length || 0,
        critical: ticketData?.items?.filter(t => t.priority === 'CRITICAL').length || 0
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <HeadphonesIcon className="h-10 w-10 text-indigo-600" />
                        {t('platform.support.title')}
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg font-medium">
                        {t('platform.support.subtitle')}
                    </p>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold shadow-xl shadow-indigo-100 flex items-center gap-2"
                >
                    <Plus className="h-5 w-5" />
                    {t('platform.support.new_ticket')}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title={t('platform.support.active_queue')} value={stats.total} icon={Clock} color="indigo" />
                <KPICard title={t('platform.support.open_tickets')} value={stats.open} icon={AlertCircle} color="amber" />
                <KPICard title={t('platform.support.critical_tickets')} value={stats.critical} icon={AlertTriangle} color="rose" />
            </div>

            <Card className="border-none shadow-sm outline outline-1 outline-slate-100 overflow-hidden rounded-3xl">
                <CardHeader className="bg-white border-b border-slate-50 py-8 px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-50 rounded-2xl">
                            <Filter className="h-6 w-6 text-slate-400" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">{t('platform.support.ticket_registry')}</CardTitle>
                            <CardDescription>{t('platform.support.registry_desc')}</CardDescription>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative w-full sm:w-64">
                            <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400`} />
                            <Input
                                placeholder={t('platform.support.search_placeholder')}
                                value={searchTerm}
                                onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                                className={`${isRtl ? 'pr-10' : 'pl-10'} rounded-xl border-slate-200 h-11`}
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                            className="h-11 px-4 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
                        >
                            <option value="">{t('common.all_status')}</option>
                            <option value="OPEN">{t('platform.support.status_open')}</option>
                            <option value="IN_PROGRESS">{t('platform.support.status_in_progress')}</option>
                            <option value="CLOSED">{t('platform.support.status_closed')}</option>
                        </select>
                    </div>
                </CardHeader>

                <DataTable
                    data={ticketData?.items}
                    total={ticketData?.total}
                    page={page}
                    limit={limit}
                    onPageChange={setPage}
                    onLimitChange={setLimit}
                    isLoading={isLoading}
                    emptyTitle={t('platform.support.no_tickets')}
                    columns={[
                        {
                            header: t('platform.support.identity'),
                            render: (ticket) => (
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">
                                        #{ticket.id.slice(-4).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 text-sm">{ticket.subject}</div>
                                        <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">{ticket.priority}</div>
                                    </div>
                                </div>
                            )
                        },
                        {
                            header: t('platform.support.origin'),
                            render: (ticket) => (
                                <div className="flex flex-col">
                                    <span className="font-semibold text-slate-700 text-sm">{ticket.tenant?.name || t('platform.support.platform_system')}</span>
                                    {ticket.tenant?.subdomain && <span className="text-[10px] text-slate-400 font-mono">{ticket.tenant.subdomain}</span>}
                                </div>
                            )
                        },
                        {
                            header: t('common.status'),
                            render: (ticket) => (
                                <select
                                    value={ticket.status}
                                    onChange={(e) => updateStatusMutation.mutate({ id: ticket.id, status: e.target.value })}
                                    className={`text-[10px] font-black px-3 py-1.5 rounded-full border-2 border-transparent cursor-pointer focus:ring-2 focus:ring-indigo-100 transition-all uppercase tracking-widest
                                        ${ticket.status === 'OPEN' ? 'bg-blue-50 text-blue-600' :
                                            ticket.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-600' :
                                                'bg-emerald-50 text-emerald-600'}`}
                                >
                                    <option value="OPEN">{t('platform.support.status_open')}</option>
                                    <option value="IN_PROGRESS">{t('platform.support.status_in_progress')}</option>
                                    <option value="CLOSED">{t('platform.support.status_closed')}</option>
                                </select>
                            )
                        },
                        {
                            header: t('common.date'),
                            render: (ticket) => (
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-600">{formatDate(ticket.createdAt)}</span>
                                </div>
                            )
                        }
                    ]}
                />
            </Card>

            {/* Create Ticket Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <Card className="max-w-lg w-full p-0 shadow-2xl border-none overflow-hidden rounded-[2rem]">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-2xl font-black text-slate-900">{t('platform.support.initiate_title')}</CardTitle>
                                    <CardDescription>{t('platform.support.initiate_desc')}</CardDescription>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsCreateModalOpen(false)} className="rounded-2xl hover:bg-slate-200">
                                    <X className="h-6 w-6 text-slate-500" />
                                </Button>
                            </div>
                        </CardHeader>

                        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(createForm); }} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400" required>
                                    {t('platform.support.form_subject')}
                                </Label>
                                <Input
                                    required
                                    value={createForm.subject}
                                    onChange={e => setCreateForm(f => ({ ...f, subject: e.target.value }))}
                                    placeholder={t('platform.support.subject_placeholder')}
                                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-semibold"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        {t('platform.support.form_tenant')}
                                    </Label>
                                    <select
                                        className="w-full h-14 px-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-semibold text-sm outline-none"
                                        value={createForm.tenantId}
                                        onChange={e => setCreateForm(f => ({ ...f, tenantId: e.target.value }))}
                                    >
                                        <option value="">{t('platform.support.global_scope')}</option>
                                        {tenants?.map(t3 => (
                                            <option key={t3.id} value={t3.id}>{t3.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400" required>
                                        {t('platform.support.form_priority')}
                                    </Label>
                                    <select
                                        className="w-full h-14 px-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-semibold text-sm outline-none"
                                        value={createForm.priority}
                                        onChange={e => setCreateForm(f => ({ ...f, priority: e.target.value as any }))}
                                    >
                                        <option value="LOW">{t('platform.support.priority_low')}</option>
                                        <option value="MEDIUM">{t('platform.support.priority_medium')}</option>
                                        <option value="HIGH">{t('platform.support.priority_high')}</option>
                                        <option value="CRITICAL">{t('platform.support.priority_critical')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400" required>
                                    {t('platform.support.form_desc')}
                                </Label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all text-sm font-semibold resize-none outline-none font-sans"
                                    value={createForm.description}
                                    onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder={t('platform.support.desc_placeholder')}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 rounded-2xl font-black h-12 border-slate-200"
                                >
                                    {t('common.cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="flex-1 rounded-2xl bg-indigo-600 text-white font-black h-12 shadow-xl shadow-indigo-100 active:scale-95 transition-all"
                                >
                                    {createMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : t('platform.support.create_btn')}
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
        rose: 'bg-rose-50 text-rose-600',
    };

    return (
        <Card className="rounded-[2rem] p-8 border-none outline outline-1 outline-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${colors[color]} group-hover:scale-110 transition-transform duration-500`}>
                <Icon className="w-7 h-7" />
            </div>
            <h4 className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-2">{title}</h4>
            <div className="text-4xl font-black text-slate-900 tracking-tight">{value}</div>
        </Card>
    );
}

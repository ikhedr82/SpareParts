'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
    Activity, Search, Filter, Calendar,
    User, Building2, Terminal, Info,
    ChevronRight, AlertTriangle, Eye, X, Shield, Hash
} from 'lucide-react';
import apiClient from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
    Card, CardHeader, CardTitle, CardContent, CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SkeletonTable, EmptyState, DataTable, StatusBadge, JsonView } from '@/components/ui-harden';
import { formatDate } from '@/lib/formatters';

interface AuditLog {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    userId: string;
    userEmail?: string;
    user?: { email: string };
    tenantId: string;
    tenant?: { name: string; subdomain: string };
    oldValue: any;
    newValue: any;
    ipAddress?: string;
    createdAt: string;
}

export default function AuditLogsPage() {
    const { t, language } = useLanguage();
    const isRtl = language === 'ar';

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [entityFilter, setEntityFilter] = useState('');
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const { data: logData, isLoading, error } = useQuery<{ items: AuditLog[]; total: number }>({
        queryKey: ['platform-audit-logs', page, limit, searchTerm, actionFilter, entityFilter],
        queryFn: async () => {
            const { data } = await apiClient.get('/api/platform/audit-logs', {
                params: {
                    page,
                    limit,
                    search: searchTerm,
                    action: actionFilter,
                    entityType: entityFilter
                }
            });
            return data;
        },
    });

    const logs = logData?.items || [];
    const total = logData?.total || 0;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Shield className="h-10 w-10 text-indigo-600" />
                        {t('platform.audit.title') || 'System Accountability'}
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg font-medium">
                        {t('platform.audit.subtitle') || 'Global immutable audit logs for security and compliance monitoring'}
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 font-bold shadow-sm">
                        <Terminal className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'} text-slate-400`} />
                        {t('platform.audit.export_json')}
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="border-none shadow-sm outline outline-1 outline-slate-100 rounded-3xl overflow-hidden px-2 px-8 py-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400`} />
                        <Input
                            placeholder={t('platform.audit.search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                            className={`${isRtl ? 'pr-10' : 'pl-10'} rounded-xl h-11 border-slate-200`}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={entityFilter}
                            onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
                            className="h-11 px-4 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50 min-w-[150px]"
                        >
                            <option value="">{t('platform.audit.all_entities') || 'All Entities'}</option>
                            <option value="Tenant">Tenant</option>
                            <option value="User">User</option>
                            <option value="Plan">Plan</option>
                            <option value="Currency">Currency</option>
                            <option value="SupportTicket">Support Ticket</option>
                        </select>
                        <select
                            value={actionFilter}
                            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                            className="h-11 px-4 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50 min-w-[150px]"
                        >
                            <option value="">{t('platform.audit.all_actions') || 'All Actions'}</option>
                            <option value="CREATE_TENANT">CREATE_TENANT</option>
                            <option value="SUSPEND_TENANT">SUSPEND_TENANT</option>
                            <option value="CREATE_USER">CREATE_USER</option>
                            <option value="UPDATE_PLAN">UPDATE_PLAN</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Table */}
            <DataTable
                data={logs}
                total={total}
                page={page}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={setLimit}
                isLoading={isLoading}
                error={error}
                emptyTitle={t('platform.audit.no_logs') || 'No accountability logs found'}
                columns={[
                    {
                        header: t('common.timestamp'),
                        render: (log) => (
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-900 text-sm leading-tight">{formatDate(log.createdAt)}</span>
                                <span className="text-[10px] text-slate-400 font-mono italic uppercase">{new Date(log.createdAt).toLocaleTimeString()}</span>
                            </div>
                        )
                    },
                    {
                        header: t('platform.audit.subject') || 'Actor / Scope',
                        render: (log) => (
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                    <User className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-900 text-sm">{log.user?.email || 'System'}</span>
                                    <span className="text-[10px] text-indigo-500 font-black flex items-center gap-1 uppercase tracking-tighter">
                                        <Building2 className="h-3 w-3" /> {log.tenant?.name || 'Platform'}
                                    </span>
                                </div>
                            </div>
                        )
                    },
                    {
                        header: t('platform.audit.action') || 'Operation',
                        render: (log) => <StatusBadge status={log.action} />
                    },
                    {
                        header: t('platform.audit.target') || 'Resource Target',
                        render: (log) => (
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-slate-700 uppercase">{log.entityType}</span>
                                <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">{log.entityId}</span>
                            </div>
                        )
                    },
                    {
                        header: '',
                        align: isRtl ? 'left' : 'right',
                        render: (log) => (
                            <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedLog(log)}
                                    className="h-9 w-9 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all p-0"
                                >
                                    <Eye className="h-5 w-5" />
                                </Button>
                            </div>
                        )
                    }
                ]}
            />

            {/* Log Detail Drawer/Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-end z-50 animate-in fade-in slide-in-from-right duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
                    <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <Activity className="h-6 w-6 text-indigo-600" />
                                    {t('platform.audit.details_title') || 'Transaction Details'}
                                </h2>
                                <p className="text-slate-500 text-sm font-medium">{t('platform.audit.details_id') || 'Log Index'}: {selectedLog.id}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedLog(null)} className="rounded-2xl hover:bg-slate-200">
                                <X className="h-7 w-7 text-slate-500" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-10">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('platform.audit.actor') || 'Initiating Actor'}</div>
                                    <div className="font-bold text-slate-900 truncate">{selectedLog.user?.email || 'System'}</div>
                                    <div className="text-[10px] text-indigo-500 font-bold uppercase mt-1">IP: {selectedLog.ipAddress || 'Internal'}</div>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('platform.audit.target_scope') || 'Target Scope'}</div>
                                    <div className="font-bold text-slate-900">{selectedLog.entityType}</div>
                                    <div className="text-[10px] text-slate-400 font-mono truncate mt-1">{selectedLog.entityId}</div>
                                </div>
                            </div>

                            {/* Data Diffs */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        <div className="w-2 h-6 bg-indigo-600 rounded-full" />
                                        {t('platform.audit.change_payload') || 'State Change Payload'}
                                    </h3>

                                    <div className="grid grid-cols-1 gap-6">
                                        {selectedLog.oldValue ? (
                                            <div className="space-y-6">
                                                <JsonView data={selectedLog.oldValue} title={t('platform.audit.pre_state') || 'Pre-Operation State'} />
                                                <div className="flex justify-center">
                                                    <div className="bg-indigo-50 p-2 rounded-full text-indigo-600">
                                                        <ChevronRight className="h-6 w-6 rotate-90" />
                                                    </div>
                                                </div>
                                                <JsonView data={selectedLog.newValue} title={t('platform.audit.post_state') || 'Post-Operation State'} />
                                            </div>
                                        ) : (
                                            <JsonView data={selectedLog.newValue} title={t('platform.audit.creation_state') || 'Resource Initiation Payload'} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-100 bg-slate-50/50">
                            <Button onClick={() => setSelectedLog(null)} className="w-full h-12 rounded-2xl bg-slate-900 text-white font-black">
                                {t('common.close') || 'Dismiss Intelligence'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatsCard({ title, value, icon: Icon, color }: any) {
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

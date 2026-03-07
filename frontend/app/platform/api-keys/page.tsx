'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Key, Plus, Trash2, Copy, AlertCircle, ShieldCheck, TrendingUp,
    BarChart, Activity, Globe, X, Loader2
} from 'lucide-react';
import {
    BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import apiClient from '@/lib/api';
import { DataTable, StatusBadge, SkeletonTable, ErrorState } from '@/components/ui-harden';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ApiKeysPage() {
    const { t, language } = useLanguage();
    const isRtl = language === 'ar';
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newKeyData, setNewKeyData] = useState({ name: '', tenantId: '' as string | undefined });
    const [revealedKey, setRevealedKey] = useState<string | null>(null);
    const [selectedKey, setSelectedKey] = useState<any>(null);
    const [isMetricsOpen, setIsMetricsOpen] = useState(false);

    const { data: keys, isLoading, error } = useQuery({
        queryKey: ['platform-api-keys'],
        queryFn: async () => {
            const res = await apiClient.get('/api/platform/api-keys');
            return res.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            return apiClient.post('/api/platform/api-keys', data);
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['platform-api-keys'] });
            setRevealedKey(res.data.rawKey);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return apiClient.delete(`/api/platform/api-keys/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-api-keys'] });
        },
    });

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add a toast here
    };

    if (isLoading) return <div className="p-8"><SkeletonTable /></div>;
    if (error) return <div className="p-8"><ErrorState message={(error as any).message} /></div>;

    const columns = [
        {
            header: t('platform.api_keys.name'),
            render: (key: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{key.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{key.id}</span>
                </div>
            )
        },
        {
            header: t('platform.api_keys.owner'),
            render: (key: any) => (
                <span className="text-sm text-slate-600">
                    {key.tenant?.name || t('platform.title')}
                </span>
            )
        },
        {
            header: t('platform.api_keys.last_used'),
            render: (key: any) => (
                <span className="text-xs text-slate-400 italic">
                    {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : t('common.no_data')}
                </span>
            )
        },
        {
            header: t('common.actions'),
            align: (isRtl ? 'left' : 'right') as 'left' | 'right',
            render: (key: any) => (
                <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'} gap-2`}>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setSelectedKey(key); setIsMetricsOpen(true); }}
                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        <TrendingUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(key.id)} className="text-slate-400 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex justify-between items-end flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
                        {t('platform.api_keys.title')}
                    </h1>
                    <p className="text-slate-500 mt-1">{t('platform.api_keys.subtitle')}</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={(open) => {
                    setIsCreateOpen(open);
                    if (!open) {
                        setRevealedKey(null);
                        setNewKeyData({ name: '', tenantId: undefined });
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 gap-2 font-bold transition-all hover:scale-105 active:scale-95">
                            <Plus className="h-4 w-4" />
                            {t('platform.api_keys.generate')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl border-none shadow-2xl p-8 max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
                                <ShieldCheck className={`h-8 w-8 text-emerald-500 ${isRtl ? 'ml-3' : ''}`} />
                                {revealedKey ? t('platform.api_keys.generated_title') : t('platform.api_keys.new_key')}
                            </DialogTitle>
                        </DialogHeader>

                        {!revealedKey ? (
                            <div className={`space-y-6 pt-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        {t('platform.api_keys.description_label')}
                                    </Label>
                                    <Input
                                        placeholder="e.g. CI/CD Integration"
                                        value={newKeyData.name}
                                        onChange={(e) => setNewKeyData({ ...newKeyData, name: e.target.value })}
                                        className="rounded-xl border-slate-200 focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
                                    <AlertCircle className={`h-4 w-4 text-amber-500 shrink-0 ${isRtl ? 'ml-3' : ''}`} />
                                    {t('platform.api_keys.warning_text')}
                                </p>
                                <Button
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 rounded-2xl text-lg font-bold shadow-lg shadow-emerald-100"
                                    onClick={() => createMutation.mutate(newKeyData)}
                                    disabled={createMutation.isPending || !newKeyData.name}
                                >
                                    {createMutation.isPending ? t('common.loading') : t('platform.api_keys.generate')}
                                </Button>
                            </div>
                        ) : (
                            <div className={`space-y-6 pt-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                        {t('platform.api_keys.raw_label')}
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            readOnly
                                            value={revealedKey}
                                            className="font-mono bg-slate-50 border-emerald-100 focus-visible:ring-emerald-500 text-center text-lg py-6"
                                        />
                                        <Button size="icon" variant="outline" onClick={() => copyToClipboard(revealedKey)} className="h-auto px-4 rounded-xl">
                                            <Copy className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                                    <p className="text-xs text-red-700 font-bold">
                                        {t('platform.api_keys.security_warning')}
                                    </p>
                                </div>
                                <Button
                                    className="w-full bg-slate-900 hover:bg-black py-6 rounded-2xl font-bold text-white shadow-xl"
                                    onClick={() => setIsCreateOpen(false)}
                                >
                                    {t('platform.api_keys.save_confirmation')}
                                </Button>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            <DataTable
                columns={columns}
                data={keys}
                emptyTitle={t('platform.api_keys.no_keys')}
                emptyDescription={t('platform.api_keys.empty_description')}
            />

            {/* Metrics Modal */}
            <MetricsModal
                isOpen={isMetricsOpen}
                onClose={() => { setIsMetricsOpen(false); setSelectedKey(null); }}
                apiKey={selectedKey}
            />
        </div>
    );
}

function MetricsModal({ isOpen, onClose, apiKey }: { isOpen: boolean; onClose: () => void; apiKey: any }) {
    const { t } = useLanguage();
    const { data: metrics, isLoading } = useQuery({
        queryKey: ['api-key-metrics', apiKey?.id],
        queryFn: async () => {
            const res = await apiClient.get(`/api/platform/api-keys/${apiKey.id}/metrics`);
            return res.data;
        },
        enabled: !!apiKey?.id && isOpen,
    });

    if (!isOpen) return null;

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-100">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 rounded-2xl">
                            <Activity className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{apiKey?.name} <span className="text-slate-400 font-medium ml-2 text-base uppercase tracking-widest">{t('platform.api_keys.telemetry')}</span></h2>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">{apiKey?.id}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-2xl hover:bg-slate-200">
                        <X className="h-6 w-6 text-slate-500" />
                    </Button>
                </div>

                <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)] space-y-8">
                    {isLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <Loader2 className="h-10 w-10 text-indigo-200 animate-spin" />
                        </div>
                    ) : metrics ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <MetricSummaryCard title="Total Requests (7d)" value={metrics.volume.reduce((a: any, b: any) => a + b.requests, 0).toLocaleString()} icon={TrendingUp} color="indigo" />
                                <MetricSummaryCard title="Peak Volume" value={Math.max(...metrics.volume.map((v: any) => v.requests)).toLocaleString()} icon={Activity} color="emerald" />
                                <MetricSummaryCard title="Avg Error Rate" value={`${(metrics.volume.reduce((a: any, b: any) => a + b.errors, 0) / metrics.volume.reduce((a: any, b: any) => a + b.requests, 0) * 100).toFixed(2)}%`} icon={AlertCircle} color="rose" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Request Volume (last 7 days)</h4>
                                    <div className="h-64 w-full bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ReBarChart data={metrics.volume}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis dataKey="date" hide />
                                                <YAxis hide />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                                />
                                                <Bar dataKey="requests" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                            </ReBarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Method Distribution</h4>
                                    <div className="h-64 w-full bg-slate-50 rounded-[2rem] p-6 border border-slate-100 flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={metrics.distribution}
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {metrics.distribution.map((entry: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="flex flex-col gap-2 ml-4">
                                            {metrics.distribution.map((d: any, i: number) => (
                                                <div key={d.name} className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                                    <span className="text-[10px] font-black text-slate-500 uppercase">{d.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Response Breakdown</h4>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {metrics.statusCodes.map((s: any) => (
                                        <div key={s.code} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
                                            <div className={`text-sm font-black mb-1 ${s.code.startsWith('2') ? 'text-emerald-600' : s.code.startsWith('4') ? 'text-amber-600' : 'text-rose-600'}`}>{s.code}</div>
                                            <div className="text-lg font-bold text-slate-900">{s.count}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest">
                            No telemetry data available for this identity
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MetricSummaryCard({ title, value, icon: Icon, color }: any) {
    const colors: any = {
        indigo: 'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        rose: 'bg-rose-50 text-rose-600',
    };
    return (
        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center mb-4`}>
                <Icon className="h-5 w-5" />
            </div>
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h5>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
        </div>
    );
}

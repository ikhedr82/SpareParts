'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, Database, Cpu, HardDrive, RefreshCw, Zap } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import apiClient from '@/lib/api';
import { StatusBadge, SkeletonTable, ErrorState } from '@/components/ui-harden';
import { Button } from '@/components/ui/button';

export default function HealthPage() {
    const { t, language } = useLanguage();
    const isRtl = language === 'ar';

    const { data: health, isLoading, error, refetch } = useQuery({
        queryKey: ['platform-health'],
        queryFn: async () => {
            const res = await apiClient.get('/api/platform/health');
            return res.data;
        },
        refetchInterval: 30000, // Refresh every 30s
    });

    if (isLoading) return <div className="p-8"><SkeletonTable rows={3} /></div>;
    if (error) return <div className="p-8"><ErrorState message={(error as any).message} onRetry={() => refetch()} /></div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex justify-between items-end flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
                        {t('platform.health.title')}
                    </h1>
                    <p className="text-slate-500 mt-1">{t('platform.health.subtitle')}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2 transition-all hover:bg-slate-50">
                    <RefreshCw className="h-4 w-4" />
                    {t('platform.health.refresh')}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Database Health */}
                <div className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <Database className="h-5 w-5 text-indigo-600" />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
                            {t('platform.health.database')}
                        </h2>
                    </div>
                    <div className="flex justify-between items-center py-4 border-y border-slate-50">
                        <span className="text-sm text-slate-600 font-bold uppercase tracking-tighter">{t('platform.health.status')}</span>
                        <StatusBadge status={health.database.status.toUpperCase() === 'HEALTHY' ? 'ACTIVE' : 'INACTIVE'} />
                    </div>
                    <p className="text-xs text-slate-400 font-mono italic">{health.database.message}</p>
                </div>

                {/* Cache Health */}
                <div className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 rounded-lg">
                            <Zap className="h-5 w-5 text-amber-600" />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
                            {t('platform.health.cache') || 'Redis / Cache Service'}
                        </h2>
                    </div>
                    <div className="flex justify-between items-center py-4 border-y border-slate-50">
                        <span className="text-sm text-slate-600 font-bold uppercase tracking-tighter">{t('platform.health.status')}</span>
                        <div className="flex items-center gap-3">
                            {health.cache?.latency && <span className="text-[10px] font-black text-amber-500 uppercase">{health.cache.latency}</span>}
                            <StatusBadge status={health.cache?.status.toUpperCase() === 'HEALTHY' ? 'ACTIVE' : 'INACTIVE'} />
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 font-mono italic">{health.cache?.message || 'Standard In-Memory Proxy'}</p>
                </div>

                {/* System Metrics */}
                <div className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <Activity className="h-5 w-5 text-emerald-600" />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
                            {t('platform.health.system')}
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
                                {t('platform.health.cpu')}
                            </span>
                            <div className="flex items-center gap-2">
                                <Cpu className="h-4 w-4 text-slate-300" />
                                <span className="text-lg font-bold text-slate-700 font-mono">{health.system.cpu}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
                                {t('platform.health.memory')}
                            </span>
                            <div className="flex items-center gap-2">
                                <HardDrive className="h-4 w-4 text-slate-300" />
                                <span className="text-lg font-bold text-slate-700 font-mono">
                                    {health.system.freeMemory} / {health.system.totalMemory}
                                </span>
                            </div>
                        </div>
                        <div className="col-span-2 space-y-1 pt-2 border-t border-slate-50">
                            <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
                                {t('platform.health.uptime')}
                            </span>
                            <div className="text-lg font-bold text-slate-700 font-mono">{health.system.uptime}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Last Updated */}
            <div className="text-center pt-8">
                <span className="bg-slate-50 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100">
                    {t('platform.health.last_check')}: {new Date(health.timestamp).toLocaleString()}
                </span>
            </div>
        </div>
    );
}

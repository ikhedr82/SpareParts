'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Plus, Trash2, Save, Key, Type } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import apiClient from '@/lib/api';
import { DataTable, SkeletonTable, ErrorState } from '@/components/ui-harden';
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

export default function SettingsPage() {
    const { t, language } = useLanguage();
    const isRtl = language === 'ar';
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newConfig, setNewConfig] = useState({ key: '', value: '', description: '', type: 'STRING' });

    const { data: configs, isLoading, error } = useQuery({
        queryKey: ['platform-system-configs'],
        queryFn: async () => {
            const res = await apiClient.get('/api/platform/config');
            return res.data;
        },
    });

    const setMutation = useMutation({
        mutationFn: async (data: any) => {
            return apiClient.post('/api/platform/config', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-system-configs'] });
            setIsCreateOpen(false);
            setNewConfig({ key: '', value: '', description: '', type: 'STRING' });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (key: string) => {
            return apiClient.delete(`/api/platform/config/${key}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-system-configs'] });
        },
    });

    if (isLoading) return <div className="p-8"><SkeletonTable /></div>;
    if (error) return <div className="p-8"><ErrorState message={(error as any).message} /></div>;

    const columns = [
        {
            header: t('platform.settings.key'),
            render: (cfg: any) => (
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-100 rounded text-slate-500">
                        <Key className="h-3 w-3" />
                    </div>
                    <span className="font-bold text-slate-900 font-mono">{cfg.key}</span>
                </div>
            )
        },
        {
            header: t('platform.settings.value'),
            render: (cfg: any) => (
                <span className="text-sm text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100 font-mono">
                    {cfg.value}
                </span>
            )
        },
        {
            header: t('platform.settings.type'),
            render: (cfg: any) => (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-black uppercase tracking-widest">
                    <Type className="h-3 w-3" />
                    {cfg.type}
                </div>
            )
        },
        {
            header: t('common.actions'),
            align: (isRtl ? 'left' : 'right') as 'left' | 'right',
            render: (cfg: any) => (
                <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'} gap-2`}>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(cfg.key)} className="text-slate-400 hover:text-red-600 transition-colors">
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
                        {t('platform.settings.title')}
                    </h1>
                    <p className="text-slate-500 mt-1">{t('platform.settings.subtitle')}</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-slate-900 hover:bg-black shadow-lg shadow-slate-200 gap-2">
                            <Plus className="h-4 w-4" />
                            {t('platform.settings.add')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl border-none shadow-2xl p-8 max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900">
                                {t('platform.settings.global_title')}
                            </DialogTitle>
                        </DialogHeader>
                        <div className={`space-y-6 pt-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {t('platform.settings.key')}
                                </Label>
                                <Input
                                    placeholder="CONFIG_KEY"
                                    className="font-mono uppercase transition-all focus:ring-2 focus:ring-slate-900"
                                    value={newConfig.key}
                                    onChange={(e) => setNewConfig({ ...newConfig, key: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {t('platform.settings.value')}
                                </Label>
                                <Input
                                    placeholder={t('platform.settings.value') + "..."}
                                    value={newConfig.value}
                                    onChange={(e) => setNewConfig({ ...newConfig, value: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {t('platform.settings.type')}
                                </Label>
                                <Input
                                    placeholder="STRING, NUMBER, JSON..."
                                    value={newConfig.type}
                                    onChange={(e) => setNewConfig({ ...newConfig, type: e.target.value.toUpperCase() })}
                                />
                            </div>
                        </div>
                        <DialogFooter className="pt-8 gap-2">
                            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>{t('common.cancel')}</Button>
                            <Button
                                className="flex-1 bg-slate-900 hover:bg-black py-6 rounded-2xl text-lg font-bold gap-2"
                                onClick={() => setMutation.mutate(newConfig)}
                                disabled={setMutation.isPending || !newConfig.key}
                            >
                                <Save className="h-5 w-5" />
                                {t('platform.settings.save')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <DataTable
                columns={columns}
                data={configs}
                emptyTitle={t('platform.settings.no_configs')}
                emptyDescription={t('platform.settings.empty_description')}
            />
        </div>
    );
}

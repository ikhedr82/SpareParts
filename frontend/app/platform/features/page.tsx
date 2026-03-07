'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Flag, Plus, Trash2, Edit2, CheckCircle2, XCircle } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';

export default function FeaturesPage() {
    const { t, language } = useLanguage();
    const isRtl = language === 'ar';
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newFlag, setNewFlag] = useState({ name: '', description: '', isGlobal: true, isActive: true });

    const { data: flags, isLoading, error } = useQuery({
        queryKey: ['platform-feature-flags'],
        queryFn: async () => {
            const res = await apiClient.get('/api/platform/feature-flags');
            return res.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            return apiClient.post('/api/platform/feature-flags', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-feature-flags'] });
            setIsCreateOpen(false);
            setNewFlag({ name: '', description: '', isGlobal: true, isActive: true });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            return apiClient.patch(`/api/platform/feature-flags/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-feature-flags'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return apiClient.delete(`/api/platform/feature-flags/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-feature-flags'] });
        },
    });

    if (isLoading) return <div className="p-8"><SkeletonTable /></div>;
    if (error) return <div className="p-8"><ErrorState message={(error as any).message} /></div>;

    const columns = [
        {
            header: t('platform.features.name'),
            render: (flag: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900 font-mono">{flag.name}</span>
                    <span className="text-xs text-slate-500">{flag.description}</span>
                </div>
            )
        },
        {
            header: t('platform.features.is_global'),
            render: (flag: any) => (
                <StatusBadge
                    status={flag.isGlobal ? t('platform.features.type_global') : t('platform.features.type_tenant')}
                    className={flag.isGlobal ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}
                />
            )
        },
        {
            header: t('platform.features.active'),
            render: (flag: any) => (
                <Switch
                    checked={flag.isActive}
                    onCheckedChange={(checked: boolean) => updateMutation.mutate({ id: flag.id, data: { isActive: checked } })}
                />
            )
        },
        {
            header: t('common.actions'),
            align: (isRtl ? 'left' : 'right') as 'left' | 'right',
            render: (flag: any) => (
                <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'} gap-2`}>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(flag.id)} className="text-slate-400 hover:text-red-600 transition-colors">
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
                        {t('platform.features.title')}
                    </h1>
                    <p className="text-slate-500 mt-1">{t('platform.features.subtitle')}</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 gap-2">
                            <Plus className="h-4 w-4" />
                            {t('platform.features.create')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl border-none shadow-2xl p-8 max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900">
                                {t('platform.features.create')}
                            </DialogTitle>
                        </DialogHeader>
                        <div className={`space-y-6 pt-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {t('platform.features.name')}
                                </Label>
                                <Input
                                    placeholder="FEATURE_NAME"
                                    className="font-mono"
                                    value={newFlag.name}
                                    onChange={(e) => setNewFlag({ ...newFlag, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {t('common.description')}
                                </Label>
                                <Input
                                    placeholder={t('common.description') + "..."}
                                    value={newFlag.description}
                                    onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <Label className="font-bold text-slate-700">{t('platform.features.is_global')}</Label>
                                <Switch
                                    checked={newFlag.isGlobal}
                                    onCheckedChange={(checked: boolean) => setNewFlag({ ...newFlag, isGlobal: checked })}
                                />
                            </div>
                        </div>
                        <DialogFooter className="pt-8 gap-2">
                            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>{t('common.cancel')}</Button>
                            <Button
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-6 rounded-2xl text-lg font-bold"
                                onClick={() => createMutation.mutate(newFlag)}
                                disabled={createMutation.isPending || !newFlag.name}
                            >
                                {createMutation.isPending ? t('common.loading') : t('common.create')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <DataTable
                columns={columns}
                data={flags}
                emptyTitle={t('platform.features.no_flags')}
                emptyDescription={t('platform.features.empty_description')}
            />
        </div>
    );
}

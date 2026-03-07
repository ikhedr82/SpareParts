'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useToast } from '@/components/toast';
import apiClient from '@/lib/api';
import { Building2, Plus, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Branch {
    id: string;
    name: string;
    address: string;
    phone: string;
}

interface PlanStatus {
    planName: string;
    limits: {
        maxBranches: number;
        maxUsers: number;
        maxProducts: number;
    };
    usage: {
        branches: number;
        users: number;
        products: number;
    };
}

export default function BranchesPage() {
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newBranch, setNewBranch] = useState({ name: '', address: '', phone: '' });

    const { data: branches, isLoading } = useQuery<Branch[]>({
        queryKey: ['branches'],
        queryFn: async () => {
            const { data } = await apiClient.get('/branches');
            return data;
        }
    });

    const { data: planStatus } = useQuery<PlanStatus>({
        queryKey: ['plan-status'],
        queryFn: async () => {
            const { data } = await apiClient.get('/api/tenant/plan');
            return data;
        }
    });

    const createMutation = useMutation({
        mutationFn: async (dto: typeof newBranch) => {
            await apiClient.post('/branches', dto);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branches'] });
            queryClient.invalidateQueries({ queryKey: ['plan-status'] });
            showToast('success', t('common.success'));
            setIsCreateModalOpen(false);
            setNewBranch({ name: '', address: '', phone: '' });
        },
        onError: (err: any) => {
            showToast('error', err.response?.data?.message || t('common.error_occurred'));
        }
    });

    const isLimitReached = planStatus ? planStatus.usage.branches >= planStatus.limits.maxBranches : false;

    return (
        <div className={`p-8 ${isRTL ? 'rtl' : 'ltr'}`}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Building2 className="h-8 w-8 text-indigo-600" />
                        {t('branches.title')}
                    </h1>
                    <p className="text-slate-600 mt-1">{t('branches.subtitle')}</p>
                </div>
                <div className="flex items-center gap-4">
                    {planStatus && (
                        <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                            {t('branches.plan_label')}: <span className="font-bold text-indigo-600">{planStatus.planName}</span>
                            <span className="mx-2">|</span>
                            {t('branches.branch_usage')}: <span className={isLimitReached ? 'text-red-600 font-bold' : 'font-medium'}>
                                {planStatus.usage.branches} / {planStatus.limits.maxBranches === -1 ? '∞' : planStatus.limits.maxBranches}
                            </span>
                        </div>
                    )}
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        disabled={isLimitReached}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                        <Plus className="h-4 w-4" />
                        {t('branches.add')}
                    </button>
                </div>
            </div>

            {isLimitReached && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                        <p className="text-amber-800 font-semibold">{t('branches.limit_reached_title')}</p>
                        <p className="text-amber-700 text-sm">{t('branches.limit_reached_msg')}</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-slate-400">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        {t('common.loading')}
                    </div>
                ) : !branches || branches.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>{t('common.no_data')}</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">{t('branches.name')}</th>
                                <th className="px-6 py-4">{t('branches.address')}</th>
                                <th className="px-6 py-4">{t('branches.phone')}</th>
                                <th className="px-6 py-4 text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {branches.map(branch => (
                                <tr key={branch.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-slate-900">{branch.name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{branch.address}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{branch.phone}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">{t('branches.add')}</h3>
                        <form onSubmit={e => { e.preventDefault(); createMutation.mutate(newBranch); }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('branches.name')}</label>
                                <input
                                    type="text"
                                    required
                                    value={newBranch.name}
                                    onChange={e => setNewBranch(b => ({ ...b, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('branches.address')}</label>
                                <input
                                    type="text"
                                    required
                                    value={newBranch.address}
                                    onChange={e => setNewBranch(b => ({ ...b, address: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('branches.phone')}</label>
                                <input
                                    type="text"
                                    required
                                    value={newBranch.phone}
                                    onChange={e => setNewBranch(b => ({ ...b, phone: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                                >
                                    {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {t('common.save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

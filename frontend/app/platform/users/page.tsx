'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useToast } from '@/components/toast';
import { SkeletonTable, EmptyState } from '@/components/ui-harden';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/pagination';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/formatters';
import { KPICard } from '@/components/kpi-card';
import {
    Users, Search, Shield, Building2,
    Mail, Calendar, Fingerprint, AlertCircle, Plus,
    MoreHorizontal, ShieldAlert, Key, Ban, CheckCircle, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlatformUser {
    id: string;
    email: string;
    status: string;
    isPlatformUser: boolean;
    createdAt: string;
    tenant: { id: string; name: string; subdomain: string } | null;
    userRoles: {
        role: { name: string; scope: string };
        tenant: { name: string } | null;
        branch: { name: string } | null;
    }[];
}

export default function PlatformUsersPage() {
    const { t, language } = useLanguage();
    const isRtl = language === 'ar';
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const { showToast } = useToast();
    const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'suspend' | 'reset_password' | null>(null);
    const [createForm, setCreateForm] = useState({ email: '', password: '', role: 'PLATFORM_ADMIN' });
    const [resetForm, setResetForm] = useState({ password: '' });

    const { data: userData, isLoading, error } = useQuery<{ items: PlatformUser[]; total: number }>({
        queryKey: ['platform-users', page, limit, searchTerm],
        queryFn: async () => {
            const { data } = await apiClient.get('/api/platform/users', {
                params: { page, limit, search: searchTerm }
            });
            return data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (dto: typeof createForm) => {
            await apiClient.post('/api/platform/users', dto);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-users'] });
            showToast('success', 'Platform executive provisioned');
            setModalMode(null);
            setCreateForm({ email: '', password: '', role: 'PLATFORM_ADMIN' });
        },
        onError: (err: any) => {
            showToast('error', err.response?.data?.message || 'Provisioning failed');
        }
    });

    const suspendMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiClient.post(`/api/platform/users/${id}/suspend`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-users'] });
            showToast('success', 'User access suspended');
            setModalMode(null);
        }
    });

    const resetMutation = useMutation({
        mutationFn: async ({ id, password }: { id: string, password?: string }) => {
            await apiClient.post(`/api/platform/users/${id}/reset-password`, { password });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-users'] });
            showToast('success', 'Security credentials reset');
            setModalMode(null);
        }
    });

    const users = userData?.items || [];
    const total = userData?.total || 0;

    const totalUsers = total;
    const platformAdmins = users.filter(u => u.isPlatformUser).length;
    const tenantUsers = users.filter(u => !u.isPlatformUser).length;

    return (
        <div className="p-8" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <Users className={`h-8 w-8 text-indigo-600 ${isRtl ? 'ml-3' : ''}`} />
                    {t('platform.users.title')}
                </h1>
                <p className="text-slate-600 mt-1">{t('platform.users.subtitle')}</p>
            </div>
            <div className="flex justify-end mb-6">
                <Button
                    onClick={() => setModalMode('create')}
                    className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-xl shadow-indigo-100 flex items-center gap-2"
                >
                    <Plus className="h-5 w-5" />
                    Provision Admin
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <KPICard title={t('platform.users.total_users')} value={totalUsers} />
                <KPICard title={t('platform.users.platform_admins')} value={platformAdmins} />
                <KPICard title={t('platform.users.tenant_users')} value={tenantUsers} />
            </div>

            {/* Search */}
            <div className="relative mb-6 max-w-md">
                <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400`} />
                <Input
                    placeholder={t('platform.users.search_placeholder')}
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                    className={`${isRtl ? 'pr-10' : 'pl-10'} rounded-xl h-11`}
                />
            </div>

            {/* Table */}
            <Card className="border-slate-200 shadow-sm overflow-hidden mb-8">
                {isLoading ? (
                    <div className="p-6">
                        <SkeletonTable rows={limit} />
                    </div>
                ) : error ? (
                    <div className="p-12 text-center">
                        <EmptyState
                            icon={AlertCircle}
                            title="Error loading users"
                            description="Please try again or contact support if the problem persists."
                            actionLabel="Retry"
                            onAction={() => queryClient.invalidateQueries({ queryKey: ['platform-users'] })}
                        />
                    </div>
                ) : (
                    <>
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase font-semibold">
                                <tr className={isRtl ? 'text-right' : 'text-left'}>
                                    <th className="px-6 py-4">{t('platform.users.email')}</th>
                                    <th className="px-6 py-4">{t('platform.users.role')}</th>
                                    <th className="px-6 py-4">{t('platform.users.tenant')}</th>
                                    <th className="px-6 py-4">{t('platform.users.status')}</th>
                                    <th className="px-6 py-4">{t('platform.users.created')}</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12">
                                            <EmptyState
                                                title={t('platform.users.no_users')}
                                                description={searchTerm ? "Try adjusting your search criteria" : "No registered users found in the platform"}
                                            />
                                        </td>
                                    </tr>
                                )}
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:bg-white group-hover:border-indigo-200 transition-all">
                                                    <Mail className="h-5 w-5 text-slate-400 group-hover:text-indigo-600" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 leading-tight">{user.email}</div>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                                                        <Fingerprint className="h-2.5 w-2.5" /> {user.id.slice(0, 8).toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1.5 max-w-xs">
                                                {user.isPlatformUser && (
                                                    <Badge className="bg-indigo-600 border-none rounded-lg text-[10px] font-black tracking-tight px-2 py-0.5 shadow-sm text-white">
                                                        <Shield className={`h-2.5 w-2.5 ${isRtl ? 'ml-1' : 'mr-1'}`} /> {t('platform.users.platform_label')}
                                                    </Badge>
                                                )}
                                                {user.userRoles.map((ur, idx) => (
                                                    <Badge key={idx} variant="secondary" className="rounded-lg text-[10px] font-bold px-2 py-0.5 border-slate-200">
                                                        {ur.role.name} {ur.branch ? `@ ${ur.branch.name}` : ''}
                                                    </Badge>
                                                ))}
                                                {user.userRoles.length === 0 && !user.isPlatformUser && (
                                                    <span className="text-xs text-slate-400 italic">{t('platform.users.no_roles')}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.tenant ? (
                                                <div className="flex items-center gap-2 group/tenant">
                                                    <div className="p-1.5 bg-slate-50 rounded-lg group-hover/tenant:bg-indigo-50 transition-colors">
                                                        <Building2 className="h-4 w-4 text-slate-400 group-hover/tenant:text-indigo-500" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-700">{user.tenant.name}</div>
                                                        <div className="text-[10px] text-slate-400 font-mono">{user.tenant.subdomain}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-400">GLOBAL</Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={user.status === 'ACTIVE' ? 'success' : 'destructive'} className="rounded-lg px-2.5 py-1 text-[10px] font-black tracking-wider uppercase shadow-sm border-none">
                                                {user.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 font-medium whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-slate-300" />
                                                {formatDate(user.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="relative group/user-actions">
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-slate-100">
                                                    <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                                </Button>
                                                <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} top-full mt-1 z-20 bg-white border border-slate-100 rounded-xl shadow-2xl py-2 w-48 hidden group-focus-within/user-actions:block hover:block`}>
                                                    <button
                                                        onClick={() => { setSelectedUser(user); setModalMode('reset_password'); }}
                                                        className="w-full text-start px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                                                    >
                                                        <Key className="h-4 w-4 text-amber-500" /> {t('platform.users.reset_password') || 'Reset Creds'}
                                                    </button>
                                                    <div className="border-t border-slate-50 my-1" />
                                                    <button
                                                        onClick={() => { setSelectedUser(user); setModalMode('suspend'); }}
                                                        className="w-full text-start px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-3"
                                                    >
                                                        <Ban className="h-4 w-4" /> {t('common.suspend') || 'Suspend Node'}
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <Pagination
                            total={total}
                            page={page}
                            limit={limit}
                            onPageChange={setPage}
                            onLimitChange={(l) => { setLimit(l); setPage(1); }}
                        />
                    </>
                )}
            </Card>

            {/* ===== PROVISION ADMIN MODAL ===== */}
            {
                modalMode === 'create' && (
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                        <Card className="max-w-md w-full p-10 shadow-2xl border-none rounded-[2.5rem]">
                            <div className="flex items-center gap-5 mb-8">
                                <div className="p-4 bg-indigo-50 rounded-2xl">
                                    <Plus className="h-8 w-8 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Provision Admin</h3>
                                    <p className="text-slate-400 font-bold text-sm uppercase tracking-tighter">New Ecosystem Executive</p>
                                </div>
                            </div>
                            <form onSubmit={e => { e.preventDefault(); createMutation.mutate(createForm); }} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Vector</label>
                                    <Input required type="email" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} className="rounded-2xl h-12 border-slate-200 font-semibold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Access Key (Password)</label>
                                    <Input required type="password" minLength={8} value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} className="rounded-2xl h-12 border-slate-200 font-semibold" />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setModalMode(null)} className="flex-1 h-14 rounded-2xl border-slate-200 font-black uppercase tracking-widest">{t('common.cancel')}</Button>
                                    <Button type="submit" disabled={createMutation.isPending} className="flex-1 h-14 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest shadow-2xl shadow-indigo-100 transition-all active:scale-95">
                                        {createMutation.isPending ? t('common.loading') : 'Provision Node'}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )
            }

            {/* ===== SUSPEND MODAL ===== */}
            {
                modalMode === 'suspend' && selectedUser && (
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                        <Card className="max-w-md w-full p-10 shadow-2xl border-none rounded-[2.5rem]">
                            <div className="flex items-center gap-5 mb-8 text-rose-600">
                                <div className="p-4 bg-rose-50 rounded-2xl">
                                    <ShieldAlert className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight">Access Suspension</h3>
                                    <p className="text-rose-400 font-bold text-sm uppercase tracking-tighter">{selectedUser.email}</p>
                                </div>
                            </div>
                            <p className="text-slate-600 text-sm font-medium mb-8 leading-relaxed">
                                Terminate current sessions and block all resource access for this identity within the ecosystem.
                            </p>
                            <div className="flex gap-4">
                                <Button variant="outline" onClick={() => setModalMode(null)} className="flex-1 h-14 rounded-2xl border-slate-200 font-black uppercase tracking-widest">{t('common.cancel')}</Button>
                                <button
                                    onClick={() => suspendMutation.mutate(selectedUser.id)}
                                    disabled={suspendMutation.isPending}
                                    className="flex-1 h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest shadow-2xl shadow-rose-100 transition-all flex items-center justify-center gap-2"
                                >
                                    {suspendMutation.isPending && <Loader2 className="h-5 w-5 animate-spin" />}
                                    Confirm Suspension
                                </button>
                            </div>
                        </Card>
                    </div>
                )
            }

            {/* ===== RESET PASSWORD MODAL ===== */}
            {
                modalMode === 'reset_password' && selectedUser && (
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                        <Card className="max-w-md w-full p-10 shadow-2xl border-none rounded-[2.5rem]">
                            <div className="flex items-center gap-5 mb-8">
                                <div className="p-4 bg-amber-50 rounded-2xl">
                                    <Key className="h-8 w-8 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Reset Credentials</h3>
                                    <p className="text-slate-400 font-bold text-sm uppercase tracking-tighter">{selectedUser.email}</p>
                                </div>
                            </div>
                            <form onSubmit={e => { e.preventDefault(); resetMutation.mutate({ id: selectedUser.id, password: resetForm.password }); }} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">New Access Key (Optional)</label>
                                    <Input type="password" placeholder="Leave empty for emergency default" value={resetForm.password} onChange={e => setResetForm(f => ({ ...f, password: e.target.value }))} className="rounded-2xl h-12 border-slate-200 font-semibold" />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setModalMode(null)} className="flex-1 h-14 rounded-2xl border-slate-200 font-black uppercase tracking-widest">{t('common.cancel')}</Button>
                                    <Button type="submit" disabled={resetMutation.isPending} className="flex-1 h-14 rounded-2xl bg-amber-600 text-white font-black uppercase tracking-widest shadow-2xl shadow-amber-100 transition-all active:scale-95">
                                        {resetMutation.isPending ? t('common.loading') : 'Reset Key'}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )
            }
        </div >
    );
}

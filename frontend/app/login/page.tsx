'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { setToken } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ShieldCheck, User, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const { t, dir } = useLanguage();
    const isRtl = dir === 'rtl';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await apiClient.post('/auth/login', { email, password });
            const { accessToken } = response.data;

            setToken(accessToken);
            router.push('/platform');
        } catch (err: any) {
            setError(err.response?.data?.message || t('auth.login.error_invalid'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden font-sans" dir={dir}>
            {/* Morphing Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse delay-700" />

            <div className="w-full max-w-[480px] p-4 relative z-10 animate-in fade-in zoom-in duration-700">
                <Card className="bg-white/95 backdrop-blur-xl border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="pt-12 pb-8 px-10 text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="p-4 bg-slate-50 rounded-3xl shadow-inner border border-slate-100">
                                <img src="/brand/logo.svg" alt="Partivo" className="h-12 w-auto" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                            {t('auth.login.title')}
                        </CardTitle>
                        <CardDescription className="text-slate-500 font-medium text-lg mt-2 tracking-tight">
                            {t('auth.login.subtitle')}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-10 pb-10">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400" required>
                                    {t('auth.login.email_label')}
                                </Label>
                                <div className="relative group">
                                    <User className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors`} />
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className={`${isRtl ? 'pr-12' : 'pl-12'} h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-semibold`}
                                        placeholder="you@corporate.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400" required>
                                    {t('auth.login.password_label')}
                                </Label>
                                <div className="relative group">
                                    <Lock className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors`} />
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className={`${isRtl ? 'pr-12' : 'pl-12'} h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-semibold`}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest shadow-2xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-70 group"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        {t('auth.login.sign_in')}
                                        <ShieldCheck className={`h-5 w-5 ${isRtl ? 'mr-3 rotate-180' : 'ml-3'} group-hover:scale-110 transition-transform`} />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="px-10 pb-10 pt-0 flex flex-col gap-6">
                        <div className="w-full border-t border-slate-100 pt-6">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span>{t('auth.login.demo_hint')}</span>
                                <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg">Admin Node</span>
                            </div>
                            <div className="mt-3 flex gap-2">
                                <div className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-mono text-slate-600 truncate">
                                    platform@admin.com
                                </div>
                                <div className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-mono text-slate-600 truncate">
                                    admin123
                                </div>
                            </div>
                        </div>
                    </CardFooter>
                </Card>
                <p className="text-center mt-8 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    &copy; 2026 Partivo Ecosystem &bull; All Units Secure
                </p>
            </div>
        </div>
    );
}

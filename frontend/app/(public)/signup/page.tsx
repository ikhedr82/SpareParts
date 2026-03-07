'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Loader2, Check, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function SignupPage() {
    const { t } = useLanguage();
    const [form, setForm] = useState({
        companyName: '',
        adminName: '',
        adminEmail: '',
        password: '',
        subdomain: '',
        preferredLanguage: 'EN',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState<{ tenantUrl: string; adminEmail: string } | null>(null);
    const [subdomainStatus, setSubdomainStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        if (name === 'subdomain' && value.length >= 3) {
            checkSubdomain(value);
        }
    };

    const checkSubdomain = async (subdomain: string) => {
        setSubdomainStatus('checking');
        try {
            const res = await fetch(`${API_URL}/onboarding/check-subdomain?subdomain=${subdomain}`);
            const data = await res.json();
            setSubdomainStatus(data.available ? 'available' : 'taken');
        } catch {
            setSubdomainStatus('idle');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/onboarding/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            setSuccess({ tenantUrl: data.tenantUrl, adminEmail: data.adminEmail });
        } catch (err: any) {
            setError(err.message || t('common.error_occurred'));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <section className="min-h-[70vh] flex items-center justify-center py-24">
                <div className="max-w-lg w-full mx-auto px-6">
                    <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-10 text-center backdrop-blur-sm">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Check className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">{t('landing.signup.success_title')}</h2>
                        <p className="text-gray-400 mb-6">{t('landing.signup.success_desc')}</p>
                        <div className="bg-black/20 rounded-xl p-4 mb-6 space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">{t('common.email')}:</span><span className="font-mono">{success.adminEmail}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">URL:</span><span className="font-mono text-blue-400">{success.tenantUrl}</span></div>
                        </div>
                        <Link href="/login" className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl font-semibold hover:from-blue-500 hover:to-cyan-400 transition-all">
                            {t('landing.signup.go_login')}
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-[70vh] flex items-center justify-center py-24">
            <div className="max-w-lg w-full mx-auto px-6">
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        {t('landing.signup.title')}
                    </h1>
                    <p className="text-gray-400">{t('landing.signup.subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-5 backdrop-blur-sm">
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">{t('landing.signup.company_name')}</label>
                        <input name="companyName" value={form.companyName} onChange={handleChange} required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            placeholder="Acme Auto Parts"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">{t('landing.signup.admin_name')}</label>
                        <input name="adminName" value={form.adminName} onChange={handleChange} required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            placeholder="Ahmed Al-Rashid"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">{t('landing.signup.email')}</label>
                        <input name="adminEmail" type="email" value={form.adminEmail} onChange={handleChange} required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            placeholder="admin@acme.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">{t('landing.signup.password')}</label>
                        <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={8}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">{t('landing.signup.subdomain')}</label>
                        <div className="flex items-center">
                            <input name="subdomain" value={form.subdomain} onChange={handleChange} required minLength={3} maxLength={63}
                                pattern="[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?"
                                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-s-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                placeholder="acme"
                            />
                            <span className="px-4 py-3 bg-white/10 border border-white/10 border-s-0 rounded-e-xl text-gray-500 text-sm whitespace-nowrap">
                                .partivo.net
                            </span>
                        </div>
                        {subdomainStatus === 'available' && (
                            <p className="mt-1 text-xs text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> {t('landing.signup.subdomain_available')}</p>
                        )}
                        {subdomainStatus === 'taken' && (
                            <p className="mt-1 text-xs text-red-400">{t('landing.signup.subdomain_taken')}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">{t('landing.signup.language')}</label>
                        <select name="preferredLanguage" value={form.preferredLanguage} onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        >
                            <option value="EN" className="bg-slate-900">English</option>
                            <option value="AR" className="bg-slate-900">العربية</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || subdomainStatus === 'taken'}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl text-lg font-bold hover:from-blue-500 hover:to-cyan-400 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                        {loading ? t('common.loading') : t('landing.signup.submit')}
                    </button>

                    <p className="text-center text-sm text-gray-500">
                        {t('landing.signup.have_account')} <Link href="/login" className="text-blue-400 hover:text-blue-300">{t('landing.nav.login')}</Link>
                    </p>
                </form>
            </div>
        </section>
    );
}

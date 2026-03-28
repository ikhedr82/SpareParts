'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { LayoutDashboard, CreditCard, Zap, CheckCircle, AlertTriangle, ArrowUpCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function TenantBillingPage() {
    const { t } = useLanguage();

    const { data: planStatus, isLoading, refetch } = useQuery({
        queryKey: ['plan-status'],
        queryFn: async () => {
            const res = await apiClient.get('/api/billing/plan');
            return res.data;
        }
    });

    const { data: history } = useQuery({
        queryKey: ['billing-history'],
        queryFn: async () => {
            const res = await apiClient.get('/api/billing/invoices');
            return res.data;
        }
    });

    const handleUpgrade = async (planId: string, provider: 'STRIPE' | 'PAYMOB' = 'STRIPE') => {
        try {
            const res = await apiClient.post('/api/billing/checkout', { planId, provider });
            if (res.data.url) {
                window.location.href = res.data.url;
            }
        } catch (error) {
            toast.error('Failed to initiate checkout');
        }
    };

    const handleManageBilling = async () => {
        try {
            const res = await apiClient.get('/api/tenant/billing/portal');
            if (res.data.url) {
                window.location.href = res.data.url;
            }
        } catch (error) {
            toast.error('Failed to open billing portal');
        }
    };

    if (isLoading) return (
        <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-black tracking-widest uppercase animate-pulse">Synchronizing Billing Records...</p>
        </div>
    );

    const { plan, usage, limits, status, subscription } = planStatus || {};

    return (
        <div className="p-12 max-w-7xl mx-auto space-y-12 bg-slate-50/50 min-h-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tightest">Billing & Subscription</h1>
                    <p className="text-slate-500 mt-3 text-xl font-medium">Control your plan, track usage, and manage payments.</p>
                </div>
                {status === 'PAST_DUE' && (
                    <div className="flex items-center gap-3 bg-rose-50 text-rose-700 px-6 py-3 rounded-2xl border-2 border-rose-100 animate-bounce">
                        <AlertTriangle className="w-6 h-6" />
                        <span className="font-black text-sm tracking-widest uppercase">Action Required: Payment Overdue</span>
                    </div>
                )}
                {status === 'GRACE_PERIOD' && (
                    <div className="flex items-center gap-3 bg-amber-50 text-amber-700 px-6 py-3 rounded-2xl border-2 border-amber-100 animate-pulse">
                        <AlertTriangle className="w-6 h-6" />
                        <span className="font-black text-sm tracking-widest uppercase italic">Grace Period Active: Payment Pending</span>
                    </div>
                )}
            </div>

            {/* Active Plan Hero */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900 via-blue-800 to-indigo-950 p-12 text-white shadow-2xl shadow-indigo-300/50">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full -ml-32 -mb-32 blur-3xl" />

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12 text-center lg:text-left">
                    <div className="space-y-6 flex-1">
                        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-2xl px-5 py-2 rounded-full border border-white/20">
                            <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                            <span className="text-sm font-black tracking-widest uppercase">{status || 'ACTIVE'} SUBSCRIPTION</span>
                        </div>
                        <h2 className="text-6xl font-black tracking-tight">{plan?.name}</h2>
                        <p className="text-indigo-100/70 text-xl max-w-xl font-medium leading-relaxed">
                            Empowering your business with {plan?.name} features.
                            {subscription?.currentPeriodEnd && ` Next renewal on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}.`}
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-3xl p-10 rounded-[2rem] border border-white/20 text-center min-w-[280px] shadow-2xl group hover:scale-105 transition-transform duration-500">
                        <div className="text-5xl font-black tracking-tighter">${plan?.price}</div>
                        <div className="text-indigo-200/60 text-sm mt-2 uppercase font-black tracking-widest">Monthly Commitment</div>
                        <button
                            onClick={handleManageBilling}
                            className="mt-8 bg-white text-indigo-900 px-10 py-4 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all w-full shadow-xl shadow-indigo-950/20 active:scale-95"
                        >
                            Open Stripe Portal
                        </button>
                    </div>
                </div>
            </div>

            {/* Usage & Billing Details */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-slate-200/80 p-10 shadow-xl shadow-slate-200/50 group">
                    <div className="flex items-center justify-between mb-12">
                        <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                <LayoutDashboard className="w-8 h-8" />
                            </div>
                            Capacity Utilization
                        </h3>
                        <span className="text-slate-400 font-mono text-sm tracking-widest">REAL-TIME DATA</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                        <UsageBar label="User Accounts" current={usage?.users} limit={limits?.maxUsers} />
                        <UsageBar label="Business Branches" current={usage?.branches} limit={limits?.maxBranches} />
                        <UsageBar label="Inventory SKU Catalog" current={usage?.products} limit={limits?.maxProducts} />
                        <UsageBar label="Monthly Sales Throughput" current={usage?.orders || 0} limit={limits?.maxOrders || 1000} />
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-200/80 p-10 shadow-xl shadow-slate-200/50 space-y-10 group">
                    <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                            <CreditCard className="w-8 h-8" />
                        </div>
                        Billing Identity
                    </h3>
                    <div className="space-y-8">
                        <InfoRow label="Subscription ID" value={subscription?.id?.slice(0, 8).toUpperCase() || 'N/A'} />
                        <InfoRow label="Billing Email" value={subscription?.tenant?.billingEmail || 'Primary Account'} />
                        <InfoRow label="Renewal Type" value={subscription?.autoRenew ? 'Automatic' : 'Manual'} />
                        <div className="pt-6 space-y-4">
                            <button
                                onClick={handleManageBilling}
                                className="w-full text-indigo-700 font-black text-sm bg-indigo-50 py-4 rounded-2xl hover:bg-indigo-100 transition-all active:scale-95"
                            >
                                Update Payment Method
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200/80 p-10 shadow-xl shadow-slate-200/50">
                <h3 className="text-2xl font-black text-slate-900 mb-8">Transaction Archive</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-slate-100 text-slate-400 text-xs font-black tracking-widest uppercase">
                                <th className="pb-4 px-4">Date</th>
                                <th className="pb-4 px-4">Transaction ID</th>
                                <th className="pb-4 px-4">Amount</th>
                                <th className="pb-4 px-4">Status</th>
                                <th className="pb-4 px-4 text-right">Invoice</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {history && history.length > 0 ? history.map((inv: any) => (
                                <tr key={inv.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="py-5 px-4 text-sm font-bold text-slate-700">{new Date(inv.createdAt).toLocaleDateString()}</td>
                                    <td className="py-5 px-4 text-sm font-mono text-slate-400">{inv.id.slice(0, 8)}</td>
                                    <td className="py-5 px-4 text-sm font-black text-slate-900">${inv.amount}</td>
                                    <td className="py-5 px-4">
                                        <span className={`text-[10px] font-black px-3 py-1 rounded-lg tracking-widest uppercase ${
                                            inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 
                                            inv.status === 'FAILED' ? 'bg-rose-50 text-rose-600' :
                                            'bg-amber-50 text-amber-600'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="py-5 px-4 text-right">
                                        <a 
                                            href={`${apiClient.defaults.baseURL}/api/billing/invoices/${inv.id}/pdf`}
                                            target="_blank"
                                            className="text-indigo-600 font-black text-xs hover:underline decoration-2 underline-offset-4 tracking-tight"
                                        >
                                            DOCUMENT.PDF
                                        </a>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-400 font-medium italic">No recorded transactions in this cycle.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Upgrade Section */}
            <div className="pt-20">
                <div className="text-center mb-16 space-y-4">
                    <h3 className="text-5xl font-black text-slate-900 tracking-tightest leading-tight">Scale Without Boundaries</h3>
                    <p className="text-slate-500 text-xl font-medium">Choose a powerhouse plan that fits your growth trajectory.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <PricingCard
                        name="Basic" price="49" recommended={false} active={plan?.name === 'BASIC'}
                        onSelect={() => handleUpgrade('price_basic_id')}
                        features={["2 Users", "1 Branch", "500 Products", "Standard Support"]}
                    />
                    <PricingCard
                        name="Professional" price="149" recommended={true} active={plan?.name === 'PRO'}
                        onSelect={() => handleUpgrade('price_pro_id')}
                        features={["10 Users", "5 Branches", "5000 Products", "Advanced Reports", "Priority Support"]}
                    />
                    <PricingCard
                        name="Enterprise" price="499" recommended={false} active={plan?.name === 'ENTERPRISE'}
                        onSelect={() => handleUpgrade('price_enterprise_id')}
                        features={["Unlimited Users", "Unlimited Branches", "Unlimited Products", "Logistics Suite", "Dedicated Manager"]}
                    />
                </div>
            </div>
        </div>
    );
}

function UsageBar({ label, current, limit }: any) {
    const percent = limit > 0 ? Math.min(100, (current / limit) * 100) : 0;
    const isWarning = percent >= 80 && percent < 100;
    const isCritical = percent >= 100;

    return (
        <div className="space-y-3 group">
            <div className="flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600 transition-colors uppercase tracking-widest text-[10px]">{label}</span>
                <span className={`text-xs font-mono font-black ${isCritical ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-slate-400'}`}>
                    {current} / {limit > 0 ? limit : '∞'}
                </span>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50 p-1">
                <div
                    className={`h-full transition-all duration-1000 ease-out rounded-full shadow-sm ${isCritical ? 'bg-gradient-to-r from-red-500 to-rose-600' :
                        isWarning ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                            'bg-gradient-to-r from-blue-500 to-indigo-600'
                        }`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}

function InfoRow({ label, value }: any) {
    return (
        <div className="flex justify-between border-b border-slate-50 pb-4 last:border-0 group">
            <span className="text-slate-400 text-sm font-black uppercase tracking-widest text-[10px] group-hover:text-indigo-600 transition-colors">{label}</span>
            <span className="text-slate-900 text-sm font-bold">{value}</span>
        </div>
    );
}

function PricingCard({ name, price, features, recommended, active, onSelect }: any) {
    return (
        <div className={`relative flex flex-col p-10 rounded-[2.5rem] border-2 transition-all duration-500 hover:scale-[1.02] ${active ? 'border-indigo-600 bg-white ring-8 ring-indigo-50 shadow-2xl' :
            recommended ? 'border-indigo-200 bg-white shadow-xl hover:border-indigo-400' :
                'border-slate-100 bg-slate-50 hover:bg-white hover:shadow-lg'
            }`}>
            {recommended && !active && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase shadow-indigo-200 shadow-2xl border-4 border-white">
                    Gold Standard
                </div>
            )}
            <div className="mb-10 text-center lg:text-left">
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">{name}</h4>
                <div className="flex items-baseline justify-center lg:justify-start gap-2 mt-6">
                    <span className="text-5xl font-black text-slate-900 tracking-tighter">${price}</span>
                    <span className="text-slate-400 font-black text-sm italic tracking-widest uppercase">/ Month</span>
                </div>
            </div>
            <ul className="flex-1 space-y-5 mb-12">
                {features.map((f: string) => (
                    <li key={f} className="flex items-start gap-4 group">
                        <CheckCircle className={`w-6 h-6 shrink-0 transition-all ${active ? 'text-indigo-600 scale-110' : 'text-emerald-500 group-hover:text-indigo-600'}`} />
                        <span className="text-base text-slate-600 leading-tight font-bold">{f}</span>
                    </li>
                ))}
            </ul>
            <button
                disabled={active}
                onClick={onSelect}
                className={`w-full py-5 rounded-[1.5rem] font-black text-sm transition-all flex items-center justify-center gap-3 ${active ? 'bg-slate-100 text-slate-400 cursor-default uppercase tracking-widest' :
                    recommended ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 hover:shadow-indigo-200 active:scale-95' :
                        'bg-white border-2 border-slate-200 text-slate-900 hover:border-slate-300 active:scale-95 hover:bg-slate-50 shadow-sm'
                    }`}
            >
                {active ? 'Current Domain' : (
                    <>
                        Select {name} Expansion
                        <ArrowUpCircle className="w-5 h-5 shadow-sm" />
                    </>
                )}
            </button>
        </div>
    );
}

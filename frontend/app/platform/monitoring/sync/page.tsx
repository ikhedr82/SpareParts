'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/api';

export default function SyncHealthScreen() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/api/platform/sync-health');
            setStats(res.data);
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !stats) return <div className="p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
    if (error) return <div className="p-8 text-red-600 bg-red-50 rounded-lg">{error}</div>;

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Offline Sync Heath</h1>
                    <p className="text-slate-500 text-sm mt-1">Real-time status of mobile sync queues across all tenants</p>
                </div>
                <button 
                    onClick={fetchMetrics} 
                    className="px-4 py-2 bg-white text-indigo-600 border border-slate-200 shadow-sm rounded-md font-medium text-sm hover:bg-slate-50 transition"
                >
                    Refresh Data
                </button>
            </div>

            {/* Top Level KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Global Pending Queue</p>
                        <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats?.totalPending}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Failed Events</p>
                        <h3 className="text-3xl font-bold text-red-600 mt-1">{stats?.totalFailed}</h3>
                    </div>
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Active Offline Devices</p>
                        <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats?.activeDevices}</h3>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                    </div>
                </div>
            </div>

            {/* Tenant Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                    <h2 className="text-lg font-semibold text-slate-800">Tenant Sync Breakdown</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 font-medium">Tenant Name</th>
                                <th scope="col" className="px-6 py-3 font-medium">Devices Syncing</th>
                                <th scope="col" className="px-6 py-3 font-medium">Pending Queue</th>
                                <th scope="col" className="px-6 py-3 font-medium">Failed Events</th>
                                <th scope="col" className="px-6 py-3 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {stats?.tenantBreakdown?.map((tenant: any) => (
                                <tr key={tenant.tenantId} className="hover:bg-slate-50/50 transition">
                                    <td className="px-6 py-4 font-medium text-slate-900">{tenant.name}</td>
                                    <td className="px-6 py-4">{tenant.devices}</td>
                                    <td className="px-6 py-4 text-blue-600 font-medium">{tenant.pending}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tenant.failed > 0 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                            {tenant.failed > 0 ? tenant.failed : 'Zero'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-indigo-600 hover:text-indigo-900 font-medium text-sm">Force Flush</button>
                                    </td>
                                </tr>
                            ))}
                            {(!stats?.tenantBreakdown || stats.tenantBreakdown.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No active syncing tenants found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

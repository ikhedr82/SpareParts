'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Truck, Plus, Search, CheckCircle, Clock, AlertCircle, Loader2, Filter } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { format } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';

interface DeliveryTrip {
    id: string;
    tripNumber?: string;
    mode: 'INTERNAL_FLEET' | 'EXTERNAL_COURIER' | 'CUSTOMER_PICKUP' | 'THIRD_PARTY_DRIVER';
    status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    driverName?: string;
    vehiclePlate?: string;
    stopCount?: number;
    createdAt: string;
}

const STATUS_CLASSES: Record<string, string> = {
    PLANNED: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-700 animate-pulse',
    COMPLETED: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-slate-100 text-slate-600',
};

export default function LogisticsPage() {
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';
    const dateLocale = language === 'ar' ? arSA : enUS;
    const [search, setSearch] = useState('');

    const { data: trips, isLoading, isError } = useQuery<DeliveryTrip[]>({
        queryKey: ['logistics-trips'],
        queryFn: async () => {
            const { data } = await apiClient.get('/logistics/trips');
            return data;
        },
    });

    const statusLabel = (s: string) => {
        const map: Record<string, string> = {
            PLANNED: t('logistics.status_planned'),
            IN_PROGRESS: t('logistics.status_in_progress'),
            COMPLETED: t('logistics.status_completed'),
            FAILED: t('logistics.status_failed'),
            CANCELLED: t('logistics.status_cancelled'),
        };
        return map[s] || s;
    };

    const modeLabel = (m: string) => {
        const map: Record<string, string> = {
            INTERNAL_FLEET: t('logistics.mode_internal'),
            EXTERNAL_COURIER: t('logistics.mode_external'),
            CUSTOMER_PICKUP: t('logistics.mode_pickup'),
            THIRD_PARTY_DRIVER: t('logistics.mode_third_party'),
        };
        return map[m] || m;
    };

    const filtered = trips?.filter(t =>
        !search ||
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        (t.driverName || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={`p-8 ${isRTL ? 'rtl' : 'ltr'}`}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Truck className="h-8 w-8 text-indigo-600" />
                        {t('logistics.title')}
                    </h1>
                    <p className="text-slate-600 mt-1">{t('logistics.subtitle')}</p>
                </div>
                <Link href="/tenant/logistics/new"
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
                    <Plus className="h-4 w-4" /> {t('logistics.new_trip')}
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center gap-4">
                    <div className={`relative flex-1 max-w-md`}>
                        <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400`} />
                        <input type="text" placeholder={t('logistics.search_placeholder')}
                            value={search} onChange={e => setSearch(e.target.value)}
                            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm`} />
                    </div>
                </div>

                {isError ? (
                    <div className="p-12 text-center">
                        <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
                        <p className="text-red-600">{t('common.error')}</p>
                    </div>
                ) : isLoading ? (
                    <div className="p-12 text-center text-slate-400">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        {t('common.loading')}
                    </div>
                ) : !filtered?.length ? (
                    <div className="p-12 text-center text-slate-400">
                        <Truck className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>{t('logistics.no_trips')}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className={`w-full ${isRTL ? 'text-right' : 'text-left'}`}>
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase font-semibold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">{t('logistics.trip_id')}</th>
                                    <th className="px-6 py-4">{t('logistics.mode')}</th>
                                    <th className="px-6 py-4">{t('logistics.driver')}</th>
                                    <th className="px-6 py-4">{t('logistics.stops')}</th>
                                    <th className="px-6 py-4">{t('common.date')}</th>
                                    <th className="px-6 py-4">{t('common.status')}</th>
                                    <th className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}>{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map(trip => (
                                    <tr key={trip.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 text-sm">
                                            #{trip.tripNumber || trip.id.slice(0, 8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{modeLabel(trip.mode)}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{trip.driverName || '—'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{trip.stopCount ?? '—'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {format(new Date(trip.createdAt), 'MMM d, yyyy', { locale: dateLocale })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASSES[trip.status] || 'bg-slate-100 text-slate-600'}`}>
                                                {trip.status === 'COMPLETED' && <CheckCircle className="w-3 h-3" />}
                                                {trip.status === 'IN_PROGRESS' && <Clock className="w-3 h-3" />}
                                                {statusLabel(trip.status)}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}>
                                            <Link href={`/tenant/logistics/${trip.id}`}
                                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                                                {t('common.view')}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

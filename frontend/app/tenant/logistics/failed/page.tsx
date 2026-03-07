'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { useState } from 'react';
import { AlertTriangle, RefreshCw, MapPin, Loader2, ArrowLeft, Flag } from 'lucide-react';
import Link from 'next/link';

interface FailedStop {
    id: string;
    tripId: string;
    orderId?: string;
    failureReason?: string;
    completionTime?: string;
    status: string;
    trip: {
        id: string;
        driverId?: string;
        vehicleId?: string;
    };
    order?: {
        id: string;
        orderNumber: string;
        businessClient: { businessName: string };
    };
}

export default function FailedDeliveriesPage() {
    const queryClient = useQueryClient();
    const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
    const [reassignModal, setReassignModal] = useState<FailedStop | null>(null);
    const [toastMessage, setToastMessage] = useState('');

    const { data: failedStops, isLoading } = useQuery<FailedStop[]>({
        queryKey: ['failed-delivery-stops'],
        queryFn: async () => {
            const { data } = await axios.get(
                'http://localhost:3000/api/v1/logistics/trip-stops?status=FAILED',
                { withCredentials: true }
            );
            return data;
        },
    });

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const flagForReturn = (stop: FailedStop) => {
        setFlaggedIds(prev => new Set(prev).add(stop.id));
        showToast(`Stop ${stop.id.substring(0, 8)} flagged for return processing.`);
    };

    return (
        <div className="p-8">
            {/* Toast */}
            {toastMessage && (
                <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2">
                    <Flag className="h-4 w-4 text-yellow-400" />
                    {toastMessage}
                </div>
            )}

            <Link href="/tenant/logistics" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 w-fit text-sm">
                <ArrowLeft className="h-4 w-4" />
                Back to Logistics
            </Link>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                        Failed Deliveries Dashboard
                    </h1>
                    <p className="text-slate-600 mt-1">
                        All delivery stops with FAILED status requiring action
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {!isLoading && (
                        <div className="text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                            {failedStops?.length || 0} failed stops
                        </div>
                    )}
                    <button
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['failed-delivery-stops'] })}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm text-slate-700"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-16 text-slate-500 gap-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading failed deliveries...
                </div>
            ) : failedStops?.length === 0 ? (
                <div className="text-center py-16 bg-green-50 rounded-xl border border-green-200">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-800 mb-1">No Failed Deliveries</h3>
                    <p className="text-sm text-green-600">All delivery stops are on track.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Order</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Trip ID</th>
                                <th className="px-6 py-4">Failure Reason</th>
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {failedStops?.map(stop => (
                                <tr
                                    key={stop.id}
                                    className={`transition-colors ${flaggedIds.has(stop.id) ? 'bg-yellow-50' : 'hover:bg-slate-50'}`}
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">
                                            {stop.order ? (
                                                <Link
                                                    href={`/tenant/orders/${stop.orderId}`}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {stop.order.orderNumber}
                                                </Link>
                                            ) : (
                                                <span className="text-slate-400">No order</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                                            Stop: {stop.id.substring(0, 8)}...
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700">
                                        {stop.order?.businessClient?.businessName || '—'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link
                                            href={`/tenant/logistics/${stop.tripId}`}
                                            className="text-sm text-indigo-600 hover:underline font-mono"
                                        >
                                            {stop.tripId.substring(0, 8)}...
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                                            <span className="text-sm text-slate-600">
                                                {stop.failureReason || 'No reason provided'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {stop.completionTime
                                            ? format(new Date(stop.completionTime), 'MMM d, HH:mm')
                                            : '—'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {flaggedIds.has(stop.id) ? (
                                                <span className="text-xs text-yellow-600 font-medium bg-yellow-100 px-2 py-1 rounded-full flex items-center gap-1">
                                                    <Flag className="h-3 w-3" />
                                                    Flagged
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => flagForReturn(stop)}
                                                    className="text-sm text-amber-600 hover:text-amber-800 font-medium border border-amber-200 rounded-lg px-3 py-1.5 hover:bg-amber-50 flex items-center gap-1.5"
                                                >
                                                    <Flag className="h-3.5 w-3.5" />
                                                    Flag for Return
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

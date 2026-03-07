'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Box, MapPin, Play, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function TripDetailsPage() {
    const params = useParams();
    const id = params.id as string;
    const queryClient = useQueryClient();

    // State for simple actions (Stop Arrive/Complete simulated if needed, mainly for Trip actions)

    const { data: trip, isLoading } = useQuery({
        queryKey: ['trip', id],
        queryFn: async () => {
            const { data } = await axios.get(`http://localhost:3000/logistics/trips/${id}`, { withCredentials: true });
            return data;
        },
    });

    const actionMutation = useMutation({
        mutationFn: async ({ action, payload }: { action: string; payload?: any }) => {
            const res = await axios.post(`http://localhost:3000/logistics/trips/${id}/${action}`, payload || {}, { withCredentials: true });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trip', id] });
        },
    });

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading trip details...</div>;
    if (!trip) return <div className="p-8 text-center text-red-500">Trip not found.</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <Link href="/tenant/logistics" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 w-fit">
                <ArrowLeft className="h-4 w-4" /> Back to Logistics
            </Link>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                        Trip #{trip.id.substring(0, 8)}
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm border border-slate-200 font-medium">
                            {trip.status}
                        </span>
                    </h1>
                    <div className="text-sm text-slate-600">
                        {trip.mode.replace('_', ' ')} · {trip.driver?.name || 'No Driver'} · {trip.vehicle?.licensePlate || 'No Vehicle'}
                    </div>
                </div>

                <div className="flex gap-2">
                    {/* Action Buttons based on Status */}
                    {(trip.status === 'PLANNED' || trip.status === 'LOADING') && (
                        <button
                            onClick={() => actionMutation.mutate({ action: 'start' })}
                            disabled={actionMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Play className="h-4 w-4" /> Start Trip
                        </button>
                    )}
                    {trip.status === 'IN_TRANSIT' && (
                        <>
                            <button
                                onClick={() => actionMutation.mutate({ action: 'complete' })}
                                disabled={actionMutation.isPending}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                <CheckCircle className="h-4 w-4" /> Complete Trip
                            </button>
                            <button
                                onClick={() => actionMutation.mutate({ action: 'fail' })}
                                disabled={actionMutation.isPending}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                <AlertTriangle className="h-4 w-4" /> Fail Trip
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stops */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-slate-400" />
                                Stops ({trip.stops?.length || 0})
                            </h2>
                            <button className="text-sm text-blue-600 hover:underline">+ Add Stop</button>
                        </div>

                        <div className="space-y-4 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
                            {trip.stops?.length === 0 && <div className="text-slate-500 italic pl-12">No stops added.</div>}
                            {trip.stops?.map((stop: any, idx: number) => (
                                <div key={stop.id} className="relative pl-12">
                                    <div className="absolute left-4 top-1.5 w-4 h-4 rounded-full border-2 border-white bg-blue-500 ring-4 ring-blue-50"></div>
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 hover:border-slate-300 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-medium text-slate-900">Stop #{idx + 1}</div>
                                                <div className="text-sm text-slate-600 mt-1">
                                                    {stop.address?.street}, {stop.address?.city}
                                                </div>
                                            </div>
                                            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-medium text-slate-600">
                                                {stop.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Packs/Metrics */}
                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <Box className="h-5 w-5 text-slate-400" />
                                Packs ({trip.packs?.length || 0})
                            </h2>
                            <button className="text-sm text-blue-600 hover:underline">+ Add Pack</button>
                        </div>

                        <div className="space-y-2">
                            {trip.packs?.length === 0 && <div className="text-slate-500 italic text-sm">No packs loaded.</div>}
                            {trip.packs?.map((pack: any) => (
                                <div key={pack.id} className="p-3 bg-slate-50 rounded border border-slate-100 flex justify-between items-center">
                                    <span className="text-sm font-medium">{pack.barcode}</span>
                                    <span className="text-xs text-slate-500">{pack.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

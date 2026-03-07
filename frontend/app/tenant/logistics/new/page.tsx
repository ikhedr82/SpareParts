'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewTripPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [mode, setMode] = useState('INTERNAL_FLEET');
    const [branchId, setBranchId] = useState(''); // Would typically come from user context or selection
    const [driverId, setDriverId] = useState('');
    const [vehicleId, setVehicleId] = useState('');
    const [providerId, setProviderId] = useState('');
    const [error, setError] = useState('');

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await axios.post('http://localhost:3000/logistics/trips', data, { withCredentials: true });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trips'] });
            router.push('/tenant/logistics');
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to create trip');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (mode === 'INTERNAL_FLEET' && (!driverId || !vehicleId)) {
            setError('Driver and Vehicle are required for Internal Fleet trips');
            return;
        }
        if (mode === 'EXTERNAL_COURIER' && !providerId) {
            setError('Fulfillment Provider is required for External Courier trips');
            return;
        }

        createMutation.mutate({
            mode,
            branchId: 'default-branch-id', // TODO: Get from context/auth
            driverId: mode === 'INTERNAL_FLEET' ? driverId : undefined,
            vehicleId: mode === 'INTERNAL_FLEET' ? vehicleId : undefined,
            fulfillmentProviderId: mode === 'EXTERNAL_COURIER' ? providerId : undefined,
        });
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <Link href="/tenant/logistics" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 w-fit">
                <ArrowLeft className="h-4 w-4" /> Back to Logistics
            </Link>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Plan New Trip</h1>
                <p className="text-slate-600">Schedule a delivery trip or courier pickup</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Fulfillment Mode</label>
                    <select
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                    >
                        <option value="INTERNAL_FLEET">Internal Fleet</option>
                        <option value="EXTERNAL_COURIER">External Courier</option>
                        <option value="CUSTOMER_PICKUP">Customer Pickup</option>
                        <option value="THIRD_PARTY_DRIVER">Third Party Driver</option>
                    </select>
                </div>

                {mode === 'INTERNAL_FLEET' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Driver</label>
                            {/* Placeholder for Driver Select */}
                            <input
                                type="text"
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
                                placeholder="Select Driver (enter ID for prototype)"
                                value={driverId}
                                onChange={(e) => setDriverId(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle</label>
                            {/* Placeholder for Vehicle Select */}
                            <input
                                type="text"
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
                                placeholder="Select Vehicle (enter ID for prototype)"
                                value={vehicleId}
                                onChange={(e) => setVehicleId(e.target.value)}
                            />
                        </div>
                    </>
                )}

                {mode === 'EXTERNAL_COURIER' && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Courier Provider</label>
                        <input
                            type="text"
                            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
                            placeholder="Select Provider (enter ID for prototype)"
                            value={providerId}
                            onChange={(e) => setProviderId(e.target.value)}
                        />
                    </div>
                )}

                <div className="pt-4 flex justify-end gap-3">
                    <Link href="/tenant/logistics" className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</Link>
                    <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        Create Trip
                    </button>
                </div>
            </form>
        </div>
    );
}

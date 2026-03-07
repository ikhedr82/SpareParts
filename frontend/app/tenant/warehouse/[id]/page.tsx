'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, Circle, Play, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function PickingPage() {
    const params = useParams();
    const id = params.id as string;
    const queryClient = useQueryClient();

    const { data: pickList, isLoading } = useQuery({
        queryKey: ['picklist', id],
        queryFn: async () => {
            const { data } = await axios.get(`http://localhost:3000/warehouse/picklists/${id}`, { withCredentials: true });
            return data;
        },
    });

    const actionMutation = useMutation({
        mutationFn: async ({ action, payload }: { action: string; payload?: any }) => {
            await axios.post(`http://localhost:3000/warehouse/picklists/${id}/${action}`, payload || {}, { withCredentials: true });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['picklist', id] });
        },
    });

    if (isLoading) return <div className="p-8 text-center">Loading task...</div>;
    if (!pickList) return <div className="p-8 text-center">PickList not found.</div>;

    const isStarted = pickList.status !== 'CREATED';

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <Link href="/tenant/warehouse" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 w-fit">
                <ArrowLeft className="h-4 w-4" /> Back to Warehouse
            </Link>

            <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Order #{pickList.order?.orderNumber}</h1>
                        <p className="text-slate-600 text-sm mt-1">PickList ID: {pickList.id}</p>
                    </div>
                    {!isStarted ? (
                        <button
                            onClick={() => actionMutation.mutate({ action: 'start' })}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm font-semibold text-lg"
                        >
                            <Play className="h-5 w-5 fill-current" /> Start Job
                        </button>
                    ) : (
                        <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-medium border border-yellow-200">
                            IN PROGRESS
                        </div>
                    )}
                </div>

                <div className="divide-y divide-slate-100">
                    {pickList.items.map((item: any) => {
                        const isPicked = item.status === 'PICKED';

                        return (
                            <div key={item.id} className={`p-6 flex items-center justify-between ${isPicked ? 'bg-slate-50 opacity-75' : 'bg-white'}`}>
                                <div className="flex items-center gap-4">
                                    <button
                                        disabled={!isStarted || isPicked || actionMutation.isPending}
                                        onClick={() => actionMutation.mutate({ action: 'pick-item', payload: { itemId: item.id } })}
                                        className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${isPicked
                                                ? 'bg-green-500 text-white'
                                                : isStarted
                                                    ? 'border-2 border-slate-300 hover:border-blue-500 hover:text-blue-500 text-slate-300'
                                                    : 'border-2 border-slate-200 text-slate-200 cursor-not-allowed'
                                            }`}
                                    >
                                        {actionMutation.isPending && !isPicked ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                                    </button>
                                    <div>
                                        <div className={`font-semibold text-lg ${isPicked ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                                            {item.product?.name || item.productId}
                                        </div>
                                        <div className="text-sm text-slate-500">
                                            Product ID: {item.productId}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-2xl font-bold text-slate-900">{item.quantity}</div>
                                    <div className="text-xs text-slate-500 uppercase font-medium">Units</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {pickList.status === 'PICKED' && (
                    <div className="p-8 bg-green-50 text-center border-t border-green-100">
                        <div className="inline-flex items-center gap-2 text-green-700 font-bold text-lg">
                            <CheckCircle className="h-6 w-6" />
                            Picking Complete!
                        </div>
                        <p className="text-green-600 mt-2">All items have been picked. Proceed to Packing.</p>
                        <button className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                            Go to Packing Station
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

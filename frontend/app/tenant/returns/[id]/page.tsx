'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Check, X, Truck, Archive, Loader2, Calendar, User, FileText } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function ReturnDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const id = params.id as string;
    const [rejectReason, setRejectReason] = useState('');
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

    const { data: ret, isLoading, error } = useQuery({
        queryKey: ['purchase-return', id],
        queryFn: async () => {
            const { data } = await axios.get(`http://localhost:3000/api/v1/purchase-returns/${id}`, { withCredentials: true });
            return data;
        },
    });

    const actionMutation = useMutation({
        mutationFn: async ({ action, payload }: { action: string; payload?: any }) => {
            let url = `http://localhost:3000/api/v1/purchase-returns/${id}/${action}`;
            const res = await axios.post(url, payload || {}, { withCredentials: true });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchase-return', id] });
            setIsRejectModalOpen(false);
            setRejectReason('');
        },
    });

    if (isLoading) return <div className="p-8 text-center">Loading details...</div>;
    if (error) return <div className="p-8 text-center text-red-600">Error loading return details.</div>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-blue-100 text-blue-700';
            case 'COMPLETED': return 'bg-green-100 text-green-700';
            case 'REJECTED': return 'bg-red-100 text-red-700';
            case 'REQUESTED': return 'bg-yellow-100 text-yellow-700';
            case 'SHIPPED': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <Link href="/tenant/returns" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 w-fit">
                <ArrowLeft className="h-4 w-4" /> Back to Returns
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-slate-900">Return Details</h1>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(ret.status)}`}>
                            {ret.status}
                        </span>
                    </div>
                    <p className="text-slate-600 flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> ID: {ret.id}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Created: {format(new Date(ret.createdAt), 'PP p')}</span>
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    {ret.status === 'REQUESTED' && (
                        <>
                            <button
                                onClick={() => actionMutation.mutate({ action: 'approve' })}
                                disabled={actionMutation.isPending}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                <Check className="h-4 w-4" /> Approve
                            </button>
                            <button
                                onClick={() => setIsRejectModalOpen(true)}
                                disabled={actionMutation.isPending}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                <X className="h-4 w-4" /> Reject
                            </button>
                        </>
                    )}
                    {ret.status === 'APPROVED' && (
                        <button
                            onClick={() => actionMutation.mutate({ action: 'ship' })}
                            disabled={actionMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                        >
                            <Truck className="h-4 w-4" /> Mark Shipped
                        </button>
                    )}
                    {ret.status === 'SHIPPED' && (
                        <button
                            onClick={() => actionMutation.mutate({ action: 'complete' })}
                            disabled={actionMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Archive className="h-4 w-4" /> Complete Return
                        </button>
                    )}
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wide">Original Purchase</h3>
                    <div className="font-semibold text-slate-900 text-lg">
                        <Link href={`/tenant/purchase-orders/${ret.purchaseOrderId}`} className="hover:underline text-blue-600">
                            PO-{ret.purchaseOrderId.substring(0, 8)}
                        </Link>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wide">Total Value</h3>
                    <div className="font-semibold text-slate-900 text-lg">
                        ${ret.totalValue?.toFixed(2) || '0.00'}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wide">Created By</h3>
                    <div className="font-semibold text-slate-900 text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-slate-400" />
                        User-{ret.createdById.substring(0, 5)}...
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <h2 className="font-semibold text-slate-900">Returned Items</h2>
                </div>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase">
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4">Reason</th>
                            <th className="px-6 py-4 text-right">Quantity</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {ret.items.map((item: any) => (
                            <tr key={item.id} className="hover:bg-slate-50 p-4">
                                <td className="px-6 py-4 font-medium text-slate-900">
                                    {item.product?.name || item.productId}
                                    <div className="text-xs text-slate-400 font-normal">{item.productId}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    <span className="bg-slate-100 px-2 py-1 rounded text-xs border border-slate-200">
                                        {item.reason}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-slate-900">
                                    {item.quantity}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Reject Modal */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Reject Return Request</h3>
                        <p className="text-sm text-slate-600 mb-4">Please provide a reason for rejecting this return request. This will restore the inventory.</p>
                        <textarea
                            className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 mb-4 h-32"
                            placeholder="Rejection reason..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsRejectModalOpen(false)}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => actionMutation.mutate({ action: 'reject', payload: { reason: rejectReason } })}
                                disabled={!rejectReason || actionMutation.isPending}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {actionMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

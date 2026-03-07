'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Check, X, ShoppingCart, Loader2, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useState } from 'react';

export default function QuoteDetailsPage() {
    const params = useParams();
    const id = params.id as string;
    const queryClient = useQueryClient();
    const router = useRouter();

    const [rejectReason, setRejectReason] = useState('');
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

    const { data: quote, isLoading } = useQuery({
        queryKey: ['quote', id],
        queryFn: async () => {
            const { data } = await axios.get(`http://localhost:3000/api/v1/sales-extensions/quotes/${id}`, { withCredentials: true });
            return data;
        },
    });

    const actionMutation = useMutation({
        mutationFn: async ({ action, payload }: { action: string; payload?: any }) => {
            await axios.post(`http://localhost:3000/api/v1/sales-extensions/quotes/${id}/${action}`, payload || {}, { withCredentials: true });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quote', id] });
            setIsRejectModalOpen(false);
            setRejectReason('');
        },
    });

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;
    if (!quote) return <div className="p-8 text-center">Quote not found.</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <Link href="/tenant/quotes" className="flex items-center gap-2 text-slate-500 mb-6 hover:text-slate-900 w-fit">
                <ArrowLeft className="h-4 w-4" /> Back to Quotes
            </Link>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                        Quote #{quote.quoteNumber}
                        <span className="text-sm px-3 py-1 bg-slate-100 rounded-full font-medium text-slate-600 border border-slate-200">
                            {quote.status}
                        </span>
                    </h1>
                    <p className="text-slate-600 flex gap-4 text-sm">
                        <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> Valid Until: {format(new Date(quote.validUntil), 'PP')}</span>
                    </p>
                </div>

                <div className="flex gap-2">
                    {quote.status === 'DRAFT' && (
                        <button
                            onClick={() => actionMutation.mutate({ action: 'send' })}
                            disabled={actionMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                            <Send className="h-4 w-4" /> Send
                        </button>
                    )}
                    {quote.status === 'SENT' && (
                        <>
                            <button
                                onClick={() => actionMutation.mutate({ action: 'accept' })}
                                disabled={actionMutation.isPending}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                <Check className="h-4 w-4" /> Accept
                            </button>
                            <button
                                onClick={() => setIsRejectModalOpen(true)}
                                disabled={actionMutation.isPending}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                <X className="h-4 w-4" /> Reject
                            </button>
                        </>
                    )}
                    {quote.status === 'ACCEPTED' && (
                        <button
                            onClick={() => actionMutation.mutate({ action: 'convert' })}
                            disabled={actionMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <ShoppingCart className="h-4 w-4" /> Convert to Order
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <div className="text-sm text-slate-500 uppercase font-medium mb-1">Customer</div>
                    <div className="text-lg font-semibold">{quote.customerName}</div>
                </div>
                <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <div className="text-sm text-slate-500 uppercase font-medium mb-1">Total Amount</div>
                    <div className="text-lg font-semibold">${Number(quote.total).toFixed(2)}</div>
                </div>
                <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <div className="text-sm text-slate-500 uppercase font-medium mb-1">Created Date</div>
                    <div className="text-lg font-semibold">{format(new Date(quote.createdAt), 'PP')}</div>
                </div>
            </div>

            <div className="bg-white border boundary-slate-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="px-6 py-4">Product ID</th>
                            <th className="px-6 py-4 text-right">Unit Price</th>
                            <th className="px-6 py-4 text-right">Quantity</th>
                            <th className="px-6 py-4 text-right">Discount</th>
                            <th className="px-6 py-4 text-right">Line Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {quote.items.map((item: any) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 font-medium">{item.product?.name || item.productId}</td>
                                <td className="px-6 py-4 text-right">${Number(item.unitPrice).toFixed(2)}</td>
                                <td className="px-6 py-4 text-right">{item.quantity}</td>
                                <td className="px-6 py-4 text-right">{(Number(item.discount) * 100).toFixed(0)}%</td>
                                <td className="px-6 py-4 text-right font-semibold">
                                    ${(Number(item.unitPrice) * item.quantity * (1 - Number(item.discount))).toFixed(2)}
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
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Reject Quote</h3>
                        <textarea
                            className="w-full border border-slate-300 rounded-lg p-3 text-sm mb-4 h-32"
                            placeholder="Reason for rejection..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsRejectModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Cancel</button>
                            <button
                                onClick={() => actionMutation.mutate({ action: 'reject', payload: { reason: rejectReason } })}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Confirm Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

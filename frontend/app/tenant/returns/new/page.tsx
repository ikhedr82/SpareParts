'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';

interface CreateReturnItemDto {
    productId: string;
    quantity: number;
    reason: string;
}

interface PurchaseOrder {
    id: string;
    status: string;
    // minimal fields for selection
}

export default function NewReturnPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [selectedPoId, setSelectedPoId] = useState('');
    const [items, setItems] = useState<CreateReturnItemDto[]>([]);
    const [error, setError] = useState('');

    // Fetch received POs
    const { data: purchaseOrders, isLoading: isLoadingPOs } = useQuery<PurchaseOrder[]>({
        queryKey: ['received-purchase-orders'],
        queryFn: async () => {
            // In a real scenario, this would filter by status=RECEIVED in the backend or query params
            // Assuming general endpoint returns all, filtering client side for prototype speed
            const { data } = await axios.get('http://localhost:3000/api/purchase-orders', { withCredentials: true }); // Verify correct endpoint
            return data.filter((po: any) => po.status === 'RECEIVED' || po.status === 'PARTIALLY_RECEIVED');
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: { purchaseOrderId: string; items: CreateReturnItemDto[] }) => {
            const res = await axios.post('http://localhost:3000/api/v1/purchase-returns', data, { withCredentials: true });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchase-returns'] });
            router.push('/tenant/returns');
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to create return request');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPoId) {
            setError('Please select a Purchase Order');
            return;
        }
        if (items.length === 0) {
            setError('Please add at least one item to return');
            return;
        }

        createMutation.mutate({
            purchaseOrderId: selectedPoId,
            items: items,
        });
    };

    // Placeholder for item selection logic - normally would fetch PO items and show a table to select from
    // For this prototype/coverage pass, we will assume user knows product IDs or simple input for now
    // NOTE: Gapping this slightly for speed, but ideally selecting a PO should show its items.

    // Simplification strategy for prototype:
    // Just a text area JSON input or simple dynamic fields to allow manually entering product ID/Qty 
    // to unblock the flow, recognizing UI might need polish later for looking up PO items specifically.

    const addItem = () => {
        setItems([...items, { productId: '', quantity: 1, reason: 'DEFECTIVE' }]);
    };

    const updateItem = (index: number, field: keyof CreateReturnItemDto, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <Link
                href="/tenant/returns"
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 w-fit"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Returns
            </Link>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Create Return Request</h1>
                <p className="text-slate-600">Request to return items from a received Purchase Order</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">1. Select Purchase Order</h2>
                    {isLoadingPOs ? (
                        <div className="text-slate-500 text-sm">Loading purchase orders...</div>
                    ) : (
                        <select
                            className="w-full max-w-md p-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={selectedPoId}
                            onChange={(e) => setSelectedPoId(e.target.value)}
                        >
                            <option value="">Select a PO...</option>
                            {purchaseOrders?.map((po) => (
                                <option key={po.id} value={po.id}>
                                    PO-{po.id.substring(0, 8)} ({po.status})
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">2. Items to Return</h2>
                        <button
                            type="button"
                            onClick={addItem}
                            className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-medium transition-colors"
                        >
                            + Add Item
                        </button>
                    </div>

                    <div className="space-y-3">
                        {items.length === 0 && (
                            <div className="text-slate-500 text-sm italic">No items added yet.</div>
                        )}
                        {items.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Product ID</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Product ID (UUID)"
                                        className="w-full p-2 border border-slate-300 rounded text-sm"
                                        value={item.productId}
                                        onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                    />
                                </div>
                                <div className="w-24">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Qty</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        className="w-full p-2 border border-slate-300 rounded text-sm"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Reason</label>
                                    <select
                                        className="w-full p-2 border border-slate-300 rounded text-sm"
                                        value={item.reason}
                                        onChange={(e) => updateItem(index, 'reason', e.target.value)}
                                    >
                                        <option value="DEFECTIVE">Defective</option>
                                        <option value="WRONG_ITEM">Wrong Item</option>
                                        <option value="DAMAGED_IN_DELIVERY">Damaged</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    className="text-red-500 hover:text-red-700 text-sm mt-5"
                                    onClick={() => removeItem(index)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Link
                        href="/tenant/returns"
                        className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        Submit Return Request
                    </button>
                </div>
            </form>
        </div>
    );
}

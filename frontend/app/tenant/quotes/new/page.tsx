'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface CreateQuoteItemDto {
    productId: string;
    quantity: number;
    discount?: number;
}

export default function NewQuotePage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [customerName, setCustomerName] = useState('');
    const [businessClientId, setBusinessClientId] = useState('');
    const [validUntil, setValidUntil] = useState('');
    const [items, setItems] = useState<CreateQuoteItemDto[]>([]);
    const [error, setError] = useState('');

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await axios.post('http://localhost:3000/api/v1/sales-extensions/quotes', data, { withCredentials: true });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotes'] });
            router.push('/tenant/quotes');
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to create quote');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) {
            setError('Please add at least one item');
            return;
        }

        createMutation.mutate({
            customerName,
            businessClientId: businessClientId || undefined,
            validUntil: new Date(validUntil).toISOString(),
            items,
        });
    };

    const addItem = () => {
        setItems([...items, { productId: '', quantity: 1, discount: 0 }]);
    };

    const updateItem = (index: number, field: keyof CreateQuoteItemDto, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <Link href="/tenant/quotes" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 w-fit">
                <ArrowLeft className="h-4 w-4" /> Back to Quotes
            </Link>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Create New Quote</h1>
                <p className="text-slate-600">Draft a new price estimate for a customer</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name *</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Business Client ID (Optional)</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                            value={businessClientId}
                            onChange={(e) => setBusinessClientId(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Valid Until *</label>
                        <input
                            type="date"
                            required
                            className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                            value={validUntil}
                            onChange={(e) => setValidUntil(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">Items</h2>
                        <button type="button" onClick={addItem} className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-medium">+ Add Item</button>
                    </div>

                    <div className="space-y-3">
                        {items.length === 0 && <div className="text-slate-500 italic text-sm">No items added.</div>}
                        {items.map((item, index) => (
                            <div key={index} className="flex gap-4 items-end p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                <div className="flex-1">
                                    <label className="text-xs text-slate-500 block mb-1">Product ID</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2 border border-slate-300 rounded text-sm"
                                        value={item.productId}
                                        onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                    />
                                </div>
                                <div className="w-24">
                                    <label className="text-xs text-slate-500 block mb-1">Qty</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        className="w-full p-2 border border-slate-300 rounded text-sm"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="w-24">
                                    <label className="text-xs text-slate-500 block mb-1">Discount %</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        className="w-full p-2 border border-slate-300 rounded text-sm"
                                        value={item.discount}
                                        onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value))}
                                    />
                                </div>
                                <button type="button" onClick={() => removeItem(index)} className="text-red-500 text-sm pb-2 hover:underline">Remove</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Link href="/tenant/quotes" className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</Link>
                    <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        Create Quote
                    </button>
                </div>
            </form>
        </div>
    );
}

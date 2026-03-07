'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import apiClient from '@/lib/api';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    total: number;
    saleId?: string;
    onSuccess: (receiptData: any) => void;
}

export function PaymentModal({ isOpen, onClose, total, saleId, onSuccess }: PaymentModalProps) {
    const [method, setMethod] = useState<'CASH' | 'CARD' | 'STRIPE' | null>(null);
    const [amount, setAmount] = useState(total.toFixed(2));
    const [processing, setProcessing] = useState(false);

    if (!isOpen) return null;

    const change = parseFloat(amount) - total;

    const handlePayment = async () => {
        if (!method) return;

        setProcessing(true);
        try {
            const response = await apiClient.post('/payments', {
                saleId,
                amount: parseFloat(amount),
                method,
            });

            onSuccess(response.data);
            onClose();
        } catch (error) {
            console.error('Payment failed:', error);
            alert('Payment failed');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">Payment</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-6 text-center">
                        <p className="text-sm text-slate-600 mb-2">Total Amount</p>
                        <p className="text-5xl font-bold text-slate-900">${total.toFixed(2)}</p>
                    </div>

                    {!method ? (
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    setMethod('CASH');
                                    setAmount(total.toFixed(2));
                                }}
                                className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition"
                            >
                                💵 Cash
                            </button>
                            <button
                                onClick={() => {
                                    setMethod('CARD');
                                    setAmount(total.toFixed(2));
                                }}
                                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition"
                            >
                                💳 Card
                            </button>
                            <button
                                onClick={() => {
                                    setMethod('STRIPE');
                                    setAmount(total.toFixed(2));
                                }}
                                className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition"
                            >
                                🌐 Stripe
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-slate-50 rounded-lg p-4">
                                <p className="text-sm text-slate-600 mb-1">Payment Method</p>
                                <p className="font-semibold text-lg">{method}</p>
                            </div>

                            {method === 'CASH' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Amount Tendered
                                        </label>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            step="0.01"
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-lg font-mono"
                                        />
                                    </div>

                                    <div className="grid grid-cols-4 gap-2">
                                        <button
                                            onClick={() => setAmount(total.toFixed(2))}
                                            className="bg-slate-100 hover:bg-slate-200 py-2 rounded font-medium"
                                        >
                                            Exact
                                        </button>
                                        <button
                                            onClick={() => setAmount((total + 5).toFixed(2))}
                                            className="bg-slate-100 hover:bg-slate-200 py-2 rounded font-medium"
                                        >
                                            +$5
                                        </button>
                                        <button
                                            onClick={() => setAmount((total + 10).toFixed(2))}
                                            className="bg-slate-100 hover:bg-slate-200 py-2 rounded font-medium"
                                        >
                                            +$10
                                        </button>
                                        <button
                                            onClick={() => setAmount((total + 20).toFixed(2))}
                                            className="bg-slate-100 hover:bg-slate-200 py-2 rounded font-medium"
                                        >
                                            +$20
                                        </button>
                                    </div>

                                    {change >= 0 && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <p className="text-sm text-green-700 mb-1">Change</p>
                                            <p className="text-3xl font-bold text-green-700">${change.toFixed(2)}</p>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setMethod(null)}
                                    className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg font-semibold hover:bg-slate-300 transition"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handlePayment}
                                    disabled={processing || (method === 'CASH' && change < 0)}
                                    className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                                >
                                    {processing ? 'Processing...' : 'Confirm Payment'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

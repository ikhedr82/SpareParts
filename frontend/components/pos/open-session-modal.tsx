'use client';

import { useState } from 'react';
import { useCashSession } from '@/lib/CashSessionContext';

export function OpenSessionModal() {
    const { session, openSession, isLoading } = useCashSession();
    const [amount, setAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (isLoading || session) return null; // Don't show if loading or already open

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await openSession(Number(amount));
        } catch (error) {
            console.error('Failed to open session', error);
            alert('Failed to open session');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-2xl">
                <h2 className="text-2xl font-bold mb-2">Open Cash Drawer</h2>
                <p className="text-slate-500 mb-6">Enter the opening cash amount to start selling.</p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Opening Amount ($)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full text-2xl font-bold p-4 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-center"
                            placeholder="0.00"
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || !amount}
                        className="w-full bg-primary text-white py-4 rounded-lg font-bold text-lg hover:opacity-90 transition disabled:opacity-50"
                    >
                        {submitting ? 'Opening...' : 'Open Session'}
                    </button>
                </form>
            </div>
        </div>
    );
}

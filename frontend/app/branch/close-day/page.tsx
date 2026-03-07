'use client';

import { useState, useEffect } from 'react';
import { useCashSession } from '@/lib/CashSessionContext';
import { useRouter } from 'next/navigation';

export default function CloseDayPage() {
    const { session, closeSession, isLoading } = useCashSession();
    const [amount, setAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    if (isLoading) return <div>Loading...</div>;

    // If no session is open, redirect or show message
    if (!session) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-slate-900 mb-4">No Session Open</h1>
                <p className="text-slate-500">There is no open cash session to close.</p>
            </div>
        );
    }

    // Calculate expected logic could be done loosely here or just let backend handle it strictly
    // Assuming backend handles the math and we just submit the counted cash.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await closeSession(Number(amount));
            // Show success or redirect
            alert('Session closed successfully.');
            router.push('/branch'); // Redirect to POS (which will prompt to open new session)
        } catch (error) {
            console.error('Failed to close session', error);
            alert('Failed to close session');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Close Day / Shift</h1>
            <p className="text-slate-500 mb-8">
                Count the cash in the drawer and enter the total amount below.
            </p>

            <form onSubmit={handleSubmit}>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Total Cash Counted ($)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full text-3xl font-bold p-4 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-center text-slate-900"
                        placeholder="0.00"
                        autoFocus
                    />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> Any difference between the expected amount and the counted amount will be recorded as a variance.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={submitting || !amount}
                    className="w-full bg-red-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                    {submitting ? 'Closing Session...' : 'Close Session'}
                </button>
            </form>
        </div>
    );
}

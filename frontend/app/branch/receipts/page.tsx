'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { format } from 'date-fns';

interface Sale {
    id: string;
    invoice: { invoiceNumber: string; status: string } | null;
    total: number;
    payments: any[];
    items: any[];
    status: string;
    createdAt: string;
    customerName?: string;
}

export default function ReceiptsPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchSales = async () => {
        try {
            const res = await apiClient.get('/sales');
            setSales(res.data);
        } catch (error) {
            console.error('Failed to fetch sales', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, []);

    const handleRefund = async (saleId: string, amount: number) => {
        if (!confirm('Are you sure you want to refund this sale?')) return;
        setProcessingId(saleId);
        try {
            await apiClient.post('/sales/refund', {
                saleId,
                amount,
                reason: 'Customer Request' // Simple reason for now
            });
            alert('Refund processed successfully');
            fetchSales();
        } catch (error) {
            console.error('Failed to refund sale', error);
            alert('Failed to refund sale');
        } finally {
            setProcessingId(null);
        }
    };

    const handleVoid = async (saleId: string) => {
        if (!confirm('Are you sure you want to VOID this sale?')) return;
        setProcessingId(saleId);
        try {
            await apiClient.post('/sales/void', { saleId });
            alert('Sale voided successfully');
            fetchSales();
        } catch (error) {
            console.error('Failed to void sale', error);
            alert('Failed to void sale');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div className="p-8">Loading receipts...</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Receipts & Orders</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice / ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sales.map((sale) => (
                            <tr key={sale.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {format(new Date(sale.createdAt), 'MMM d, yyyy HH:mm')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {sale.invoice?.invoiceNumber || sale.id.slice(0, 8)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {sale.customerName || 'Walk-in'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${Number(sale.total).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${sale.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                            sale.status === 'REFUNDED' ? 'bg-orange-100 text-orange-800' :
                                                'bg-red-100 text-red-800'}`}>
                                        {sale.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {sale.status === 'COMPLETED' && (
                                        <>
                                            {/* Logic: Refund if paid, Void if unpaid/no payments? 
                                                Currently assuming Create -> Payments. 
                                                If payments exist, offer Refund. 
                                                If no payments, offer Void.
                                            */}
                                            {sale.payments && sale.payments.length > 0 ? (
                                                <button
                                                    onClick={() => handleRefund(sale.id, Number(sale.total))}
                                                    disabled={!!processingId}
                                                    className="text-orange-600 hover:text-orange-900 mr-4"
                                                >
                                                    Refund
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleVoid(sale.id)}
                                                    disabled={!!processingId}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Void
                                                </button>
                                            )}
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

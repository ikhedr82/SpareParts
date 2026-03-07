'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Package, Clock, Truck } from 'lucide-react';
import apiClient from '@/lib/api';

interface POItem {
    id: string;
    productId: string;
    product: { name: string; sku: string };
    quantity: number;
    unitCost: number;
}

interface PurchaseOrder {
    id: string;
    supplierName: string;
    status: string;
    totalCost: number;
    createdAt: string;
    items: POItem[];
    // branch might be included or not? Service include: items: { include: product }, createdBy.
    // Branch relation is not included in findOne in service? let's check.
    // findOne includes: items (product), createdBy. Branch ID is there.
    branchId: string;
    createdBy: { name: string; email: string };
}

export default function PurchaseOrderDetailsPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const [order, setOrder] = useState<PurchaseOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (id) fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const response = await apiClient.get(`/purchase-orders/${id}`);
            setOrder(response.data);
        } catch (error) {
            console.error('Failed to fetch order:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReceive = async () => {
        if (!confirm('Are you sure you want to receive this order? This will update inventory stock.')) return;

        setProcessing(true);
        try {
            await apiClient.post(`/purchase-orders/${id}/receive`, {});
            await fetchOrder(); // Refresh status
            alert('Order received and stock updated!');
        } catch (error) {
            console.error('Failed to receive order:', error);
            alert('Failed to receive order');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!order) return <div className="p-8">Order not found</div>;

    const isReceived = order.status === 'RECEIVED';

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'RECEIVED': return 'bg-green-100 text-green-700';
            case 'ORDERED': return 'bg-blue-100 text-blue-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <Link href="/tenant/purchase-orders" className="text-sm text-slate-500 hover:text-primary flex items-center gap-1 mb-2">
                        <ArrowLeft className="h-4 w-4" /> Back to Orders
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                        </span>
                    </h1>
                </div>
                {!isReceived && (
                    <button
                        onClick={handleReceive}
                        disabled={processing}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
                    >
                        <CheckCircle className="h-5 w-5" />
                        {processing ? 'Receiving...' : 'Receive Order'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500 mb-2">Supplier</h3>
                    <p className="text-lg font-semibold text-slate-900">{order.supplierName}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500 mb-2">Date Created</h3>
                    <p className="text-lg font-semibold text-slate-900">
                        {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-slate-500">by {order.createdBy?.name || 'Unknown'}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500 mb-2">Total Amount</h3>
                    <p className="text-2xl font-bold text-primary">
                        ${Number(order.totalCost).toFixed(2)}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Package className="h-5 w-5 text-slate-400" />
                        Order Items
                    </h2>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 font-semibold text-slate-700">Product</th>
                            <th className="px-6 py-3 font-semibold text-slate-700">SKU</th>
                            <th className="px-6 py-3 font-semibold text-slate-700 text-right">Quantity</th>
                            <th className="px-6 py-3 font-semibold text-slate-700 text-right">Unit Cost</th>
                            <th className="px-6 py-3 font-semibold text-slate-700 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {order.items.map((item) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 font-medium text-slate-900">
                                    {item.product?.name || 'Unknown Product'}
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    {item.product?.sku || '-'}
                                </td>
                                <td className="px-6 py-4 text-right">{item.quantity}</td>
                                <td className="px-6 py-4 text-right">${Number(item.unitCost).toFixed(2)}</td>
                                <td className="px-6 py-4 text-right font-medium text-slate-900">
                                    ${(item.quantity * Number(item.unitCost)).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

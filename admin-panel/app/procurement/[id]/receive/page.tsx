'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Truck } from 'lucide-react';
import Link from 'next/link';

export default function ReceivePOPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [freightCost, setFreightCost] = useState(0);
    const [loading, setLoading] = useState(false);

    // Mock Data (In real app, fetch fetch via useEffect based on params.id)
    const [items, setItems] = useState([
        { id: '1', name: 'Brake Pad Set (Front)', sku: 'BP-F-001', orderedQty: 50, receivedQty: 0, cost: 25.00 },
        { id: '2', name: 'Oil Filter (Generic)', sku: 'OF-G-100', orderedQty: 200, receivedQty: 100, cost: 4.50 },
    ]);

    const [receiveQuantities, setReceiveQuantities] = useState<Record<string, number>>({});

    const handleQuantityChange = (id: string, qty: number) => {
        setReceiveQuantities(prev => ({ ...prev, [id]: qty }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            items: Object.entries(receiveQuantities).map(([productId, quantity]) => ({
                productId,
                quantity
            })),
            freightCost
        };

        console.log('Submitting GRN:', payload);

        // Simulate API Call
        setTimeout(() => {
            setLoading(false);
            alert('Goods Received Note (GRN) created successfully!');
            router.push('/procurement');
        }, 1000);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center space-x-4">
                <Link href="/procurement" className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Receive Purchase Order #{params.id}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Freight Cost Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                        <Truck className="w-5 h-5 mr-2 text-gray-500" />
                        Landed Costs
                    </h2>
                    <div className="max-w-xs">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Freight / Shipping Cost ($)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={freightCost}
                            onChange={(e) => setFreightCost(parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">This cost will be distributed across received items.</p>
                    </div>
                </div>

                {/* Items Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b">
                        <h2 className="text-lg font-semibold">Items to Receive</h2>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ordered</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Previously Received</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receive Now</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {items.map(item => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{item.name}</div>
                                        <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{item.orderedQty}</td>
                                    <td className="px-6 py-4 text-gray-500">{item.receivedQty}</td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="number"
                                            min="0"
                                            max={item.orderedQty - item.receivedQty}
                                            placeholder="0"
                                            className="w-24 px-3 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                    <Link href="/procurement" className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center disabled:opacity-50"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Processing...' : 'Confirm Receipt'}
                    </button>
                </div>

            </form>
        </div>
    );
}

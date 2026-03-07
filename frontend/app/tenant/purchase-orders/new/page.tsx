'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save, Search } from 'lucide-react';
import apiClient from '@/lib/api';

interface Branch {
    id: string;
    name: string;
}

interface Product {
    id: string; // Product ID, NOT Inventory ID for PO creation usually?
    // Wait, PO items reference Product ID.
    // Inventory endpoint returns Inventory items (product + branch).
    // I should use /products endpoint to get list of all products available to order.
    // Or /inventory if I want to see current stock.
    // Let's use /products if available.
    name: string;
    sku: string;
}

interface POItem {
    productId: string;
    productName: string;
    quantity: number;
    unitCost: number;
}

export default function NewPurchaseOrderPage() {
    const router = useRouter();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [supplierName, setSupplierName] = useState('');
    const [items, setItems] = useState<POItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Product Search
    const [productSearch, setProductSearch] = useState('');
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const [branchesRes, productsRes] = await Promise.all([
                    apiClient.get('/branches'), // Assumption: Endpoint exists
                    apiClient.get('/products')  // Assumption: Endpoint exists
                ]);
                setBranches(branchesRes.data);
                setProducts(productsRes.data);
                if (branchesRes.data.length > 0) {
                    setSelectedBranch(branchesRes.data[0].id);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
                // Fallback if /branches fails, might need to fix backend
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        setFilteredProducts(
            products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
        );
    }, [productSearch, products]);

    const addItem = (product: Product) => {
        setItems(prev => {
            const existing = prev.find(i => i.productId === product.id);
            if (existing) return prev; // Already added
            return [...prev, {
                productId: product.id,
                productName: product.name,
                quantity: 1,
                unitCost: 0
            }];
        });
        setProductSearch(''); // Reset search
    };

    const updateItem = (index: number, field: keyof POItem, value: number) => {
        setItems(prev => {
            const newItems = [...prev];
            newItems[index] = { ...newItems[index], [field]: value };
            return newItems;
        });
    };

    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await apiClient.post('/purchase-orders', {
                branchId: selectedBranch,
                supplierName,
                items: items.map(i => ({
                    productId: i.productId,
                    quantity: Number(i.quantity),
                    unitCost: Number(i.unitCost)
                }))
            });
            router.push('/tenant/purchase-orders');
        } catch (error) {
            console.error('Failed to create purchase order:', error);
            alert('Failed to create order');
        } finally {
            setSubmitting(false);
        }
    };

    const totalCost = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-6">
                <Link href="/tenant/purchase-orders" className="text-sm text-slate-500 hover:text-primary flex items-center gap-1 mb-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Orders
                </Link>
                <h1 className="text-3xl font-bold text-slate-900">New Purchase Order</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header Info */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
                        <select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            required
                        >
                            <option value="">Select Branch</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Supplier Name</label>
                        <input
                            type="text"
                            value={supplierName}
                            onChange={(e) => setSupplierName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            placeholder="e.g. Acme Corp"
                            required
                        />
                    </div>
                </div>

                {/* Items */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">Order Items</h2>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search products to add..."
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                            />
                            {productSearch && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-auto z-10">
                                    {filteredProducts.map(p => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => addItem(p)}
                                            className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm"
                                        >
                                            {p.name} <span className="text-slate-400 text-xs">({p.sku})</span>
                                        </button>
                                    ))}
                                    {filteredProducts.length === 0 && (
                                        <div className="px-4 py-2 text-sm text-slate-500">No products found</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium text-slate-600">Product</th>
                                <th className="px-4 py-3 font-medium text-slate-600 w-32">Quantity</th>
                                <th className="px-4 py-3 font-medium text-slate-600 w-40">Unit Cost</th>
                                <th className="px-4 py-3 font-medium text-slate-600 w-40 text-right">Total</th>
                                <th className="px-4 py-3 font-medium text-slate-600 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((item, index) => (
                                <tr key={item.productId}>
                                    <td className="px-4 py-3 font-medium text-slate-900">{item.productName}</td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                            className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-primary outline-none"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.unitCost}
                                                onChange={(e) => updateItem(index, 'unitCost', Number(e.target.value))}
                                                className="w-full pl-5 pr-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-primary outline-none"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">
                                        ${(item.quantity * item.unitCost).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="text-slate-400 hover:text-red-500"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                        Add items to your order
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="border-t border-slate-200">
                            <tr>
                                <td colSpan={3} className="px-4 py-4 text-right font-bold text-slate-900">Total Purchase Cost:</td>
                                <td className="px-4 py-4 text-right font-bold text-primary text-xl">
                                    ${totalCost.toFixed(2)}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="flex justify-end gap-3">
                    <Link
                        href="/tenant/purchase-orders"
                        className="px-6 py-3 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting || items.length === 0 || !selectedBranch || !supplierName}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="h-5 w-5" />
                        {submitting ? 'Creating...' : 'Create Purchase Order'}
                    </button>
                </div>
            </form>
        </div>
    );
}

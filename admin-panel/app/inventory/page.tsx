'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Search, Filter, AlertTriangle, Package, Loader2, RefreshCcw } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface InventoryItem {
    id: string;
    sku: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    available: number;
}

export default function InventoryPage() {
    const { t } = useLanguage();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchInventory = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/portal/inventory', {
                params: { q: searchQuery }
            });
            setItems(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || t('common.error_occurred'));
            console.error('Fetch Inventory Error:', err);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, t]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchInventory();
        }, 500); // Debounce search
        return () => clearTimeout(timer);
    }, [fetchInventory]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-800">{t('nav.inventory')}</h1>
                    <button 
                        onClick={() => fetchInventory()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        disabled={loading}
                    >
                        <RefreshCcw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                <div className="flex space-x-2">
                    <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium text-gray-600 transition-colors">
                        <Filter className="w-4 h-4 me-2" />
                        {t('common.filter')}
                    </button>
                </div>
            </div>

            {/* KPI Cards (Simplified for Portal) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full me-4"><Package className="w-6 h-6" /></div>
                    <div>
                        <div className="text-sm text-gray-500">Available SKUs</div>
                        <div className="text-2xl font-bold">{items.length}</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 bg-red-100 text-red-600 rounded-full me-4"><AlertTriangle className="w-6 h-6" /></div>
                    <div>
                        <div className="text-sm text-gray-500">Low Stock Items</div>
                        <div className="text-2xl font-bold">{items.filter(i => i.available < 5).length}</div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute start-3 top-3 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('inventory.search_placeholder')} 
                        className="w-full ps-10 pe-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                    />
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('inventory.product')}</th>
                                <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('common.price')}</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('inventory.available')}</th>
                                <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('common.status')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                            <p className="text-gray-500">{t('common.loading')}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!loading && error && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-red-500">
                                        {error}
                                    </td>
                                </tr>
                            )}

                            {!loading && items.length === 0 && !error && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                                        {t('common.no_data')}
                                    </td>
                                </tr>
                            )}

                            {!loading && items.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">{item.name}</div>
                                        <div className="text-xs text-gray-500">SKU: {item.sku} • {item.brand} • {item.category}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {item.price.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-gray-800">
                                        {item.available}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.available > 0 ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                                In Stock
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                                                Out of Stock
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

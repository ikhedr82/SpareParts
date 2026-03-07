'use client';

import { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash } from 'lucide-react';

interface PriceRule {
    id: string;
    name: string;
    clientName: string;
    productName: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    value: number;
    priority: number;
    isActive: boolean;
}

export default function PriceRulesPage() {
    // Mock Data
    const [rules, setRules] = useState<PriceRule[]>([
        { id: '1', name: 'VIP Client Disc', clientName: 'AutoFix Repairs', productName: 'All Products', discountType: 'PERCENTAGE', value: 15, priority: 1, isActive: true },
        { id: '2', name: 'Bulk Brake Pads', clientName: 'All Clients', productName: 'Brake Pad Set (Front)', discountType: 'FIXED', value: 5.00, priority: 2, isActive: true },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Price Rules</h1>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Rule
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search rules..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button className="px-4 py-2 border rounded-lg flex items-center hover:bg-gray-50">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rule Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client Scope</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Scope</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adjustment</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {rules.map((rule) => (
                            <tr key={rule.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{rule.name}</td>
                                <td className="px-6 py-4 text-gray-500">{rule.clientName}</td>
                                <td className="px-6 py-4 text-gray-500">{rule.productName}</td>
                                <td className="px-6 py-4 font-mono text-blue-600">
                                    {rule.discountType === 'PERCENTAGE' ? `-${rule.value}%` : `-$${rule.value.toFixed(2)}`}
                                </td>
                                <td className="px-6 py-4 text-gray-500">{rule.priority}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {rule.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-blue-600 hover:text-blue-900 mr-3"><Edit className="w-4 h-4" /></button>
                                    <button className="text-red-600 hover:text-red-900"><Trash className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

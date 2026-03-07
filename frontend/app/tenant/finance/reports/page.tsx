'use client';

import { useState } from 'react';
import apiClient from '@/lib/api';
import { Calendar, Download } from 'lucide-react';

export default function ReportsPage() {
    const [reportType, setReportType] = useState('vat'); // vat, profit-loss, aging
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const fetchReport = async () => {
        setLoading(true);
        try {
            let url = `/reports/${reportType}`;
            if (reportType === 'vat' || reportType === 'profit-loss') {
                url += `?startDate=${startDate}&endDate=${endDate}`;
            } else if (reportType === 'aging') {
                url += `?type=CUSTOMER`; // Default to customer aging
            }

            const res = await apiClient.get(url);
            setData(res.data);
        } catch (error) {
            console.error('Failed to fetch report:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Financial Reports</h1>
                <p className="text-slate-600">View VAT, Profit & Loss, and Aging reports</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Report Type</label>
                        <select
                            className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                            value={reportType}
                            onChange={(e) => {
                                setReportType(e.target.value);
                                setData(null);
                            }}
                        >
                            <option value="vat">VAT Report</option>
                            <option value="profit-loss">Profit & Loss</option>
                            <option value="aging">Aging Report</option>
                        </select>
                    </div>

                    {(reportType === 'vat' || reportType === 'profit-loss') && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    className="px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    <button
                        onClick={fetchReport}
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-[400px] p-8">
                {!data ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <Calendar className="w-12 h-12 mb-4" />
                        <p>Select report parameters to view data</p>
                    </div>
                ) : (
                    <div>
                        {reportType === 'vat' && (
                            <div>
                                <h3 className="text-xl font-bold mb-4">VAT Report</h3>
                                <div className="grid grid-cols-2 gap-8 mb-8">
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <p className="text-sm text-slate-500">Total Sales (Tax Incl)</p>
                                        <p className="text-2xl font-bold text-slate-900">${(data.totalSales + data.totalTax).toFixed(2)}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <p className="text-sm text-slate-500">Total Tax Collected</p>
                                        <p className="text-2xl font-bold text-indigo-600">${data.totalTax.toFixed(2)}</p>
                                    </div>
                                </div>
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-2">Tax Rate</th>
                                            <th className="px-4 py-2 text-right">Amount Collected</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(data.breakdown || {}).map(([rate, amount]: [string, any]) => (
                                            <tr key={rate} className="border-b border-slate-100">
                                                <td className="px-4 py-2">{rate}</td>
                                                <td className="px-4 py-2 text-right">${Number(amount).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {reportType === 'profit-loss' && (
                            <div>
                                <h3 className="text-xl font-bold mb-4">Profit & Loss</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between p-4 bg-green-50 rounded-lg">
                                        <span className="font-medium">Total Revenue</span>
                                        <span className="font-bold text-green-700">${data.revenue.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between p-4 bg-red-50 rounded-lg">
                                        <span className="font-medium">Cost of Goods Sold (COGS)</span>
                                        <span className="font-bold text-red-700">-${data.cogs.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between p-4 bg-slate-100 rounded-lg text-lg border-t-2 border-slate-200">
                                        <span className="font-bold">Net Profit</span>
                                        <span className={`font-bold ${data.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                            ${data.profit.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {reportType === 'aging' && (
                            <div>
                                <h3 className="text-xl font-bold mb-4">Aging Report (Customers)</h3>
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-2">Customer</th>
                                            <th className="px-4 py-2 text-right">Balance Due</th>
                                            {/* Add buckets if backend supports it */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(data) && data.map((item: any) => (
                                            <tr key={item.id} className="border-b border-slate-100">
                                                <td className="px-4 py-2">{item.name}</td>
                                                <td className="px-4 py-2 text-right text-red-600 font-medium">${Number(item.balance).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { Plus, Search, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Quote {
    id: string;
    quoteNumber: string;
    clientName: string;
    totalAmount: number;
    status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'EXPIRED';
    validUntil: string;
}

export default function QuotesPage() {
    const [quotes, setQuotes] = useState<Quote[]>([
        { id: '1', quoteNumber: 'Q-2024-1001', clientName: 'Fast Lane Motors', totalAmount: 320.50, status: 'SENT', validUntil: '2024-03-01' },
        { id: '2', quoteNumber: 'Q-2024-1002', clientName: 'City Garage', totalAmount: 1150.00, status: 'DRAFT', validUntil: '2024-03-05' },
        { id: '3', quoteNumber: 'Q-2024-0998', clientName: 'Personal: John Doe', totalAmount: 45.00, status: 'ACCEPTED', validUntil: '2024-02-20' },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Quotations</h1>
                <Link href="/pricing/quotes/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition">
                    <Plus className="w-4 h-4 mr-2" />
                    New Quote
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search quotes..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>

            {/* Quotes List */}
            <div className="grid gap-4">
                {quotes.map((quote) => (
                    <div key={quote.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between hover:shadow-md transition">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900">{quote.quoteNumber}</div>
                                <div className="text-sm text-gray-500">{quote.clientName}</div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-8">
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Total</div>
                                <div className="font-semibold">${quote.totalAmount.toFixed(2)}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Status</div>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${quote.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                        quote.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'}`}>
                                    {quote.status}
                                </span>
                            </div>
                            <div className="text-right hidden md:block">
                                <div className="text-sm text-gray-500">Valid Until</div>
                                <div className="text-sm">{quote.validUntil}</div>
                            </div>

                            <button className="text-gray-400 hover:text-blue-600">
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

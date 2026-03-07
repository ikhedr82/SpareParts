'use client';

import { X, Printer, Download, Mail } from 'lucide-react';

interface ReceiptProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        receiptNumber: string;
        items: Array<{ name: string; price: number; quantity: number }>;
        total: number;
        paymentMethod: string;
        tender?: number;
        change?: number;
        date: string;
    };
}

export function Receipt({ isOpen, onClose, data }: ReceiptProps) {
    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // Simple text file download
        const receiptText = `
RECEIPT ${data.receiptNumber}
${new Date(data.date).toLocaleString()}
================================

${data.items.map(item => `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join('\n')}

================================
TOTAL: $${data.total.toFixed(2)}
PAYMENT: ${data.paymentMethod}
${data.tender ? `TENDERED: $${data.tender.toFixed(2)}` : ''}
${data.change ? `CHANGE: $${data.change.toFixed(2)}` : ''}

Thank you for your business!
    `;

        const blob = new Blob([receiptText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${data.receiptNumber}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-auto">
                <div className="p-6 border-b border-slate-200 flex items-center justify-between print:hidden">
                    <h2 className="text-2xl font-bold text-slate-900">Receipt</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-8">
                    <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900">Demo Auto Parts</h3>
                        <p className="text-sm text-slate-600">Downtown Store</p>
                        <p className="text-xs text-slate-500 mt-2">{new Date(data.date).toLocaleString()}</p>
                    </div>

                    <div className="border-t border-b border-dashed border-slate-300 py-4 my-4">
                        <p className="text-sm font-mono font-semibold text-slate-700 mb-2">
                            Receipt #{data.receiptNumber}
                        </p>
                    </div>

                    <div className="space-y-2 mb-4">
                        {data.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                                <span className="text-slate-700">
                                    {item.name} x{item.quantity}
                                </span>
                                <span className="font-mono font-semibold text-slate-900">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-slate-300 pt-4 space-y-2">
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span className="font-mono">${data.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Payment Method</span>
                            <span>{data.paymentMethod}</span>
                        </div>
                        {data.tender && (
                            <>
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Tendered</span>
                                    <span className="font-mono">${data.tender.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-green-600 font-semibold">
                                    <span>Change</span>
                                    <span className="font-mono">${(data.change || 0).toFixed(2)}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="mt-6 text-center text-xs text-slate-500">
                        <p>Thank you for your business!</p>
                        <p className="mt-1">www.demoautoparts.com</p>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-200 space-y-3 print:hidden">
                    <button
                        onClick={handlePrint}
                        className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3 rounded-lg font-semibold hover:bg-slate-200 transition"
                    >
                        <Printer className="h-5 w-5" />
                        Print Receipt
                    </button>
                    <button
                        onClick={handleDownload}
                        className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3 rounded-lg font-semibold hover:bg-slate-200 transition"
                    >
                        <Download className="h-5 w-5" />
                        Download
                    </button>
                    <button
                        disabled
                        className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-400 py-3 rounded-lg font-semibold cursor-not-allowed"
                    >
                        <Mail className="h-5 w-5" />
                        Email (Coming Soon)
                    </button>
                </div>
            </div>
        </div>
    );
}

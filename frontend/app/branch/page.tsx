'use client';

import { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, ShoppingBag, Search, Barcode } from 'lucide-react';
import apiClient from '@/lib/api';
import { PaymentModal } from '@/components/payment-modal';
import { Receipt } from '@/components/receipt';

interface CartItem {
    id: string;      // Inventory ID
    productId: string;
    branchId: string;
    name: string;
    price: number;
    quantity: number;
    sku: string;
}

interface Product {
    id: string;      // Inventory ID
    productId: string;
    branchId: string;
    name: string;
    price: number;
    sku: string;
    quantity: number;
}

export default function POSPage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [barcodeInput, setBarcodeInput] = useState('');
    const [processing, setProcessing] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [currentSaleId, setCurrentSaleId] = useState<string | null>(null);
    const [receiptData, setReceiptData] = useState<any>(null);
    const [products, setProducts] = useState<Product[]>([]);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const barcodeInputRef = useRef<HTMLInputElement>(null);

    // Fetch products from inventory
    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await apiClient.get('/inventory');
                setProducts(response.data.map((inv: any) => ({
                    id: inv.id,
                    productId: inv.productId,
                    branchId: inv.branchId,
                    name: inv.product?.name || 'Unknown Product',
                    price: Number(inv.sellingPrice) || 0,
                    sku: inv.barcode || 'NO-SKU',
                    quantity: inv.quantity || 0,
                })));
            } catch (error) {
                console.error('Failed to fetch products:', error);
            }
        }
        fetchProducts();
    }, []);

    // Hotkeys
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && cart.length > 0 && !showPaymentModal) {
                e.preventDefault();
                handleCompleteClick();
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                clearCart();
            }
            if (e.key === 'F2') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [cart, showPaymentModal]);

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.id === product.id);
            const currentQty = existing ? existing.quantity : 0;

            if (currentQty + 1 > product.quantity) {
                alert('Not enough stock available');
                return prev;
            }

            if (existing) {
                return prev.map((i) =>
                    i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (id: string) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: string, newQuantity: number) => {
        const product = products.find(p => p.id === id);
        if (!product) return;

        if (newQuantity <= 0) {
            removeFromCart(id);
            return;
        }

        if (newQuantity > product.quantity) {
            alert('Cannot add more than available stock');
            return;
        }

        setCart((prev) =>
            prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
        );
    };

    const clearCart = () => {
        setCart([]);
        setSearchQuery('');
        setBarcodeInput('');
    };

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleCompleteClick = async () => {
        setProcessing(true);
        try {
            // Create sale - transform items to expected backend format
            const saleResponse = await apiClient.post('/sales', {
                branchId: cart[0]?.branchId, // Use branchId from first cart item
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                })),
                totalAmount: total,
            });

            setCurrentSaleId(saleResponse.data.id);
            setShowPaymentModal(true);
        } catch (error) {
            console.error('Failed to create sale:', error);
            alert('Failed to create sale');
        } finally {
            setProcessing(false);
        }
    };

    const handlePaymentSuccess = (paymentData: any) => {
        // Prepare receipt data
        setReceiptData({
            receiptNumber: paymentData.receiptNumber || 'REC-' + Date.now(),
            items: cart,
            total,
            paymentMethod: paymentData.method,
            tender: paymentData.tender,
            change: paymentData.change,
            date: new Date().toISOString(),
        });

        // Clear cart and show receipt
        setCart([]);
        setShowPaymentModal(false);
        setShowReceipt(true);
    };

    // Filter products
    const filteredProducts = products.filter((p) => {
        const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesBarcode = barcodeInput ? p.sku === barcodeInput : true;
        return matchesSearch && matchesBarcode;
    });

    // Barcode scan handler
    const handleBarcodeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const product = products.find((p) => p.sku === barcodeInput);
        if (product) {
            addToCart(product);
            setBarcodeInput('');
            barcodeInputRef.current?.focus();
        }
    };

    return (
        <>
            <div className="h-screen flex">
                {/* Products Grid */}
                <div className="flex-1 p-6 overflow-auto bg-slate-50">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-900 mb-4">Point of Sale</h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search products (F2)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                />
                            </div>

                            {/* Barcode */}
                            <form onSubmit={handleBarcodeSubmit} className="relative">
                                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    ref={barcodeInputRef}
                                    type="text"
                                    placeholder="Scan barcode"
                                    value={barcodeInput}
                                    onChange={(e) => setBarcodeInput(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                />
                            </form>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredProducts.map((product) => (
                            <button
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="bg-white border-2 border-slate-200 rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all text-left"
                            >
                                <h3 className="font-semibold text-slate-900">{product.name}</h3>
                                <p className="text-xs text-slate-500 mt-1">{product.sku}</p>
                                <p className="text-2xl font-bold text-primary mt-2">
                                    ${product.price.toFixed(2)}
                                </p>
                                <div className={`text-sm font-medium mt-1 ${product.quantity === 0 ? 'text-red-500' : 'text-slate-500'}`}>
                                    {product.quantity === 0 ? 'Out of Stock' : `${product.quantity} available`}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cart Sidebar */}
                <div className="w-96 bg-white border-l border-slate-200 flex flex-col">
                    <div className="p-6 border-b border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900">Current Sale</h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Enter: Complete | Esc: Clear | F2: Search
                        </p>
                    </div>

                    <div className="flex-1 overflow-auto p-4">
                        {cart.length === 0 ? (
                            <div className="text-center text-slate-500 mt-8">
                                <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                <p>No items in cart</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cart.map((item) => (
                                    <div key={item.id} className="bg-slate-50 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-medium text-slate-900">{item.name}</h3>
                                                <p className="text-xs text-slate-500">{item.sku}</p>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-8 h-8 rounded bg-white border border-slate-300 hover:bg-slate-100"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center font-medium">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 rounded bg-white border border-slate-300 hover:bg-slate-100"
                                                >
                                                    <Plus className="h-4 w-4 mx-auto" />
                                                </button>
                                            </div>
                                            <p className="font-bold text-slate-900">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-slate-200 space-y-4">
                        <div className="flex justify-between text-2xl font-bold">
                            <span>Total</span>
                            <span className="text-primary">${total.toFixed(2)}</span>
                        </div>

                        <button
                            onClick={handleCompleteClick}
                            disabled={cart.length === 0 || processing}
                            className="w-full bg-primary text-white py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Processing...' : 'Complete Sale (Enter)'}
                        </button>

                        {cart.length > 0 && (
                            <button
                                onClick={clearCart}
                                className="w-full bg-slate-200 text-slate-700 py-3 rounded-lg font-semibold hover:bg-slate-300 transition"
                            >
                                Clear Cart (Esc)
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                total={total}
                saleId={currentSaleId || undefined}
                onSuccess={handlePaymentSuccess}
            />

            {/* Receipt */}
            {receiptData && (
                <Receipt
                    isOpen={showReceipt}
                    onClose={() => setShowReceipt(false)}
                    data={receiptData}
                />
            )}
        </>
    );
}

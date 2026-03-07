import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useLanguage } from '../../i18n/LanguageContext';
import BRAND from '../../config/brand';

interface CartItem { id: string; name: string; sku: string; price: number; quantity: number; }

export default function CartScreen({ navigation, route }: any) {
    const { t, isRtl } = useLanguage();
    const [items, setItems] = useState<CartItem[]>([]);
    const [discount, setDiscount] = useState(0);
    const TAX_RATE = 0.15;

    // Handle incoming product from ProductSearch
    useEffect(() => {
        if (route.params?.addProduct) {
            const product = route.params.addProduct;
            setItems(prev => {
                const existing = prev.find(i => i.id === product.id);
                if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
                return [...prev, { id: product.id, name: product.name, sku: product.sku, price: product.price, quantity: 1 }];
            });
            navigation.setParams({ addProduct: undefined });
        }
    }, [route.params?.addProduct]);

    const updateQuantity = (id: string, delta: number) => {
        setItems(prev => prev.map(i => {
            if (i.id !== id) return i;
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : i;
        }).filter(i => i.quantity > 0));
    };

    const removeItem = (id: string) => {
        Alert.alert(t('pos.cart.remove'), '', [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('common.confirm'), style: 'destructive', onPress: () => setItems(prev => prev.filter(i => i.id !== id)) },
        ]);
    };

    const clearCart = () => {
        Alert.alert(t('pos.cart.clear'), '', [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('common.confirm'), style: 'destructive', onPress: () => setItems([]) },
        ]);
    };

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax - discount;

    // Empty state
    if (items.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🛒</Text>
                <Text style={styles.emptyTitle}>{t('pos.cart.empty')}</Text>
                <Text style={styles.emptyDesc}>{t('pos.cart.empty_desc')}</Text>
                <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('ProductSearch')}>
                    <Text style={styles.shopBtnText}>{t('pos.product_search')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Clear button */}
            <TouchableOpacity style={styles.clearBtn} onPress={clearCart}>
                <Text style={styles.clearBtnText}>{t('pos.cart.clear')}</Text>
            </TouchableOpacity>

            {/* Cart Items */}
            <FlatList
                data={items}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View style={styles.cartItem}>
                        <View style={[styles.itemInfo, isRtl && styles.rowReverse]}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.itemName, isRtl && styles.rtlText]}>{item.name}</Text>
                                <Text style={[styles.itemPrice, isRtl && styles.rtlText]}>${item.price.toFixed(2)}</Text>
                            </View>
                            <View style={styles.qtyRow}>
                                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, -1)}>
                                    <Text style={styles.qtyBtnText}>−</Text>
                                </TouchableOpacity>
                                <Text style={styles.qtyValue}>{item.quantity}</Text>
                                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, 1)}>
                                    <Text style={styles.qtyBtnText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={[styles.itemFooter, isRtl && styles.rowReverse]}>
                            <TouchableOpacity onPress={() => removeItem(item.id)}>
                                <Text style={styles.removeText}>{t('pos.cart.remove')}</Text>
                            </TouchableOpacity>
                            <Text style={styles.itemTotal}>${(item.price * item.quantity).toFixed(2)}</Text>
                        </View>
                    </View>
                )}
            />

            {/* Summary */}
            <View style={styles.summary}>
                <View style={[styles.summaryRow, isRtl && styles.rowReverse]}>
                    <Text style={styles.summaryLabel}>{t('pos.cart.subtotal')}</Text>
                    <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
                </View>
                <View style={[styles.summaryRow, isRtl && styles.rowReverse]}>
                    <Text style={styles.summaryLabel}>{t('pos.cart.tax')} (15%)</Text>
                    <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
                </View>
                <View style={[styles.totalRow, isRtl && styles.rowReverse]}>
                    <Text style={styles.totalLabel}>{t('pos.cart.total')}</Text>
                    <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                    style={styles.checkoutBtn}
                    onPress={() => navigation.navigate('Checkout', { items, subtotal, tax, discount, total })}
                >
                    <Text style={styles.checkoutBtnText}>{t('pos.cart.checkout')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F5F9' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9', padding: 24 },
    emptyEmoji: { fontSize: 64, marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: BRAND.colors.textPrimary },
    emptyDesc: { fontSize: 14, color: BRAND.colors.textSecondary, marginTop: 4 },
    shopBtn: { backgroundColor: BRAND.colors.secondary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: BRAND.radius.sm, marginTop: 20 },
    shopBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    clearBtn: { alignSelf: 'flex-end', padding: 12 },
    clearBtnText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
    list: { paddingHorizontal: 16, paddingBottom: 16 },
    cartItem: { backgroundColor: '#fff', borderRadius: BRAND.radius.md, padding: 16, marginBottom: 10 },
    itemInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    rowReverse: { flexDirection: 'row-reverse' },
    rtlText: { textAlign: 'right' },
    itemName: { fontSize: 16, fontWeight: '700', color: BRAND.colors.textPrimary },
    itemPrice: { fontSize: 13, color: BRAND.colors.textSecondary, marginTop: 2 },
    qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    qtyBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
    qtyBtnText: { fontSize: 20, fontWeight: '700', color: BRAND.colors.textPrimary },
    qtyValue: { fontSize: 18, fontWeight: '700', minWidth: 24, textAlign: 'center' },
    itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8 },
    removeText: { color: '#EF4444', fontSize: 13, fontWeight: '600' },
    itemTotal: { fontSize: 16, fontWeight: '700', color: BRAND.colors.primary },
    summary: { backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryLabel: { color: BRAND.colors.textSecondary, fontSize: 15 },
    summaryValue: { fontSize: 15, fontWeight: '600', color: BRAND.colors.textPrimary },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0', marginBottom: 16 },
    totalLabel: { fontSize: 18, fontWeight: '800', color: BRAND.colors.textPrimary },
    totalValue: { fontSize: 22, fontWeight: '800', color: BRAND.colors.primary },
    checkoutBtn: { backgroundColor: BRAND.colors.primary, padding: 18, borderRadius: BRAND.radius.sm, alignItems: 'center' },
    checkoutBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});

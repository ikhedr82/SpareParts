import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import apiClient from '../../services/api';
import { useLanguage } from '../../i18n/LanguageContext';
import BRAND from '../../config/brand';
import { SyncQueue } from '../../services/SyncQueue';

type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER';

export default function CheckoutScreen({ route, navigation }: any) {
    const { items, subtotal, tax, discount, total } = route.params;
    const { t, isRtl } = useLanguage();
    const [method, setMethod] = useState<PaymentMethod>('CASH');
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [orderId, setOrderId] = useState('');

    const methods: { key: PaymentMethod; label: string; emoji: string }[] = [
        { key: 'CASH', label: t('pos.checkout.cash'), emoji: '💵' },
        { key: 'CARD', label: t('pos.checkout.card'), emoji: '💳' },
        { key: 'TRANSFER', label: t('pos.checkout.transfer'), emoji: '🏦' },
    ];

    const processPayment = async () => {
        if (!items || items.length === 0) {
            Alert.alert(t('common.error'), 'Missing items to checkout.');
            return;
        }

        setProcessing(true);
        const generatedOrderId = `ORD-${Date.now()}`;
        const salePayload = {
            clientOrderId: generatedOrderId,
            items: items.map((i: any) => ({ productId: i.id, quantity: i.quantity, price: i.price })),
            paymentMethod: method,
            subtotal, tax, discount, total,
        };

        try {
            const res = await apiClient.post('/mobile/pos/checkout', salePayload);
            setOrderId(res.data?.orderId || generatedOrderId);
            setSuccess(true);
        } catch (err: any) {
            // If offline or network error, enqueue for background sync
            if (!err.response || err.response.status >= 500) {
                console.log('Network error, enqueueing for offline sync...');
                
                await SyncQueue.enqueue({
                    type: 'CREATE',
                    entity: 'SALE',
                    priority: 'HIGH',
                    payload: salePayload,
                    version: 1,
                });
                
                // Enqueue payment separately for idempotency tracking
                await SyncQueue.enqueue({
                    type: 'CREATE',
                    entity: 'PAYMENT',
                    priority: 'HIGH',
                    payload: {
                        clientPaymentId: `PAY-${Date.now()}`,
                        saleId: generatedOrderId,
                        amount: total,
                        method
                    },
                    version: 1
                });

                setOrderId(`${generatedOrderId} (Offline)`);
                setSuccess(true);
            } else {
                Alert.alert(t('common.error'), err.response?.data?.message || err.message);
            }
        } finally {
            setProcessing(false);
        }
    };

    // Success view
    if (success) {
        return (
            <View style={styles.successContainer}>
                <Text style={styles.successEmoji}>✅</Text>
                <Text style={styles.successTitle}>{t('pos.checkout.success')}</Text>
                <Text style={styles.successOrder}>#{orderId}</Text>
                <Text style={styles.successTotal}>${total.toFixed(2)}</Text>
                <TouchableOpacity style={styles.newSaleBtn} onPress={() => navigation.popToTop()}>
                    <Text style={styles.newSaleBtnText}>{t('pos.checkout.new_sale')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Order Summary */}
            <View style={styles.card}>
                <Text style={[styles.sectionTitle, isRtl && styles.rtlText]}>{t('pos.checkout.title')}</Text>
                <View style={[styles.row, isRtl && styles.rowReverse]}>
                    <Text style={styles.label}>{t('pos.cart.subtotal')}</Text>
                    <Text style={styles.value}>${subtotal.toFixed(2)}</Text>
                </View>
                <View style={[styles.row, isRtl && styles.rowReverse]}>
                    <Text style={styles.label}>{t('pos.cart.tax')}</Text>
                    <Text style={styles.value}>${tax.toFixed(2)}</Text>
                </View>
                {discount > 0 && (
                    <View style={[styles.row, isRtl && styles.rowReverse]}>
                        <Text style={styles.label}>{t('pos.cart.discount')}</Text>
                        <Text style={[styles.value, { color: '#EF4444' }]}>-${discount.toFixed(2)}</Text>
                    </View>
                )}
                <View style={[styles.totalRow, isRtl && styles.rowReverse]}>
                    <Text style={styles.totalLabel}>{t('pos.checkout.amount_due')}</Text>
                    <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
                </View>
            </View>

            {/* Payment Method */}
            <Text style={[styles.sectionTitle, isRtl && styles.rtlText, { paddingHorizontal: 4, marginTop: 16 }]}>
                {t('pos.checkout.payment_method')}
            </Text>
            <View style={styles.methodsRow}>
                {methods.map(m => (
                    <TouchableOpacity
                        key={m.key}
                        style={[styles.methodCard, method === m.key && styles.methodSelected]}
                        onPress={() => setMethod(m.key)}
                    >
                        <Text style={styles.methodEmoji}>{m.emoji}</Text>
                        <Text style={[styles.methodLabel, method === m.key && styles.methodLabelSelected]}>{m.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Process Button */}
            <TouchableOpacity
                style={[styles.processBtn, processing && styles.processBtnDisabled]}
                onPress={processPayment}
                disabled={processing}
            >
                {processing ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.processBtnText}>{t('pos.checkout.process')}</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F5F9', padding: 16 },
    card: { backgroundColor: '#fff', padding: 20, borderRadius: BRAND.radius.md },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: BRAND.colors.textPrimary, marginBottom: 16 },
    rtlText: { textAlign: 'right' },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    rowReverse: { flexDirection: 'row-reverse' },
    label: { fontSize: 15, color: BRAND.colors.textSecondary },
    value: { fontSize: 15, fontWeight: '600', color: BRAND.colors.textPrimary },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 14, borderTopWidth: 2, borderTopColor: '#E2E8F0', marginTop: 6 },
    totalLabel: { fontSize: 18, fontWeight: '800', color: BRAND.colors.textPrimary },
    totalValue: { fontSize: 24, fontWeight: '800', color: BRAND.colors.primary },
    methodsRow: { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 24 },
    methodCard: { flex: 1, backgroundColor: '#fff', padding: 18, borderRadius: BRAND.radius.md, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
    methodSelected: { borderColor: BRAND.colors.secondary, backgroundColor: BRAND.colors.secondary + '10' },
    methodEmoji: { fontSize: 32, marginBottom: 6 },
    methodLabel: { fontSize: 13, fontWeight: '600', color: BRAND.colors.textSecondary },
    methodLabelSelected: { color: BRAND.colors.secondary },
    processBtn: { backgroundColor: BRAND.colors.primary, padding: 18, borderRadius: BRAND.radius.sm, alignItems: 'center' },
    processBtnDisabled: { opacity: 0.6 },
    processBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9', padding: 24 },
    successEmoji: { fontSize: 72, marginBottom: 16 },
    successTitle: { fontSize: 24, fontWeight: '800', color: BRAND.colors.primary },
    successOrder: { fontSize: 16, color: BRAND.colors.textSecondary, marginTop: 4 },
    successTotal: { fontSize: 36, fontWeight: '800', color: BRAND.colors.textPrimary, marginTop: 12 },
    newSaleBtn: { backgroundColor: BRAND.colors.secondary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: BRAND.radius.sm, marginTop: 32 },
    newSaleBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import apiClient from '../../services/api';
import { useLanguage } from '../../i18n/LanguageContext';
import BRAND from '../../config/brand';

interface SaleRecord { id: string; total: number; method: string; date: string; itemCount: number; }

export default function SalesHistoryScreen() {
    const { t, isRtl } = useLanguage();
    const [sales, setSales] = useState<SaleRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadSales(); }, []);

    const loadSales = async () => {
        try {
            const res = await apiClient.get('/mobile/pos/sales');
            setSales(res.data?.data || res.data || []);
        } catch { /* Use empty defaults */ }
        finally { setLoading(false); }
    };

    if (loading) return (
        <View style={styles.center}><ActivityIndicator size="large" color={BRAND.colors.secondary} /></View>
    );

    if (sales.length === 0) return (
        <View style={styles.center}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyText}>{t('pos.history.no_history')}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={sales}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={[styles.cardTop, isRtl && styles.rowReverse]}>
                            <View>
                                <Text style={[styles.orderId, isRtl && styles.rtlText]}>{t('pos.history.order_id')}{item.id}</Text>
                                <Text style={[styles.date, isRtl && styles.rtlText]}>{item.date}</Text>
                            </View>
                            <View style={{ alignItems: isRtl ? 'flex-start' : 'flex-end' }}>
                                <Text style={styles.total}>${item.total.toFixed(2)}</Text>
                                <View style={styles.methodBadge}>
                                    <Text style={styles.methodText}>{item.method}</Text>
                                </View>
                            </View>
                        </View>
                        <Text style={[styles.itemCount, isRtl && styles.rtlText]}>{item.itemCount} {t('common.items')}</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F5F9' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
    emptyEmoji: { fontSize: 48, marginBottom: 8 },
    emptyText: { fontSize: 14, color: BRAND.colors.textSecondary },
    list: { padding: 16, paddingBottom: 32 },
    card: { backgroundColor: '#fff', padding: 16, borderRadius: BRAND.radius.md, marginBottom: 10 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
    rowReverse: { flexDirection: 'row-reverse' },
    rtlText: { textAlign: 'right' },
    orderId: { fontSize: 15, fontWeight: '700', color: BRAND.colors.textPrimary },
    date: { fontSize: 12, color: BRAND.colors.textSecondary, marginTop: 2 },
    total: { fontSize: 18, fontWeight: '800', color: BRAND.colors.primary },
    methodBadge: { backgroundColor: BRAND.colors.secondary + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginTop: 4 },
    methodText: { fontSize: 11, fontWeight: '700', color: BRAND.colors.secondary },
    itemCount: { fontSize: 12, color: BRAND.colors.textSecondary, marginTop: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8 },
});

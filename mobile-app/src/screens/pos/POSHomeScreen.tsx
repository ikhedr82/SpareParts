import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { authService } from '../../services/auth';
import apiClient from '../../services/api';
import { useLanguage } from '../../i18n/LanguageContext';
import BRAND from '../../config/brand';

interface SalesSummary { salesToday: number; revenue: number; transactions: number; }
interface RecentSale { id: string; total: number; method: string; time: string; items: number; }

export default function POSHomeScreen({ navigation }: any) {
    const { t, isRtl } = useLanguage();
    const [user, setUser] = useState<any>(null);
    const [summary, setSummary] = useState<SalesSummary>({ salesToday: 0, revenue: 0, transactions: 0 });
    const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const userData = await authService.getUser();
            setUser(userData);
            const res = await apiClient.get('/mobile/pos/summary');
            setSummary(res.data?.summary || { salesToday: 0, revenue: 0, transactions: 0 });
            setRecentSales(res.data?.recentSales || []);
        } catch { /* Use defaults */ }
        finally { setLoading(false); }
    };

    const handleLogout = async () => { await authService.logout(); navigation.replace('POSLogin'); };

    if (loading) return (
        <View style={styles.center}><ActivityIndicator size="large" color={BRAND.colors.secondary} /><Text style={styles.loadingText}>{t('common.loading')}</Text></View>
    );

    return (
        <View style={styles.container}>
            <View style={[styles.header, isRtl && styles.rowReverse]}>
                <View>
                    <Text style={styles.welcome}>{t('common.welcome')}, {user?.name || 'Cashier'}</Text>
                    <Text style={styles.sub}>{t('pos.dashboard')}</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <Text style={styles.logoutText}>{t('common.logout')}</Text>
                </TouchableOpacity>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: BRAND.colors.secondary + '15' }]}>
                    <Text style={[styles.statValue, { color: BRAND.colors.secondary }]}>{summary.transactions}</Text>
                    <Text style={styles.statLabel}>{t('pos.transactions')}</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: BRAND.colors.primary + '15' }]}>
                    <Text style={[styles.statValue, { color: BRAND.colors.primary }]}>${summary.revenue.toFixed(2)}</Text>
                    <Text style={styles.statLabel}>{t('pos.revenue')}</Text>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsRow}>
                <TouchableOpacity style={[styles.actionCard, { backgroundColor: BRAND.colors.primary }]} onPress={() => navigation.navigate('ProductSearch')}>
                    <Text style={styles.actionEmoji}>🛒</Text>
                    <Text style={styles.actionLabel}>{t('pos.product_search')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionCard, { backgroundColor: BRAND.colors.secondary }]} onPress={() => navigation.navigate('Cart')}>
                    <Text style={styles.actionEmoji}>📋</Text>
                    <Text style={styles.actionLabel}>{t('pos.cart.title')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#8B5CF6' }]} onPress={() => navigation.navigate('SalesHistory')}>
                    <Text style={styles.actionEmoji}>📊</Text>
                    <Text style={styles.actionLabel}>{t('pos.history.title')}</Text>
                </TouchableOpacity>
            </View>

            {/* Recent Sales */}
            <Text style={[styles.sectionTitle, isRtl && styles.rtlText]}>{t('pos.recent_sales')}</Text>
            {recentSales.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>💰</Text>
                    <Text style={styles.emptyText}>{t('pos.no_sales')}</Text>
                </View>
            ) : (
                <FlatList
                    data={recentSales}
                    renderItem={({ item }) => (
                        <View style={[styles.saleRow, isRtl && styles.rowReverse]}>
                            <View><Text style={styles.saleId}>#{item.id}</Text><Text style={styles.saleTime}>{item.time}</Text></View>
                            <View style={{ alignItems: isRtl ? 'flex-start' : 'flex-end' }}>
                                <Text style={styles.saleTotal}>${item.total.toFixed(2)}</Text>
                                <Text style={styles.saleMethod}>{item.method}</Text>
                            </View>
                        </View>
                    )}
                    keyExtractor={item => item.id}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F5F9' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
    loadingText: { marginTop: 12, color: BRAND.colors.textSecondary },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    rowReverse: { flexDirection: 'row-reverse' },
    welcome: { fontSize: 20, fontWeight: '700', color: BRAND.colors.textPrimary },
    sub: { fontSize: 14, color: BRAND.colors.textSecondary },
    logoutBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: BRAND.radius.sm, backgroundColor: '#FEE2E2' },
    logoutText: { color: '#EF4444', fontWeight: '600' },
    statsRow: { flexDirection: 'row', gap: 12, padding: 16 },
    statCard: { flex: 1, padding: 20, borderRadius: BRAND.radius.md, alignItems: 'center' },
    statValue: { fontSize: 28, fontWeight: '800' },
    statLabel: { fontSize: 13, color: BRAND.colors.textSecondary, marginTop: 4 },
    actionsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 16 },
    actionCard: { flex: 1, padding: 16, borderRadius: BRAND.radius.md, alignItems: 'center' },
    actionEmoji: { fontSize: 28, marginBottom: 6 },
    actionLabel: { color: '#fff', fontSize: 12, fontWeight: '700', textAlign: 'center' },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: BRAND.colors.textPrimary, paddingHorizontal: 16, marginBottom: 8 },
    rtlText: { textAlign: 'right' },
    emptyState: { alignItems: 'center', padding: 32 },
    emptyEmoji: { fontSize: 48, marginBottom: 8 },
    emptyText: { fontSize: 14, color: BRAND.colors.textSecondary },
    saleRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 14, marginHorizontal: 16, marginBottom: 8, borderRadius: BRAND.radius.sm },
    saleId: { fontSize: 14, fontWeight: '700', color: BRAND.colors.textPrimary },
    saleTime: { fontSize: 12, color: BRAND.colors.textSecondary },
    saleTotal: { fontSize: 16, fontWeight: '700', color: BRAND.colors.primary },
    saleMethod: { fontSize: 12, color: BRAND.colors.textSecondary },
});

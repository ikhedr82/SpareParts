import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { authService } from '../../services/auth';
import apiClient from '../../services/api';
import { useLanguage } from '../../i18n/LanguageContext';
import BRAND from '../../config/brand';

type DeliveryStatus = 'ASSIGNED' | 'ACCEPTED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' | 'FAILED';

interface Delivery {
    id: string;
    customerName: string;
    customerAddress: string;
    customerPhone: string;
    status: DeliveryStatus;
    itemCount: number;
    orderId: string;
    notes?: string;
}

const STATUS_COLORS: Record<DeliveryStatus, string> = {
    ASSIGNED: '#F59E0B',
    ACCEPTED: BRAND.colors.secondary,
    PICKED_UP: '#8B5CF6',
    IN_TRANSIT: BRAND.colors.secondary,
    DELIVERED: BRAND.colors.primary,
    CANCELLED: '#EF4444',
    FAILED: '#EF4444',
};

export default function DriverHomeScreen({ navigation }: any) {
    const { t, isRtl } = useLanguage();
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setError('');
            const userData = await authService.getUser();
            setUser(userData);
            const res = await apiClient.get('/mobile/driver/trips');
            const trips = res.data?.data || res.data || [];
            setDeliveries(Array.isArray(trips) ? trips.map((t: any) => ({
                id: t.id,
                customerName: t.customerName || t.customer || 'Customer',
                customerAddress: t.customerAddress || t.address || '',
                customerPhone: t.customerPhone || '',
                status: t.status || 'ASSIGNED',
                itemCount: t.itemCount || t.stops?.length || 0,
                orderId: t.orderId || t.id,
                notes: t.notes || '',
            })) : []);
        } catch (err: any) {
            setError(err.message || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, []);

    const handleLogout = async () => {
        await authService.logout();
        navigation.replace('DriverLogin');
    };

    const activeCount = deliveries.filter(d => d.status !== 'DELIVERED' && d.status !== 'CANCELLED').length;

    const renderDelivery = ({ item }: { item: Delivery }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('DeliveryDetail', { delivery: item })}
            activeOpacity={0.7}
        >
            <View style={[styles.cardHeader, isRtl && styles.rowReverse]}>
                <Text style={styles.customerName} numberOfLines={1}>{item.customerName}</Text>
                <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
                    <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] }]}>
                        {t(`driver.status.${item.status}`)}
                    </Text>
                </View>
            </View>
            <Text style={[styles.address, isRtl && styles.rtlText]} numberOfLines={2}>{item.customerAddress}</Text>
            <Text style={[styles.meta, isRtl && styles.rtlText]}>
                {item.itemCount} {t('common.items')} • #{item.orderId}
            </Text>
        </TouchableOpacity>
    );

    // Loading state
    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={BRAND.colors.primary} />
                <Text style={styles.loadingText}>{t('common.loading')}</Text>
            </View>
        );
    }

    // Error state
    if (error && deliveries.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorEmoji}>⚠️</Text>
                <Text style={styles.errorText}>{t('common.error')}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadData}>
                    <Text style={styles.retryText}>{t('common.retry')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, isRtl && styles.rowReverse]}>
                <View>
                    <Text style={[styles.welcome, isRtl && styles.rtlText]}>
                        {t('common.welcome')}, {user?.name || 'Driver'}
                    </Text>
                    <Text style={[styles.deliveryCount, isRtl && styles.rtlText]}>
                        {activeCount} {t('driver.my_deliveries').toLowerCase()}
                    </Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <Text style={styles.logoutText}>{t('common.logout')}</Text>
                </TouchableOpacity>
            </View>

            {/* Delivery List or Empty State */}
            {deliveries.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyEmoji}>📦</Text>
                    <Text style={styles.emptyTitle}>{t('driver.no_deliveries')}</Text>
                    <Text style={styles.emptyDesc}>{t('driver.no_deliveries_desc')}</Text>
                </View>
            ) : (
                <FlatList
                    data={deliveries}
                    renderItem={renderDelivery}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BRAND.colors.primary} />}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F5F9' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9', padding: 24 },
    loadingText: { marginTop: 12, color: BRAND.colors.textSecondary, fontSize: 16 },
    errorEmoji: { fontSize: 48, marginBottom: 12 },
    errorText: { fontSize: 16, color: BRAND.colors.textSecondary, marginBottom: 16 },
    retryButton: { backgroundColor: BRAND.colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: BRAND.radius.sm },
    retryText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    rowReverse: { flexDirection: 'row-reverse' },
    welcome: { fontSize: 20, fontWeight: '700', color: BRAND.colors.textPrimary },
    deliveryCount: { fontSize: 14, color: BRAND.colors.textSecondary, marginTop: 2 },
    logoutBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: BRAND.radius.sm, backgroundColor: '#FEE2E2' },
    logoutText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
    list: { padding: 16, paddingBottom: 32 },
    card: { backgroundColor: '#fff', padding: 16, borderRadius: BRAND.radius.md, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    customerName: { fontSize: 16, fontWeight: '700', color: BRAND.colors.textPrimary, flex: 1 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeText: { fontSize: 12, fontWeight: '700' },
    address: { color: BRAND.colors.textSecondary, fontSize: 14, marginBottom: 6 },
    meta: { color: '#94A3B8', fontSize: 12 },
    rtlText: { textAlign: 'right' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    emptyEmoji: { fontSize: 64, marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: BRAND.colors.textPrimary, marginBottom: 4 },
    emptyDesc: { fontSize: 14, color: BRAND.colors.textSecondary, textAlign: 'center' },
});

import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import apiClient from '../../services/api';
import BarcodeScanner from '../../components/BarcodeScanner';
import { useLanguage } from '../../i18n/LanguageContext';
import BRAND from '../../config/brand';

interface Product { id: string; name: string; sku: string; price: number; stock: number; }

export default function ProductSearchScreen({ navigation, route }: any) {
    const { t, isRtl } = useLanguage();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);

    const searchProducts = useCallback(async (q: string) => {
        if (!q.trim()) return;
        setLoading(true);
        try {
            const res = await apiClient.get('/mobile/pos/products', { params: { search: q } });
            setResults(res.data?.data || res.data || []);
        } catch { setResults([]); }
        finally { setLoading(false); }
    }, []);

    const handleBarcodeScan = (data: string) => {
        setScanning(false);
        setQuery(data);
        searchProducts(data);
    };

    const addToCart = (product: Product) => {
        navigation.navigate('Cart', { addProduct: product });
    };

    return (
        <View style={styles.container}>
            <Modal visible={scanning} animationType="slide">
                <BarcodeScanner onScanned={handleBarcodeScan} onClose={() => setScanning(false)} />
            </Modal>

            {/* Search Bar */}
            <View style={[styles.searchRow, isRtl && styles.rowReverse]}>
                <TextInput
                    style={[styles.searchInput, isRtl && styles.rtlInput]}
                    placeholder={t('pos.search_placeholder')}
                    placeholderTextColor="#94A3B8"
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={() => searchProducts(query)}
                    returnKeyType="search"
                />
                <TouchableOpacity style={styles.scanBtn} onPress={() => setScanning(true)}>
                    <Text style={styles.scanIcon}>📷</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.searchButton} onPress={() => searchProducts(query)}>
                <Text style={styles.searchButtonText}>{t('common.search')}</Text>
            </TouchableOpacity>

            {/* Results */}
            {loading ? (
                <View style={styles.centerState}><ActivityIndicator size="large" color={BRAND.colors.secondary} /></View>
            ) : results.length === 0 && query ? (
                <View style={styles.centerState}>
                    <Text style={styles.emptyEmoji}>🔍</Text>
                    <Text style={styles.emptyText}>{t('pos.no_products')}</Text>
                </View>
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <View style={[styles.productCard, isRtl && styles.rowReverse]}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.productName, isRtl && styles.rtlText]}>{item.name}</Text>
                                <Text style={[styles.productSku, isRtl && styles.rtlText]}>SKU: {item.sku}</Text>
                                <Text style={styles.productStock}>{item.stock} {t('common.items')}</Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
                                <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}>
                                    <Text style={styles.addBtnText}>+ {t('pos.cart.add')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F5F9', padding: 16 },
    searchRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    rowReverse: { flexDirection: 'row-reverse' },
    searchInput: { flex: 1, backgroundColor: '#fff', padding: 14, borderRadius: BRAND.radius.sm, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 15 },
    rtlInput: { textAlign: 'right' },
    rtlText: { textAlign: 'right' },
    scanBtn: { backgroundColor: BRAND.colors.textPrimary, padding: 14, borderRadius: BRAND.radius.sm, justifyContent: 'center' },
    scanIcon: { fontSize: 22, color: '#fff' },
    searchButton: { backgroundColor: BRAND.colors.secondary, padding: 14, borderRadius: BRAND.radius.sm, alignItems: 'center', marginBottom: 16 },
    searchButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    centerState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyEmoji: { fontSize: 48, marginBottom: 8 },
    emptyText: { fontSize: 14, color: BRAND.colors.textSecondary },
    list: { paddingBottom: 32 },
    productCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: BRAND.radius.md, marginBottom: 10, justifyContent: 'space-between', alignItems: 'center' },
    productName: { fontSize: 16, fontWeight: '700', color: BRAND.colors.textPrimary },
    productSku: { fontSize: 12, color: BRAND.colors.textSecondary, marginTop: 2 },
    productStock: { fontSize: 12, color: BRAND.colors.primary, fontWeight: '600', marginTop: 4 },
    productPrice: { fontSize: 18, fontWeight: '800', color: BRAND.colors.textPrimary, marginBottom: 6 },
    addBtn: { backgroundColor: BRAND.colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: BRAND.radius.sm },
    addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});

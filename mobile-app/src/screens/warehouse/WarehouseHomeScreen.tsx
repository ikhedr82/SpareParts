import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { authService } from '../../services/auth';

export default function WarehouseHomeScreen({ navigation }: any) {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const userData = await authService.getUser();
        setUser(userData);
    };

    const handleLogout = async () => {
        await authService.logout();
        navigation.replace('WarehouseLogin');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcome}>Hi, {user?.name || 'Staff'}</Text>
                <TouchableOpacity onPress={handleLogout}>
                    <Text style={styles.logout}>Logout</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Operations</Text>

            <View style={styles.grid}>
                <TouchableOpacity
                    style={[styles.card, { backgroundColor: '#E3F2FD' }]}
                    onPress={() => navigation.navigate('PickList')}
                >
                    <Text style={styles.cardEmoji}>📋</Text>
                    <Text style={styles.cardTitle}>My Pick Lists</Text>
                    <Text style={styles.cardSub}>3 pending</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.card, { backgroundColor: '#E8F5E9' }]}
                    onPress={() => navigation.navigate('StockLookup')}
                >
                    <Text style={styles.cardEmoji}>🔍</Text>
                    <Text style={styles.cardTitle}>Stock Lookup</Text>
                    <Text style={styles.cardSub}>Scan barcode</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.card, { backgroundColor: '#FFF3E0' }]}
                    onPress={() => Alert.alert('Receiving', 'PO Receiving feature coming soon')}
                >
                    <Text style={styles.cardEmoji}>📦</Text>
                    <Text style={styles.cardTitle}> Receive PO</Text>
                    <Text style={styles.cardSub}>Scan incoming</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white', padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, paddingTop: 40 },
    welcome: { fontSize: 24, fontWeight: 'bold' },
    logout: { color: 'red', fontSize: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15, color: '#555' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    card: { width: '48%', padding: 20, borderRadius: 15, marginBottom: 15, alignItems: 'center', justifyContent: 'center', aspectRatio: 1 },
    cardEmoji: { fontSize: 40, marginBottom: 10 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
    cardSub: { fontSize: 12, color: '#666' },
});

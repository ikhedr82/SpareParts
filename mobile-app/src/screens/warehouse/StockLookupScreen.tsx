import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import BarcodeScanner from '../../components/BarcodeScanner';

export default function StockLookupScreen() {
    const [sku, setSku] = useState('');
    const [result, setResult] = useState<any>(null);
    const [scanning, setScanning] = useState(false);

    const handleScan = (data: string) => {
        setScanning(false);
        setSku(data);
        searchStock(data);
    };

    const searchStock = (query: string) => {
        // Mock Search Logic based on scanned data or text input
        if (query === 'BOSCH-123' || query.includes('123')) { // Loose match for demo
            setResult({
                name: 'Bosch Oil Filter',
                location: 'A-12-3',
                quantity: 45,
                price: '$12.99'
            });
        } else if (query === 'BREMBO-456' || query.includes('456')) {
            setResult({
                name: 'Brembo Brake Pads',
                location: 'B-04-1',
                quantity: 12,
                price: '$89.50'
            });
        } else {
            setResult(null);
            Alert.alert('Not Found', 'No product found with that SKU');
        }
    };

    return (
        <View style={styles.container}>
            <Modal visible={scanning} animationType="slide">
                <BarcodeScanner
                    onScanned={handleScan}
                    onClose={() => setScanning(false)}
                />
            </Modal>

            <Text style={styles.title}>Check Stock</Text>

            <View style={styles.searchBox}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter SKU or Scan"
                    value={sku}
                    onChangeText={setSku}
                />
                <TouchableOpacity style={styles.scanButton} onPress={() => setScanning(true)}>
                    <Text style={styles.scanText}>📷</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.searchButton} onPress={() => searchStock(sku)}>
                <Text style={styles.searchText}>Search</Text>
            </TouchableOpacity>

            {result && (
                <View style={styles.resultCard}>
                    <Text style={styles.productName}>{result.name}</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Location:</Text>
                        <Text style={styles.value}>{result.location}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>On Hand:</Text>
                        <Text style={[styles.value, { color: 'green' }]}>{result.quantity}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Price:</Text>
                        <Text style={styles.value}>{result.price}</Text>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    searchBox: { flexDirection: 'row', marginBottom: 15 },
    input: { flex: 1, backgroundColor: 'white', padding: 15, borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderWidth: 1, borderColor: '#ddd', fontSize: 16 },
    scanButton: { backgroundColor: '#333', padding: 15, borderTopRightRadius: 8, borderBottomRightRadius: 8, justifyContent: 'center' },
    scanText: { fontSize: 20, color: 'white' },
    searchButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 30 },
    searchText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    resultCard: { backgroundColor: 'white', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
    productName: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5 },
    label: { color: '#666', fontSize: 16 },
    value: { fontWeight: 'bold', fontSize: 16, color: '#333' }
});

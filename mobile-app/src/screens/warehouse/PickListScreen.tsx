import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const MOCK_PICK_LISTS = [
    { id: 'PL-1001', order: 'ORD-5521', items: 4, status: 'Pending', priority: 'High' },
    { id: 'PL-1002', order: 'ORD-5523', items: 2, status: 'In Progress', priority: 'Normal' },
    { id: 'PL-1003', order: 'ORD-5525', items: 8, status: 'Pending', priority: 'Low' },
];

export default function PickListScreen() {
    const [pickLists, setPickLists] = useState(MOCK_PICK_LISTS);

    const handlePick = (id: string) => {
        Alert.alert('Start Picking', `Starting pick list ${id}`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Start', onPress: () => console.log('Started') }
        ]);
    };

    const renderItem = ({ item }: any) => (
        <TouchableOpacity style={styles.card} onPress={() => handlePick(item.id)}>
            <View style={styles.header}>
                <Text style={styles.title}>{item.id}</Text>
                <Text style={[styles.priority, item.priority === 'High' ? styles.highPriority : styles.normalPriority]}>
                    {item.priority}
                </Text>
            </View>
            <Text style={styles.subtitle}>Order: {item.order}</Text>
            <View style={styles.footer}>
                <Text style={styles.items}>{item.items} Items</Text>
                <Text style={styles.status}>{item.status}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={pickLists}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
    list: { paddingBottom: 20 },
    card: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    title: { fontSize: 18, fontWeight: 'bold' },
    priority: { fontSize: 12, fontWeight: 'bold', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 10, overflow: 'hidden' },
    highPriority: { backgroundColor: '#FFEBEE', color: '#D32F2F' },
    normalPriority: { backgroundColor: '#E3F2FD', color: '#1976D2' },
    subtitle: { color: '#666', marginBottom: 10 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
    items: { fontWeight: '600' },
    status: { color: '#666' },
});

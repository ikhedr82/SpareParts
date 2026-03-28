import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Linking, Platform, TextInput } from 'react-native';
import { useLanguage } from '../../i18n/LanguageContext';
import apiClient from '../../services/api';
import BRAND from '../../config/brand';
import { SyncQueue } from '../../services/SyncQueue';
import { MediaSyncManager } from '../../services/MediaSyncManager';

type DeliveryStatus = 'ASSIGNED' | 'ACCEPTED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' | 'FAILED';

const STATUS_FLOW: Record<string, { next: DeliveryStatus; actionKey: string }> = {
    ASSIGNED: { next: 'ACCEPTED', actionKey: 'driver.actions.accept' },
    ACCEPTED: { next: 'PICKED_UP', actionKey: 'driver.actions.picked_up' },
    PICKED_UP: { next: 'IN_TRANSIT', actionKey: 'driver.actions.in_transit' },
    IN_TRANSIT: { next: 'DELIVERED', actionKey: 'driver.actions.mark_delivered' },
};

export default function DeliveryDetailScreen({ route, navigation }: any) {
    const { delivery } = route.params;
    const { t, isRtl } = useLanguage();
    const [status, setStatus] = useState<DeliveryStatus>(delivery.status);
    const [proofPhoto, setProofPhoto] = useState<string | null>(null);
    const [proofSignature, setProofSignature] = useState<string | null>(null);
    const [deliveryNotes, setDeliveryNotes] = useState('');
    const [updating, setUpdating] = useState(false);

    const handleStatusUpdate = async (newStatus: DeliveryStatus) => {
        if (newStatus === 'DELIVERED' && !proofPhoto && !proofSignature) {
            Alert.alert(t('driver.proof.title'), t('driver.proof.required'));
            return;
        }
        setUpdating(true);
        try {
            // If delivering with media, use dedicated media queue (it will update status when done)
            if (newStatus === 'DELIVERED' && (proofPhoto || proofSignature)) {
                if (proofPhoto) {
                    await MediaSyncManager.enqueueUpload(proofPhoto, 'image/jpeg', '/mobile/driver/upload', delivery.id, 'photo');
                }
                if (proofSignature) {
                    await MediaSyncManager.enqueueUpload(proofSignature, 'image/png', '/mobile/driver/upload', delivery.id, 'signature');
                }
                
                setStatus(newStatus);
                Alert.alert('✅', t('driver.actions.complete') + ' (Syncing offline)', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
                return;
            }

            // Standard Data Queue
            await SyncQueue.enqueue({
                type: 'STATUS_CHANGE',
                entity: 'TRIP',
                priority: 'MEDIUM',
                payload: { stopId: delivery.id, status: newStatus, notes: deliveryNotes },
                version: 1
            });
            
            setStatus(newStatus);
            if (newStatus === 'DELIVERED') {
                Alert.alert('✅', t('driver.actions.complete'), [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else if (newStatus === 'FAILED') {
                navigation.goBack();
            }
        } catch (err: any) {
            Alert.alert(t('common.error'), err.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleNavigate = () => {
        const address = encodeURIComponent(delivery.customerAddress);
        const url = Platform.OS === 'ios'
            ? `maps:?q=${address}`
            : `geo:0,0?q=${address}`;
        Linking.openURL(url).catch(() => {
            Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${address}`);
        });
    };

    const handleReportIssue = () => {
        Alert.alert(t('driver.issue.title'), '', [
            { text: t('driver.issue.customer_absent'), onPress: () => handleStatusUpdate('FAILED') },
            { text: t('driver.issue.wrong_address'), onPress: () => handleStatusUpdate('FAILED') },
            { text: t('driver.issue.damaged_goods'), onPress: () => handleStatusUpdate('FAILED') },
            { text: t('common.cancel'), style: 'cancel' },
        ]);
    };

    const handleCapturePhoto = () => {
        setProofPhoto('file:///mock/photo.jpg');
        Alert.alert('📷', t('driver.proof.photo_captured'));
    };

    const handleCaptureSignature = () => {
        setProofSignature('file:///mock/signature.png');
        Alert.alert('✍️', t('driver.proof.signature_captured'));
    };

    const currentAction = STATUS_FLOW[status];
    const isTerminal = status === 'DELIVERED' || status === 'CANCELLED' || status === 'FAILED';

    return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
            {/* Customer Info Card */}
            <View style={styles.card}>
                <Text style={[styles.sectionTitle, isRtl && styles.rtlText]}>{t('driver.customer')}</Text>
                <Text style={[styles.value, isRtl && styles.rtlText]}>{delivery.customerName}</Text>

                <Text style={[styles.label, isRtl && styles.rtlText]}>{t('common.address')}</Text>
                <Text style={[styles.value, isRtl && styles.rtlText]}>{delivery.customerAddress}</Text>

                {delivery.customerPhone ? (
                    <>
                        <Text style={[styles.label, isRtl && styles.rtlText]}>{t('common.phone')}</Text>
                        <TouchableOpacity onPress={() => Linking.openURL(`tel:${delivery.customerPhone}`)}>
                            <Text style={[styles.phoneLink, isRtl && styles.rtlText]}>{delivery.customerPhone}</Text>
                        </TouchableOpacity>
                    </>
                ) : null}

                <Text style={[styles.label, isRtl && styles.rtlText]}>{t('driver.order_items')}</Text>
                <Text style={[styles.value, isRtl && styles.rtlText]}>{delivery.itemCount} {t('common.items')}</Text>

                {delivery.notes ? (
                    <>
                        <Text style={[styles.label, isRtl && styles.rtlText]}>{t('driver.delivery_notes')}</Text>
                        <Text style={[styles.value, isRtl && styles.rtlText]}>{delivery.notes}</Text>
                    </>
                ) : null}
            </View>

            {/* Navigate Button */}
            <TouchableOpacity style={styles.navigateBtn} onPress={handleNavigate} activeOpacity={0.8}>
                <Text style={styles.navigateBtnText}>📍 {t('driver.open_maps')}</Text>
            </TouchableOpacity>

            {/* Proof of Delivery (show when IN_TRANSIT) */}
            {status === 'IN_TRANSIT' && (
                <View style={styles.card}>
                    <Text style={[styles.sectionTitle, isRtl && styles.rtlText]}>{t('driver.proof.title')}</Text>
                    <View style={styles.proofRow}>
                        <TouchableOpacity
                            style={[styles.proofButton, proofPhoto && styles.proofCaptured]}
                            onPress={handleCapturePhoto}
                        >
                            <Text style={styles.proofIcon}>📷</Text>
                            <Text style={styles.proofLabel}>
                                {proofPhoto ? t('driver.proof.photo_captured') : t('driver.proof.capture_photo')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.proofButton, proofSignature && styles.proofCaptured]}
                            onPress={handleCaptureSignature}
                        >
                            <Text style={styles.proofIcon}>✍️</Text>
                            <Text style={styles.proofLabel}>
                                {proofSignature ? t('driver.proof.signature_captured') : t('driver.proof.capture_signature')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={[styles.notesInput, isRtl && styles.rtlInput]}
                        placeholder={t('driver.proof.add_notes')}
                        placeholderTextColor="#94A3B8"
                        value={deliveryNotes}
                        onChangeText={setDeliveryNotes}
                        multiline
                        numberOfLines={3}
                    />
                </View>
            )}

            {/* Action Buttons */}
            {!isTerminal && (
                <View style={styles.actionsSection}>
                    {currentAction && (
                        <TouchableOpacity
                            style={[styles.primaryAction, updating && styles.actionDisabled]}
                            onPress={() => handleStatusUpdate(currentAction.next)}
                            disabled={updating}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.primaryActionText}>{t(currentAction.actionKey)}</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.issueAction} onPress={handleReportIssue} activeOpacity={0.8}>
                        <Text style={styles.issueActionText}>⚠️ {t('driver.actions.report_issue')}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Terminal state banner */}
            {isTerminal && (
                <View style={[styles.terminalBanner, status === 'DELIVERED' ? styles.successBanner : styles.failBanner]}>
                    <Text style={styles.terminalText}>
                        {status === 'DELIVERED' ? '✅' : '❌'} {t(`driver.status.${status}`)}
                    </Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: { flex: 1, backgroundColor: '#F1F5F9' },
    container: { padding: 16, paddingBottom: 40 },
    card: { backgroundColor: '#fff', padding: 20, borderRadius: BRAND.radius.md, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: BRAND.colors.textPrimary, marginBottom: 12 },
    label: { color: BRAND.colors.textSecondary, fontSize: 13, marginTop: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    value: { fontSize: 16, fontWeight: '500', color: BRAND.colors.textPrimary, marginTop: 2 },
    phoneLink: { fontSize: 16, fontWeight: '500', color: BRAND.colors.secondary, marginTop: 2, textDecorationLine: 'underline' },
    rtlText: { textAlign: 'right' },
    rtlInput: { textAlign: 'right' },
    navigateBtn: { backgroundColor: BRAND.colors.secondary, padding: 16, borderRadius: BRAND.radius.sm, alignItems: 'center', marginBottom: 12 },
    navigateBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    proofRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    proofButton: { flex: 1, backgroundColor: '#F1F5F9', padding: 16, borderRadius: BRAND.radius.sm, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
    proofCaptured: { borderColor: BRAND.colors.primary, backgroundColor: BRAND.colors.primary + '10' },
    proofIcon: { fontSize: 28, marginBottom: 6 },
    proofLabel: { fontSize: 13, fontWeight: '600', color: BRAND.colors.textSecondary, textAlign: 'center' },
    notesInput: { backgroundColor: '#F1F5F9', padding: 14, borderRadius: BRAND.radius.sm, fontSize: 15, color: BRAND.colors.textPrimary, minHeight: 80, textAlignVertical: 'top' },
    actionsSection: { marginTop: 8, gap: 10 },
    primaryAction: { backgroundColor: BRAND.colors.primary, padding: 18, borderRadius: BRAND.radius.sm, alignItems: 'center' },
    actionDisabled: { opacity: 0.6 },
    primaryActionText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    issueAction: { backgroundColor: '#FEF2F2', padding: 16, borderRadius: BRAND.radius.sm, alignItems: 'center' },
    issueActionText: { color: '#EF4444', fontSize: 16, fontWeight: '600' },
    terminalBanner: { padding: 20, borderRadius: BRAND.radius.md, alignItems: 'center', marginTop: 12 },
    successBanner: { backgroundColor: BRAND.colors.primary + '15' },
    failBanner: { backgroundColor: '#FEE2E2' },
    terminalText: { fontSize: 18, fontWeight: '700', color: BRAND.colors.textPrimary },
});

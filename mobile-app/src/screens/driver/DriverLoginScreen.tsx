import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { authService } from '../../services/auth';
import { useLanguage } from '../../i18n/LanguageContext';
import BRAND from '../../config/brand';

export default function DriverLoginScreen({ navigation }: any) {
    const { t, isRtl } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert(t('auth.login_failed'), t('auth.enter_credentials'));
            return;
        }
        setLoading(true);
        try {
            await authService.login(email, password);
            navigation.replace('DriverHome');
        } catch (error: any) {
            Alert.alert(t('auth.login_failed'), error.message || t('auth.invalid_credentials'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.logoSection}>
                <Text style={styles.brand}>{BRAND.name}</Text>
                <Text style={styles.subtitle}>{t('driver.app_title')}</Text>
            </View>

            <View style={styles.form}>
                <Text style={[styles.label, isRtl && styles.rtlText]}>{t('common.email')}</Text>
                <TextInput
                    style={[styles.input, isRtl && styles.rtlInput]}
                    placeholder="driver@example.com"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <Text style={[styles.label, isRtl && styles.rtlText]}>{t('common.password')}</Text>
                <TextInput
                    style={[styles.input, isRtl && styles.rtlInput]}
                    placeholder="••••••••"
                    placeholderTextColor="#94A3B8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>{t('auth.login')}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F8FAFC' },
    logoSection: { alignItems: 'center', marginBottom: 48 },
    brand: { fontSize: 36, fontWeight: '800', color: BRAND.colors.primary },
    subtitle: { fontSize: 16, color: BRAND.colors.textSecondary, marginTop: 4 },
    form: { gap: 4 },
    label: { fontSize: 14, fontWeight: '600', color: BRAND.colors.textPrimary, marginBottom: 6, marginTop: 12 },
    rtlText: { textAlign: 'right' },
    input: {
        backgroundColor: '#FFFFFF', padding: 14, borderRadius: BRAND.radius.sm,
        borderWidth: 1, borderColor: '#E2E8F0', fontSize: 16, color: BRAND.colors.textPrimary,
    },
    rtlInput: { textAlign: 'right' },
    button: {
        backgroundColor: BRAND.colors.primary, padding: 16, borderRadius: BRAND.radius.sm,
        alignItems: 'center', marginTop: 24,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});

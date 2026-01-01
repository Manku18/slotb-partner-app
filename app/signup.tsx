import { authService } from '@/services/api';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

// Simple custom card to replace GlassCard for stability
const SimpleCard = ({ children, style }: any) => (
    <View style={[{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 20 }, style]}>
        {children}
    </View>
);

export default function SignupScreen() {
    const router = useRouter();
    const { setAuthenticated } = useAppStore();
    const { colors } = useTheme();

    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');

    const [formData, setFormData] = useState({
        shop_name: '',
        owner_name: '',
        email: '',
        phone: '',
        password: '',
        address: '',
        district: '',
        pincode: '',
        latitude: '',
        longitude: ''
    });

    React.useEffect(() => {
        (async () => {
            try {
                setStatusMsg('Requesting Location...');
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setStatusMsg('Location denied. App may not work correctly.');
                    return;
                }

                let location = await Location.getCurrentPositionAsync({});
                setFormData(prev => ({
                    ...prev,
                    latitude: location.coords.latitude.toString(),
                    longitude: location.coords.longitude.toString()
                }));
                setStatusMsg(`Location found: ${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`);
            } catch (e) {
                setStatusMsg('Could not fetch location.');
            }
        })();
    }, []);

    const handleChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSignup = async () => {
        // Validation
        if (!formData.shop_name || !formData.email || !formData.password || !formData.phone) {
            Alert.alert('Missing Fields', 'Please fill in Name, Email, Phone, and Password.');
            return;
        }

        setLoading(true);
        setStatusMsg('Registering...');

        try {
            console.log("Submitting Signup:", formData);
            const response = await authService.signup(formData);
            console.log("Signup Result:", response);

            if (response.status === 'success') {
                const sid = response.shop_id;
                setAuthenticated(true, {
                    id: sid.toString(),
                    name: formData.owner_name,
                    shopName: formData.shop_name,
                    qrCode: response.qr_code,
                    upiId: '' // New shops won't have it yet
                });
                Alert.alert('Success', 'Shop registered successfully!', [
                    { text: 'Start App', onPress: () => router.replace('/(tabs)') }
                ]);
            } else {
                // Show specific server error
                Alert.alert('Signup Failed', response.message || 'Unknown server error');
            }
        } catch (error: any) {
            console.error("Signup Error:", error);
            Alert.alert('Network Error', error.message || 'Could not connect to server.');
        } finally {
            setLoading(false);
            setStatusMsg('');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#F8F9FA' }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.title}>New Partner Registration</Text>
                    </View>

                    {statusMsg ? <Text style={styles.statusText}>{statusMsg}</Text> : null}

                    <SimpleCard style={styles.card}>
                        <Text style={styles.sectionHeader}>Authentication</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Email Address"
                            value={formData.email}
                            onChangeText={v => handleChange('email', v)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number (Unique)"
                            value={formData.phone}
                            onChangeText={v => handleChange('phone', v)}
                            keyboardType="phone-pad"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            secureTextEntry
                            value={formData.password}
                            onChangeText={v => handleChange('password', v)}
                        />

                        <Text style={[styles.sectionHeader, { marginTop: 20 }]}>Business Details</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Shop Name"
                            value={formData.shop_name}
                            onChangeText={v => handleChange('shop_name', v)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Owner Name"
                            value={formData.owner_name}
                            onChangeText={v => handleChange('owner_name', v)}
                        />
                        <TextInput
                            style={[styles.input, { height: 60 }]}
                            placeholder="Full Address"
                            multiline
                            value={formData.address}
                            onChangeText={v => handleChange('address', v)}
                        />
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="District"
                                value={formData.district}
                                onChangeText={v => handleChange('district', v)}
                            />
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Pincode"
                                value={formData.pincode}
                                onChangeText={v => handleChange('pincode', v)}
                                keyboardType="numeric"
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.btn, { opacity: loading ? 0.7 : 1 }]}
                            onPress={handleSignup}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Register Shop</Text>}
                        </TouchableOpacity>

                    </SimpleCard>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    backButton: { padding: 8, marginRight: 10 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#111' },
    statusText: { textAlign: 'center', marginBottom: 10, color: '#666', fontSize: 12 },
    card: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
    sectionHeader: { fontSize: 14, fontWeight: '600', color: '#888', marginBottom: 10, textTransform: 'uppercase' },
    input: { backgroundColor: '#F0F2F5', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16, borderWidth: 1, borderColor: '#E5E7EB' },
    btn: { backgroundColor: '#2563EB', borderRadius: 30, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
    btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});

import { authService } from '@/services/api';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
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
    ActivityIndicator,
    ImageBackground,
    StatusBar,
    Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

const BG_IMAGE = require('@/assets/images/happy_duo_mobile.png');

export default function SignupScreen() {
    const router = useRouter();
    const { login } = useAppStore();
    const { colors } = useTheme();

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

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

    useEffect(() => {
        (async () => {
            try {
                setStatusMsg('Requesting Location for Verification...');
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setStatusMsg('Location required for shop verification.');
                    return;
                }

                let location = await Location.getCurrentPositionAsync({});
                setFormData(prev => ({
                    ...prev,
                    latitude: location.coords.latitude.toString(),
                    longitude: location.coords.longitude.toString()
                }));
                setStatusMsg(`Location Verified ✓`);
            } catch (e) {
                setStatusMsg('Could not fetch location.');
            }
        })();
    }, []);

    const handleChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSignup = async () => {
        setLoading(true);
        try {
            const response = await authService.signup(formData);
            if (response.status === 'success') {
                const sid = response.shop_id;
                // Generate fake authKey
                const authKey = `ak_${sid}_${Date.now().toString(36)}`;
                login({
                    id: sid.toString(),
                    name: formData.owner_name,
                    shopName: formData.shop_name,
                    qrCode: response.qr_code,
                    upiId: ''
                }, authKey);
                Alert.alert('Success', 'Account created!', [
                    { text: 'Go to Dashboard', onPress: () => router.replace('/(tabs)') }
                ]);
            } else {
                Alert.alert('Error', response.message || 'Signup failed');
            }
        } catch (error) {
            Alert.alert('Error', 'Network request failed');
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (
        key: keyof typeof formData,
        placeholder: string,
        icon: any,
        secure = false,
        keyboard: any = 'default',
        multiline = false
    ) => (
        <View style={styles.fieldContainer}>
            <View style={[
                styles.inputContainer,
                focusedInput === key && styles.inputFocused,
                multiline && { height: 80, alignItems: 'flex-start', paddingTop: 12 }
            ]}>
                <Ionicons
                    name={icon}
                    size={20}
                    color={focusedInput === key ? '#FFD700' : '#CCC'}
                    style={[styles.inputIcon, multiline && { marginTop: 4 }]}
                />
                <TextInput
                    style={[styles.input, multiline && { textAlignVertical: 'top' }]}
                    placeholder={placeholder}
                    placeholderTextColor="#999"
                    value={formData[key]}
                    onChangeText={v => handleChange(key, v)}
                    onFocus={() => setFocusedInput(key)}
                    onBlur={() => setFocusedInput(null)}
                    secureTextEntry={secure}
                    keyboardType={keyboard}
                    multiline={multiline}
                    autoCapitalize="none"
                />
            </View>
        </View>
    );

    return (
        <ImageBackground
            source={BG_IMAGE}
            style={{ flex: 1 }}
            resizeMode="cover"
        >
            <View style={styles.overlay} />
            <StatusBar barStyle="light-content" />

            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>New Partner Registration</Text>
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <Animated.View style={{ opacity: fadeAnim }}>

                            <GlassCard style={styles.formCard} variant="default">
                                <Text style={styles.sectionTitle}>Account Credentials</Text>
                                <View style={styles.inputGroup}>
                                    {renderInput('phone', 'Mobile Number', 'call-outline', false, 'phone-pad')}
                                    {renderInput('email', 'Email Address', 'mail-outline', false, 'email-address')}
                                    {renderInput('password', 'Create Password', 'lock-closed-outline', true)}
                                </View>

                                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Shop Details</Text>
                                <View style={styles.inputGroup}>
                                    {renderInput('shop_name', 'Salon / Parlour Name', 'business-outline')}
                                    {renderInput('owner_name', 'Owner Full Name', 'person-outline')}
                                    {renderInput('address', 'Full Address', 'location-outline', false, 'default', true)}

                                    <View style={{ flexDirection: 'row', gap: 12 }}>
                                        <View style={{ flex: 1 }}>{renderInput('district', 'City', 'map-outline')}</View>
                                        <View style={{ flex: 1 }}>{renderInput('pincode', 'Pincode', 'navigate-outline', false, 'numeric')}</View>
                                    </View>
                                </View>

                                {statusMsg ? (
                                    <View style={styles.statusBadge}>
                                        <Ionicons name="information-circle" size={16} color="#FFD700" />
                                        <Text style={styles.statusText}>{statusMsg}</Text>
                                    </View>
                                ) : null}

                                <TouchableOpacity
                                    style={styles.signupButton}
                                    onPress={handleSignup}
                                    disabled={loading}
                                    activeOpacity={0.9}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#000" />
                                    ) : (
                                        <>
                                            <Text style={styles.signupButtonText}>REGISTER SHOP</Text>
                                            <Ionicons name="checkmark-circle" size={24} color="#000" />
                                        </>
                                    )}
                                </TouchableOpacity>

                            </GlassCard>
                            <View style={{ height: 40 }} />
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 10,
    },
    backButton: {
        padding: 8,
        marginRight: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    formCard: {
        padding: 24,
        borderRadius: 24,
        backgroundColor: 'rgba(20, 20, 20, 0.4)',
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    sectionTitle: {
        color: '#FFD700',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 16,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    inputGroup: { gap: 16 },
    fieldContainer: { gap: 8 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 14,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        height: 52,
    },
    inputFocused: {
        borderColor: '#FFD700',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    inputIcon: { marginRight: 12 },
    input: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 15,
        height: '100%',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        padding: 10,
        borderRadius: 12,
        marginTop: 20,
        gap: 8,
    },
    statusText: {
        color: '#FFD700',
        fontSize: 13,
        fontWeight: '600',
    },
    signupButton: {
        marginTop: 24,
        height: 50,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#FFFFFF',
    },
    signupButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1.2,
    },
});

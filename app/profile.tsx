import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { user, setAuthenticated } = useAppStore();

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [shopName, setShopName] = useState(user?.shopName || '');
    const [upiId, setUpiId] = useState(user?.upiId || '');
    const [loading, setLoading] = useState(false);

    // Image states (base64)
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [paymentQrImage, setPaymentQrImage] = useState<string | null>(null);

    // Display URIs
    const [profileUri, setProfileUri] = useState<string | null>(user?.avatar || user?.image || null);
    const [paymentQrUri, setPaymentQrUri] = useState<string | null>(user?.paymentQr || null);

    const pickImage = async (type: 'profile' | 'qr') => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: type === 'profile' ? [1, 1] : [3, 4],
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
            if (type === 'profile') {
                setProfileImage(base64);
                setProfileUri(result.assets[0].uri);
            } else {
                setPaymentQrImage(base64);
                setPaymentQrUri(result.assets[0].uri);
            }
            if (!isEditing) setIsEditing(true);
        }
    };

    const handleSave = async () => {
        if (!user?.id) return;
        setLoading(true);
        const { apiService } = require('@/services/api');
        try {
            const updateData: any = {
                shop_name: shopName,
                owner_name: name,
                upi_id: upiId
            };
            if (profileImage) updateData.image_base64 = profileImage;
            if (paymentQrImage) updateData.payment_qr_base64 = paymentQrImage;

            const res = await apiService.updateProfile(user.id, updateData);
            if (res.status === 'success') {
                setIsEditing(false);
                // Update Store Locally
                if (user) {
                    const updatedUser = {
                        ...user,
                        name: name,
                        shopName: shopName,
                        upiId: upiId,
                        avatar: res.image || profileUri || user.avatar,
                        image: res.image || profileUri || user.image,
                        paymentQr: res.payment_qr || paymentQrUri || user.paymentQr
                    };
                    setAuthenticated(true, updatedUser);
                }
                Alert.alert('Success ✨', 'Profile and images updated successfully. Changes will reflect on the website immediately.');
            } else {
                Alert.alert('Error', res.message || 'Update failed');
            }
        } catch (error) {
            Alert.alert('Error', 'Could not sync with server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerTitles}>
                    <Text style={[styles.greeting, { color: colors.textSecondary }]}>Manage Shop</Text>
                    <Text style={[styles.shopName, { color: colors.textPrimary }]}>{shopName || 'Profile'}</Text>
                </View>
                {loading && <ActivityIndicator color={colors.primary} />}
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Profile Photo */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: profileUri || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (name || 'Partner') }}
                            style={styles.avatar}
                        />
                        <TouchableOpacity
                            style={[styles.cameraButton, { backgroundColor: colors.primary }]}
                            onPress={() => pickImage('profile')}
                        >
                            <Ionicons name="camera" size={16} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        onPress={isEditing ? handleSave : () => setIsEditing(true)}
                        disabled={loading}
                        style={[styles.editBadge, { backgroundColor: isEditing ? colors.primary : colors.surfaceHighlight }]}
                    >
                        <Ionicons name={isEditing ? "checkmark" : "pencil"} size={14} color={isEditing ? "#FFF" : colors.primary} />
                        <Text style={[styles.editBadgeText, { color: isEditing ? "#FFF" : colors.primary }]}>
                            {isEditing ? 'Save Changes' : 'Edit Profile'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Basic Details */}
                <View style={styles.formContainer}>
                    <InputGroup label="Owner Name" value={name} editable={isEditing} onChange={setName} colors={colors} />
                    <InputGroup label="Shop Name" value={shopName} editable={isEditing} onChange={setShopName} colors={colors} />
                    <InputGroup label="UPI ID" value={upiId} editable={isEditing} onChange={setUpiId} colors={colors} placeholder="yourname@upi" />
                </View>

                {/* Payment QR Section */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SHOP PAYMENT QR</Text>
                <GlassCard style={[styles.card, { padding: 16 }]}>
                    <View style={styles.qrSection}>
                        <View style={styles.qrInfo}>
                            <Text style={[styles.qrTitle, { color: colors.textPrimary }]}>Merchant QR Code</Text>
                            <Text style={[styles.qrDesc, { color: colors.textTertiary }]}>
                                Upload your shop's UPI QR code so customers can pay you directly from the SlotB app.
                            </Text>
                            <TouchableOpacity
                                style={[styles.uploadBtn, { borderColor: colors.primary, borderWidth: 1 }]}
                                onPress={() => pickImage('qr')}
                            >
                                <Ionicons name="cloud-upload-outline" size={18} color={colors.primary} />
                                <Text style={[styles.uploadBtnText, { color: colors.primary }]}>Change QR</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.qrImageContainer}>
                            {paymentQrUri ? (
                                <Image source={{ uri: paymentQrUri }} style={styles.paymentQrImage} />
                            ) : (
                                <View style={[styles.qrPlaceholder, { backgroundColor: colors.surfaceHighlight }]}>
                                    <Ionicons name="qr-code" size={40} color={colors.textTertiary} />
                                    <Text style={{ fontSize: 10, color: colors.textTertiary, marginTop: 4 }}>NO QR</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </GlassCard>

                {/* Account Security (Static) */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACCOUNT SECURITY</Text>
                <GlassCard style={styles.card}>
                    <View style={styles.row}>
                        <View style={styles.iconBox}>
                            <Ionicons name="finger-print" size={20} color={colors.primary} />
                        </View>
                        <View style={styles.rowText}>
                            <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Identity Status</Text>
                            <Text style={[styles.rowValue, { color: colors.textTertiary }]}>Verified Partner Account</Text>
                        </View>
                        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    </View>
                </GlassCard>

            </ScrollView>
        </SafeAreaView>
    );
}

const InputGroup = ({ label, value, editable, onChange, colors, placeholder = '', keyboardType = 'default' }: any) => (
    <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        <TextInput
            style={[
                styles.input,
                { color: colors.textPrimary, borderColor: editable ? colors.primary : colors.border, backgroundColor: editable ? colors.background : colors.surface }
            ]}
            value={value}
            onChangeText={onChange}
            editable={editable}
            placeholder={placeholder}
            placeholderTextColor={colors.textTertiary}
            keyboardType={keyboardType}
        />
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 12,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    headerTitles: {
        flex: 1,
        justifyContent: 'center',
    },
    greeting: {
        fontSize: 13,
        fontWeight: '500',
        lineHeight: 16,
        marginBottom: 2,
    },
    shopName: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
        lineHeight: 26,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    editBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 12,
    },
    editBadgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#FFF',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    formContainer: {
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 12,
        marginLeft: 4,
        letterSpacing: 1,
    },
    card: {
        padding: 0,
        marginBottom: 24,
        overflow: 'hidden',
    },
    qrSection: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'center',
    },
    qrInfo: {
        flex: 1,
    },
    qrTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    qrDesc: {
        fontSize: 12,
        lineHeight: 16,
        marginBottom: 12,
    },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
        alignSelf: 'flex-start',
    },
    uploadBtnText: {
        fontSize: 12,
        fontWeight: '700',
    },
    qrImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 12,
        overflow: 'hidden',
    },
    paymentQrImage: {
        width: '100%',
        height: '100%',
    },
    qrPlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        justifyContent: 'space-between',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    rowText: {
        flex: 1,
    },
    rowLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    rowValue: {
        fontSize: 12,
        marginTop: 2,
    },
});

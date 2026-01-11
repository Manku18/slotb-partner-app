import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    ImageBackground,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BG_IMAGE = require('@/assets/images/happy_duo_mobile.png');

export default function WelcomeScreen() {
    const router = useRouter();
    const { colors } = useTheme();

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleSocialClick = (provider: string) => {
        // Safe handler - does not bypass auth
        Alert.alert(
            `${provider} Login`,
            "Social login is not yet configured with API keys. Please use Phone/Email login."
        );
    };

    return (
        <ImageBackground
            source={BG_IMAGE}
            style={{ flex: 1 }}
            resizeMode="cover"
        >
            <View style={styles.overlay} />
            <StatusBar barStyle="light-content" />

            <SafeAreaView style={styles.container}>
                <Animated.View
                    style={[
                        styles.content,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    {/* Brand Presentation - MOVED TO TOP */}
                    <View style={styles.brandSection}>
                        <Text style={styles.brandText}>SlotB.in</Text>
                        <Text style={styles.tagline}>PARTNER</Text>
                        <View style={styles.separator} />
                    </View>

                    {/* Main Actions - At Bottom */}
                    <View style={styles.actionsContainer}>

                        {/* LOGIN - Dominant */}
                        <View style={styles.mainActionBlock}>
                            <Text style={styles.actionHeader}>Already a Partner?</Text>
                            <TouchableOpacity
                                style={[styles.primaryButton, { backgroundColor: '#FFFFFF' }]} // White Premium
                                activeOpacity={0.8}
                                onPress={() => router.push('/login')}
                            >
                                <View style={styles.btnContent}>
                                    <Text style={styles.primaryButtonText}>LOGIN</Text>
                                    <Ionicons name="arrow-forward" size={24} color="#000" />
                                </View>
                                {/* Glossy Overlay */}
                                <View style={styles.glossOverlay} />
                            </TouchableOpacity>
                        </View>

                        {/* REGISTER - Secondary */}
                        <View style={styles.secondaryActionBlock}>
                            <Text style={styles.actionHeaderSmall}>New to SlotB?</Text>
                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => router.push('/signup')}
                            >
                                <Text style={styles.secondaryButtonText}>Create New Account</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Social Divider */}
                        <View style={styles.dividerRow}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR LOGIN WITH</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Buttons (Monochrome Glass) */}
                        <View style={styles.socialContainer}>
                            <TouchableOpacity
                                style={styles.socialBtn}
                                onPress={() => handleSocialClick('Google')}
                            >
                                <Ionicons name="logo-google" size={20} color="#FFF" />
                                <Text style={styles.socialText}>Google</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.socialBtn}
                                onPress={() => handleSocialClick('Facebook')}
                            >
                                <Ionicons name="logo-facebook" size={20} color="#FFF" />
                                <Text style={styles.socialText}>Facebook</Text>
                            </TouchableOpacity>
                        </View>

                    </View>

                </Animated.View>
            </SafeAreaView>

            {/* Footer Trust Badge */}
            <View style={styles.footer}>
                <Ionicons name="shield-checkmark" size={14} color="#FFD700" />
                <Text style={styles.footerText}>Secure & Trusted Platform</Text>
            </View>

        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)', // Slightly lighter to see BG better
    },
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between', // Pushes Brand to Top, Actions to Bottom
        paddingBottom: 70, // Space for footer
    },

    // Brand
    // Brand
    brandSection: {
        alignItems: 'center',
        marginTop: Platform.OS === 'android' ? '20%' : '15%', // Shifted down another 5%
    },
    brandText: {
        fontSize: 56, // Larger
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -1,
        fontStyle: 'italic',
        textShadowColor: 'rgba(255, 215, 0, 0.8)', // Gold Shadow
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 15,
        lineHeight: 60, // Tighten line height
        marginBottom: -5, // Pull tagline closer
    },
    tagline: {
        fontSize: 22,
        color: '#FFD700', // Bright Gold
        letterSpacing: 6,
        textTransform: 'uppercase',
        fontWeight: '800', // Bolder
        marginTop: 0,
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    // Decorative Element (enhancing UI with clear space)
    separator: {
        width: 60,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#FFD700',
        marginTop: 24,
        opacity: 0.8,
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 10,
        shadowOpacity: 0.5,
    },

    // Vertical Connector
    connectorContainer: {
        flex: 1, // Fill available space
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    connectorLine: {
        width: 1.5,
        flex: 1,
        backgroundColor: 'rgba(255, 215, 0, 0.3)', // Subtle Gold Line
        borderRadius: 1,
    },
    premiumBadge: {
        width: 60,
        height: 60,
        borderRadius: 30, // Circle
        backgroundColor: 'rgba(20, 20, 20, 0.6)', // Glass Dark
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.5)', // Gold Border
        marginVertical: 4,
        shadowColor: '#FFD700',
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 15,
        elevation: 10,
    },

    // Feature List
    featuresContainer: {
        marginTop: 20,
        gap: 16,
        paddingHorizontal: 20,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)', // Very subtle backing for readability
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    featureIconBox: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    featureText: {
        color: '#E0E0E0',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.5,
    },

    // Actions
    actionsContainer: {
        gap: 20,
        padding: 24,
        borderRadius: 30,
        backgroundColor: 'rgba(20, 20, 20, 0.4)', // Increased Transparency (0.6 -> 0.4)
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.2)', // Softer border
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 15,
    },

    // Action Headers
    actionHeader: {
        color: '#E2E8F0',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    actionHeaderSmall: {
        color: '#9CA3AF',
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 8,
        textAlign: 'center',
    },

    // Main Login Block
    mainActionBlock: {
        // gap handled by margin in header
    },
    primaryButton: {
        height: 50,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6, // Reduced elevation
        shadowColor: '#FFFFFF',
        shadowOpacity: 0.25, // Reduced glow (0.5 -> 0.25)
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8, // Reduced spread
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
        overflow: 'hidden',
        position: 'relative',
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        zIndex: 2,
    },
    glossOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: 'rgba(255,255,255,0.3)', // Stronger Gloss
        zIndex: 1,
    },
    primaryButtonText: {
        color: '#000', // Black text on Gold for contrast
        fontSize: 16, // Reduced from 20
        fontWeight: '900',
        letterSpacing: 1.2,
    },

    // Secondary Register Block
    secondaryActionBlock: {
        alignItems: 'center',
        marginTop: 8,
    },
    secondaryButton: {
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // More visible glass
    },
    secondaryButtonText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    // Divider
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
        opacity: 0.6,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    dividerText: {
        color: '#94A3B8',
        fontSize: 11,
        fontWeight: '700',
        marginHorizontal: 16,
        letterSpacing: 1,
    },

    // Social
    socialContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    socialBtn: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: 'rgba(255,255,255,0.08)', // Glass
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    socialText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 20,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    footerText: {
        color: '#FFD700', // Bright Gold
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
    },

});

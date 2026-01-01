import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const PLANS = [
    {
        id: 'free',
        name: 'Free',
        price: '$0',
        period: '/mo',
        features: [
            { text: 'Basic features', included: true },
            { text: 'Limited clients', included: false },
        ],
        buttonText: 'Current Plan',
        recommended: false,
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$29',
        period: '/mo',
        features: [
            { text: 'Advanced tools', included: true },
            { text: 'Unlimited clients', included: true },
            { text: 'Priority support', included: false },
        ],
        buttonText: 'Upgrade to Pro',
        recommended: true,
    },
    {
        id: 'premium',
        name: 'Premium',
        price: '$99',
        period: '/mo',
        features: [
            { text: 'All Pro features', included: true },
            { text: 'Dedicated account manager', included: true },
            { text: 'Custom integrations', included: false },
        ],
        buttonText: 'Get Premium',
        recommended: false,
    },
];

export function PricingSection() {
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <Text style={[styles.header, { color: colors.textSecondary }]}>CHOOSE YOUR PARTNER PLAN</Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                decelerationRate="fast"
                snapToInterval={width * 0.7 + 24} // card width + margin
            >
                {PLANS.map((plan) => (
                    <View key={plan.id} style={styles.cardWrapper}>
                        {plan.recommended ? (
                            <LinearGradient
                                colors={['#4F46E5', '#9333EA']} // Blue to Purple gradient
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.gradientBorder}
                            >
                                <View style={styles.recommendedBadge}>
                                    <Text style={styles.recommendedText}>Recommended</Text>
                                </View>
                                <GlassCard style={[styles.card, styles.highlightedCard]} variant="default">
                                    <PlanContent plan={plan} colors={colors} isHighlighted={true} />
                                </GlassCard>
                            </LinearGradient>
                        ) : (
                            <GlassCard style={styles.card} variant="default">
                                <PlanContent plan={plan} colors={colors} isHighlighted={false} />
                            </GlassCard>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

function PlanContent({ plan, colors, isHighlighted }: { plan: typeof PLANS[0], colors: any, isHighlighted: boolean }) {
    return (
        <>
            <Text style={[styles.planName, { color: colors.textPrimary }]}>{plan.name}</Text>
            <View style={styles.priceContainer}>
                <Text style={[styles.price, { color: colors.textPrimary }]}>{plan.price}</Text>
                <Text style={[styles.period, { color: colors.textSecondary }]}>{plan.period}</Text>
            </View>

            <View style={styles.featuresList}>
                {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                        <Ionicons
                            name={feature.included ? "checkmark" : "close"}
                            size={18}
                            color={feature.included ? (isHighlighted ? '#60A5FA' : colors.textSecondary) : colors.textTertiary}
                        />
                        <Text style={[
                            styles.featureText,
                            { color: feature.included ? colors.textPrimary : colors.textTertiary }
                        ]}>
                            {feature.text}
                        </Text>
                    </View>
                ))}
            </View>

            <TouchableOpacity
                style={[
                    styles.button,
                    isHighlighted ? styles.primaryButton : { borderColor: colors.border, borderWidth: 1 }
                ]}
            >
                <Text style={[
                    styles.buttonText,
                    isHighlighted ? { color: '#000' } : { color: colors.textSecondary }
                ]}>
                    {plan.buttonText}
                </Text>
            </TouchableOpacity>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    header: {
        paddingHorizontal: 20,
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20, // Space for shadows
    },
    cardWrapper: {
        marginRight: 16,
        width: width * 0.7,
    },
    card: {
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        height: 380,
        justifyContent: 'space-between',
    },
    gradientBorder: {
        borderRadius: 26,
        padding: 2, // Border width effect
        marginBottom: -2, // Offset padding for layout
    },
    highlightedCard: {
        // Optional: add specific background if needed, leveraging GlassCard transparency
    },
    recommendedBadge: {
        position: 'absolute',
        top: -12,
        alignSelf: 'center',
        backgroundColor: '#E0E7FF',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 10,
    },
    recommendedText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4338CA',
    },
    planName: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 8,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 24,
    },
    price: {
        fontSize: 42,
        fontWeight: '800',
    },
    period: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 4,
    },
    featuresList: {
        width: '100%',
        gap: 12,
        flex: 1,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    featureText: {
        fontSize: 14,
        fontWeight: '500',
    },
    button: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 16,
    },
    primaryButton: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#FFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '700',
    },
});

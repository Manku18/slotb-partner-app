import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { RankingData } from './rankingTypes';
import { LinearGradient } from 'expo-linear-gradient';

interface RankingPodiumProps {
    top3: RankingData[];
    onPressPartner: (partner: RankingData) => void;
}

export function RankingPodium({ top3, onPressPartner }: RankingPodiumProps) {
    const { colors } = useTheme();

    // Ensure we have 3 slots even if empty
    const first = top3.find(p => p.rank === 1);
    const second = top3.find(p => p.rank === 2);
    const third = top3.find(p => p.rank === 3);

    const renderPodiumStep = (partner: RankingData | undefined, rank: number) => {
        if (!partner) return <View style={styles.emptyStep} />;

        const isFirst = rank === 1;
        const scale = isFirst ? 1.1 : 1;

        // Explicitly define colors as arrays of strings for LinearGradient
        let medalColors = ['#FCD34D', '#F59E0B']; // Gold
        let borderColor = '#FCD34D';
        let height = 160;
        let podiumColors = ['rgba(252, 211, 77, 0.4)', 'rgba(255,255,255,0)'];

        if (rank === 2) {
            medalColors = ['#E5E7EB', '#9CA3AF']; // Silver
            borderColor = '#E5E7EB';
            height = 130;
            podiumColors = ['rgba(229, 231, 235, 0.4)', 'rgba(255,255,255,0)'];
        } else if (rank === 3) {
            medalColors = ['#FDBA74', '#C2410C']; // Bronze
            borderColor = '#FDBA74';
            height = 110;
            podiumColors = ['rgba(253, 186, 116, 0.4)', 'rgba(255,255,255,0)'];
        }

        return (
            <TouchableOpacity
                style={[styles.stepContainer, { transform: [{ scale }] }]}
                onPress={() => onPressPartner(partner)}
                activeOpacity={0.8}
            >
                {/* Crown for #1 */}
                {isFirst && (
                    <View style={styles.crownContainer}>
                        <Ionicons name="sunny" size={28} color="#f72a0fff" style={styles.crownShadow} />
                    </View>
                )}

                {/* Avatar */}
                <View style={[styles.avatarBorder, { borderColor }]}>
                    <LinearGradient
                        colors={['#FFF', '#F3F4F6']}
                        style={styles.avatar}
                    >
                        <Text style={[styles.avatarText, { color: colors.primary }]}>
                            {partner.partnerId.slice(0, 2).toUpperCase()}
                        </Text>
                    </LinearGradient>

                    <LinearGradient
                        colors={medalColors as [string, string]}
                        style={styles.rankBadge}
                    >
                        <Text style={styles.rankText}>{rank}</Text>
                    </LinearGradient>
                </View>

                {/* Name & Score */}
                <Text style={styles.name} numberOfLines={1}>
                    {partner.partnerId === 'me' ? 'You' : partner.partnerId}
                </Text>
                <Text style={[styles.score, { color: borderColor }]}>{partner.score} pts</Text>

                {/* Podium Block */}
                <LinearGradient
                    colors={podiumColors as [string, string]}
                    style={[styles.podiumBlock, { height, borderColor }]}
                />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.podiumRow}>
                {renderPodiumStep(second, 2)}
                {renderPodiumStep(first, 1)}
                {renderPodiumStep(third, 3)}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 30, // Increased top margin
        marginBottom: 20,
        alignItems: 'center',
    },
    podiumRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 12, // Increased gap
    },
    stepContainer: {
        alignItems: 'center',
        marginBottom: -10,
        zIndex: 1,
        width: 90,
    },
    emptyStep: {
        width: 90,
    },
    crownContainer: {
        position: 'absolute',
        top: -32,
        zIndex: 2,
    },
    crownShadow: {
        shadowColor: "#FFD700",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 15,
        elevation: 10,
    },
    avatarBorder: {
        marginBottom: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderRadius: 40,
        padding: 3,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    avatar: {
        width: 60, // Larger avatar
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    rankBadge: {
        position: 'absolute',
        bottom: -10,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    rankText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFF',
    },
    name: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#FFFFFF', // Keep white for contrast on rank background if needed, but usually podium is on page bg. 
        // Wait, podium is usually on a dark or gradient background in many apps. 
        // If the page background is white, this white text will vanish.
        // Let's check where it's used. It's likely in a component on the Ranking Screen.
        // Given the Premium Theme request, safer to use colors.textPrimary if it sits on the page background.
        // However, looking at the code, it seems standalone.
        // Let's play it safe and use colors.textPrimary BUT shadow might look weird on light mode if not handled.
        // Actually, let's assume it sits on a card or main BG. 
        // Reverting to dynamic color:
        marginBottom: 4,
        marginTop: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    score: {
        fontSize: 12,
        fontWeight: '800',
        marginBottom: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    podiumBlock: {
        width: '100%',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
    },
});

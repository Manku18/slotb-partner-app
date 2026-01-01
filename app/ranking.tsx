import { LeaderboardCard } from '@/components/dashboard/LeaderboardCard';
import { ShopLeaderboard } from '@/components/dashboard/ShopLeaderboard';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RankingScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { partners } = useAppStore();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerTitles}>
                    <Text style={[styles.greeting, { color: colors.textSecondary }]}>Performance</Text>
                    <Text style={[styles.shopName, { color: colors.textPrimary }]}>Rankings</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/notifications')} style={[styles.bellButton, { backgroundColor: colors.surface }]}>
                    <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.contentWrapper}>
                    {/* Employee Ranking - Priority */}
                    <LeaderboardCard employees={partners || []} />

                    <View style={styles.spacer} />

                    {/* Shop Ranking with Locked Background */}
                    <View style={styles.shopRankingContainer}>
                        <View style={styles.blurredBackground}>
                            {[1, 2, 3].map((i) => (
                                <View key={i} style={[styles.dummyRow, { borderBottomColor: colors.border }]}>
                                    <View style={styles.dummyRank} />
                                    <View style={styles.dummyName} />
                                    <View style={styles.dummyScore} />
                                </View>
                            ))}
                        </View>
                        <ShopLeaderboard />
                    </View>

                    <Text style={[styles.infoText, { color: colors.textTertiary }]}>
                        Shop rankings are calculated based on city-wide performance. Staff rankings are internal.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

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
        backgroundColor: 'rgba(0,0,0,0.05)', // Subtle background for touch target visibility
    },
    headerTitles: {
        flex: 1,
        justifyContent: 'center',
    },
    greeting: {
        fontSize: 13, // Slightly larger for readability
        fontWeight: '500',
        lineHeight: 16,
        marginBottom: 2,
    },
    shopName: {
        fontSize: 22, // Slightly larger for prominence
        fontWeight: '800',
        letterSpacing: -0.5,
        lineHeight: 26,
    },
    bellButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    contentWrapper: {
        flex: 1,
        padding: 20,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    spacer: {
        height: 24,
    },
    shopRankingContainer: {
        position: 'relative',
    },
    blurredBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        padding: 20,
        opacity: 0.2,
    },
    dummyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        justifyContent: 'space-between',
    },
    dummyRank: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#CBD5E1',
    },
    dummyName: {
        width: '50%',
        height: 16,
        borderRadius: 4,
        backgroundColor: '#E2E8F0',
    },
    dummyScore: {
        width: '20%',
        height: 16,
        borderRadius: 4,
        backgroundColor: '#E2E8F0',
    },
    infoText: {
        marginTop: 24,
        textAlign: 'center',
        fontSize: 12,
        lineHeight: 18,
        paddingHorizontal: 20,
    },
});

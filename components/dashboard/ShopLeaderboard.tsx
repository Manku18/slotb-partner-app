import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type LeaderboardTab = 'Today' | 'Week' | 'Month' | 'Year';

interface ShopLeaderboardProps {
    isOpen?: boolean;
}

export function ShopLeaderboard({ isOpen = true }: ShopLeaderboardProps) {
    const { colors } = useTheme();
    const router = useRouter();
    const [selectedTab, setSelectedTab] = useState<LeaderboardTab>('Today');

    const tabs: LeaderboardTab[] = ['Today', 'Week', 'Month', 'Year'];

    return (
        <GlassCard variant="default" style={styles.cardOverride}>
            <View style={styles.container}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.titleRow}>
                        <Ionicons name="trophy" size={20} color="#1F2937" />
                        <Text style={[styles.title, { color: '#1F2937' }]}>Shop Ranking</Text>
                    </View>
                    <View style={[styles.rankBadge, { backgroundColor: '#FEF9C3' }]}>
                        <Text style={[styles.rankText, { color: '#CA8A04' }]}>#45</Text>
                    </View>
                    {/* Status Badge */}
                    <View style={[styles.statusBadge, { backgroundColor: isOpen ? '#DCFCE7' : '#FEE2E2' }]}>
                        <Text style={[styles.statusText, { color: isOpen ? '#166534' : '#991B1B' }]}>
                            {isOpen ? 'OPEN' : 'CLOSED'}
                        </Text>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tab,
                                selectedTab === tab && styles.activeTab
                            ]}
                            onPress={() => setSelectedTab(tab)}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    selectedTab === tab ? styles.activeTabText : styles.inactiveTabText
                                ]}
                            >
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Locked Content Area */}
                <View style={styles.contentContainer}>
                    <View style={styles.lockCircle}>
                        <Ionicons name="lock-closed" size={32} color="#1F2937" />
                    </View>

                    <Text style={styles.lockedTitle}>Unlock Your Ranking</Text>

                    <Text style={styles.lockedSubtext}>
                        See where you stand in {selectedTab} matches against other shops in your Area & City.
                    </Text>

                    <TouchableOpacity
                        style={[styles.showRankButton, { backgroundColor: '#1F2937' }]}
                        onPress={() => router.push('/?scrollTo=pricing')}
                    >
                        <Text style={styles.showRankButtonText}>Show Rank</Text>
                        <Ionicons name="arrow-forward" size={18} color="#FFF" />
                    </TouchableOpacity>
                </View>

            </View>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    cardOverride: {
        padding: 0,
        marginBottom: 16,
        backgroundColor: '#FEFCE8',
        borderColor: '#FEF08A',
        borderWidth: 1,
    },
    container: {
        padding: 16, // Reduced from 20
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16, // Reduced from 24
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 16, // Reduced from 18
        fontWeight: '700',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        padding: 3,
        marginBottom: 20, // Reduced from 40
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8, // Reduced from 10
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#1F2937',
    },
    tabText: {
        fontSize: 12, // Reduced from 13
        fontWeight: '600',
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    inactiveTabText: {
        color: '#9CA3AF',
    },
    contentContainer: {
        alignItems: 'center',
        paddingBottom: 10, // Reduced from 20
    },
    lockCircle: {
        width: 60, // Reduced from 80
        height: 60, // Reduced from 80
        borderRadius: 30,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12, // Reduced from 20
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    lockedTitle: {
        fontSize: 18, // Reduced from 20
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 8, // Reduced from 12
        textAlign: 'center',
    },
    lockedSubtext: {
        fontSize: 13, // Reduced from 14
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 18, // Reduced from 22
        paddingHorizontal: 15, // Reduced from 20
        marginBottom: 20, // Reduced from 32
    },
    showRankButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingVertical: 14, // Reduced from 16
        borderRadius: 12,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    showRankButtonText: {
        color: '#FFFFFF',
        fontSize: 15, // Reduced from 16
        fontWeight: '700',
    },
    rankBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    rankText: {
        fontWeight: '800',
        fontSize: 11, // Reduced from 12
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginLeft: 'auto',
    },
    statusText: {
        fontWeight: '700',
        fontSize: 10,
        letterSpacing: 0.5,
    },
});

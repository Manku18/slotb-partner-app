import { RankingPodium } from '@/components/ranking/RankingPodium';
import { RankingBreakdownCard } from '@/components/ranking/RankingBreakdownCard';
import { useRanking } from '@/components/ranking/useRanking';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState, useMemo, useRef } from 'react';
import {
    StyleSheet, Text, TouchableOpacity, View, Modal, Pressable,
    FlatList, Dimensions, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RankingData, RankingPeriod } from '@/components/ranking/rankingTypes';
import { LinearGradient } from 'expo-linear-gradient';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function RankingScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const {
        myRanking,
        leaderboard,
        isEligible,
        period,
        setPeriod
    } = useRanking();

    const [selectedPartner, setSelectedPartner] = useState<RankingData | null>(null);
    const [isFooterVisible, setIsFooterVisible] = useState(true);

    const tabs: RankingPeriod[] = ['today', 'week', 'month', 'year'];

    // Data Splitting
    const top3 = useMemo(() => leaderboard ? leaderboard.slice(0, 3) : [], [leaderboard]);
    const restOfList = useMemo(() => leaderboard ? leaderboard.slice(3) : [], [leaderboard]);

    // Viewability Config (Refs)
    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 10
    }).current;

    // Correctly using useRef for the callback to ensure stable identity
    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (!myRanking) return;
        // Check if "Me" is in the visible list items
        const isMeVisible = viewableItems.some((item: any) => item.item.partnerId === myRanking.partnerId);
        // If visible, HIDE footer. If not visible, SHOW footer.
        setIsFooterVisible(!isMeVisible);
    }).current;

    // Render List Item
    const renderRankItem = ({ item, index }: { item: RankingData, index: number }) => {
        const rank = index + 4; // Since we skip top 3
        const isMe = item.partnerId === myRanking?.partnerId;

        return (
            <TouchableOpacity
                style={[
                    styles.rankRow,
                    isMe && styles.meRowGlow
                ]}
                onPress={() => setSelectedPartner(item)}
                activeOpacity={0.7}
            >
                <View style={styles.listRankBadge}>
                    <Text style={[
                        styles.listRank,
                        isMe && {
                            color: '#FFD700', // Gold for user
                            textShadowColor: 'rgba(255, 215, 0, 0.5)',
                            textShadowOffset: { width: 0, height: 0 },
                            textShadowRadius: 8,
                            fontSize: 18 // Slightly bigger
                        }
                    ]}>{rank}</Text>
                </View>

                <View style={[styles.listAvatar, isMe && { borderColor: '#4F46E5', borderWidth: 2 }]}>
                    <Text style={[styles.listAvatarText, isMe && { color: '#4F46E5' }]}>
                        {item.partnerId.slice(0, 1).toUpperCase()}
                    </Text>
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={[styles.listName, { color: '#111827', fontWeight: isMe ? '800' : '600' }]}>
                        {isMe ? 'You' : `Salon Partner ${item.partnerId.slice(-3)}`}
                    </Text>
                    <Text style={[styles.listDetails, { color: '#6B7280' }]}>
                        {item.performance.completedBookings} bookings
                    </Text>
                </View>

                <View style={styles.listScoreCol}>
                    <Text style={[styles.listScore, { color: isMe ? '#4F46E5' : '#111827' }]}>{item.score}</Text>
                    <Text style={[styles.listPts, { color: '#6B7280' }]}>pts</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#4F46E5' }}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />

            {/* Background Gradient */}
            <LinearGradient
                colors={['#4F46E5', '#312E81']} // Indigo to Deep Indigo
                style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Leaderboard</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Tab Selector */}
                <View style={styles.tabBar}>
                    {tabs.map(t => (
                        <TouchableOpacity
                            key={t}
                            style={[styles.tab, period === t && styles.activeTab]}
                            onPress={() => setPeriod(t)}
                        >
                            <Text style={[styles.tabText, period === t && styles.activeTabText]}>
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Main Content */}
                <FlatList
                    data={restOfList}
                    keyExtractor={(item) => item.partnerId}
                    renderItem={renderRankItem}
                    ListHeaderComponent={
                        <>
                            <RankingPodium top3={top3} onPressPartner={setSelectedPartner} />
                            <View style={styles.listHeaderSpacing} />
                        </>
                    }
                    contentContainerStyle={{ paddingBottom: 100 }}
                    style={styles.flatList}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                />

                {/* Sticky Footer (Your Rank) */}
                {isEligible && myRanking && isFooterVisible && (
                    <View style={[styles.stickyFooterContainer]}>
                        <GlassCard style={[styles.stickyFooter, { borderColor: 'rgba(255,255,255,0.2)' }]}>
                            <View style={styles.footerRow}>
                                <View style={styles.footerRankBadge}>
                                    <Text style={styles.footerRankText}>#{myRanking.rank}</Text>
                                </View>
                                <View style={styles.footerInfo}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <Text style={[styles.footerName, { color: '#000' }]}>You</Text>
                                        <View style={styles.meBadge}>
                                            <Text style={styles.meBadgeText}>ME</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={() => setSelectedPartner(myRanking)}>
                                        <Text style={{ color: '#4F46E5', fontSize: 11, fontWeight: '700', marginTop: 2 }}>
                                            View Details
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={[styles.footerScore, { color: '#4F46E5' }]}>{myRanking.score} pts</Text>
                                </View>
                            </View>
                        </GlassCard>
                    </View>
                )}
            </SafeAreaView>

            {/* Breakdown Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={!!selectedPartner}
                onRequestClose={() => setSelectedPartner(null)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setSelectedPartner(null)}>
                    <Pressable style={[styles.modalCard, { backgroundColor: '#FFF' }]} onPress={() => { }}>
                        <View style={styles.modalHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <View style={styles.modalAvatar}>
                                    <Text style={styles.modalAvatarText}>{selectedPartner?.partnerId.slice(0, 1).toUpperCase()}</Text>
                                </View>
                                <View>
                                    <Text style={[styles.modalTitle, { color: '#111827' }]}>
                                        {selectedPartner?.partnerId === myRanking?.partnerId ? 'Your Performance' : selectedPartner?.partnerId.slice(0, 5) + '...'}
                                    </Text>
                                    <Text style={{ color: '#6B7280', fontSize: 12 }}>Score Breakdown</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setSelectedPartner(null)} style={styles.closeButton}>
                                <Ionicons name="close" size={20} color="#4B5563" />
                            </TouchableOpacity>
                        </View>

                        <RankingBreakdownCard
                            rankingData={selectedPartner}
                        />

                        {/* Rules Hint */}
                        <View style={styles.rulesHint}>
                            <Text style={{ color: '#4B5563', fontSize: 11, textAlign: 'center', lineHeight: 16 }}>
                                <Text style={{ fontWeight: 'bold', color: '#059669' }}>+10</Text> Booking  •
                                <Text style={{ fontWeight: 'bold', color: '#059669' }}> +1</Text> Star  •
                                <Text style={{ fontWeight: 'bold', color: '#EF4444' }}> -5</Text> Cancel/Left
                            </Text>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginBottom: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
        letterSpacing: 0.5,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 16,
        marginHorizontal: 20,
        marginBottom: 10,
        padding: 4,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        borderRadius: 12,
    },
    activeTab: {
        backgroundColor: '#FFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.7)',
    },
    activeTabText: {
        color: '#4F46E5',
        fontWeight: 'bold',
    },
    flatList: {
        flex: 1,
        paddingHorizontal: 16,
    },
    listHeaderSpacing: {
        height: 10,
    },
    rankRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 16,
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    meRowGlow: {
        backgroundColor: '#EEF2FF',
        borderColor: '#6366F1',
        borderWidth: 1.5,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 6,
    },
    listRankBadge: {
        width: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 4,
    },
    listRank: {
        fontSize: 14,
        fontWeight: '800',
        color: '#9CA3AF',
    },
    listAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    listAvatarText: { fontSize: 13, fontWeight: '700', color: '#4B5563' },
    listName: { fontSize: 14, marginBottom: 2 },
    listDetails: { fontSize: 11, fontWeight: '500' },
    listScoreCol: { alignItems: 'flex-end', minWidth: 60 },
    listScore: { fontSize: 15, fontWeight: '800' },
    listPts: { fontSize: 10, fontWeight: '600' },

    // Stick Footer
    stickyFooterContainer: {
        position: 'absolute',
        bottom: 24,
        left: 16,
        right: 16,
    },
    stickyFooter: {
        padding: 12,
        backgroundColor: '#FFF',
        borderRadius: 18,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerRankBadge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#4F46E5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        shadowColor: "#4F46E5",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    footerRankText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
    footerInfo: { flex: 1 },
    footerName: { fontWeight: '800', fontSize: 15 },
    meBadge: {
        backgroundColor: '#E0E7FF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    meBadgeText: { fontSize: 9, color: '#4338CA', fontWeight: 'bold' },
    footerScore: { fontWeight: '800', fontSize: 18 },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalCard: {
        width: '100%',
        borderRadius: 24,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    modalAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalAvatarText: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    closeButton: {
        padding: 6,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
    },
    rulesHint: {
        marginTop: 16,
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    }
});

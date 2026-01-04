import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,

    View,
    Vibration
} from 'react-native';
import { DownloadReports } from '../../components/dashboard/DownloadReports';
import { LeaderboardCard } from '../../components/dashboard/LeaderboardCard';
import { ServiceManagementCard } from '../../components/dashboard/ServiceManagementCard';
import { LifetimePerformance } from '../../components/dashboard/LifetimePerformance';
import { LoyalCustomersCard } from '../../components/dashboard/LoyalCustomersCard';
import { ReviewsCard } from '../../components/dashboard/ReviewsCard';
import { ShopLeaderboard } from '../../components/dashboard/ShopLeaderboard';
import { UnifiedBusinessInsights } from '../../components/dashboard/UnifiedBusinessInsights';
import { ShopMediaModal } from '../../components/dashboard/ShopMediaModal';

// Mock Data for Dashboard (Removed)

export default function DashboardScreen() {
    const router = useRouter();
    const { user, stats, earnings, partners, notifications, notificationsBreakdown, settings, setStats, setEarnings, setPartners, setTokens, setReviews, setNotifications } = useAppStore();
    const { colors } = useTheme();
    const [refreshing, setRefreshing] = useState(false);
    const [isShopOpen, setShopOpen] = useState(true);
    const [mediaModalVisible, setMediaModalVisible] = useState(false);

    // Vibration Ref
    const prevTokenIds = React.useRef<string[]>([]);

    const refreshDashboard = async () => {
        if (!user?.id) return;

        try {
            const { apiService } = require('@/services/api');
            const data = await apiService.getDashboard();

            if (data) {
                // Safely update with optional chaining
                if (data?.stats) setStats(data.stats);
                if (data?.earnings) setEarnings(data.earnings);
                if (data?.partners) setPartners(data.partners);
                if (data?.tokens) setTokens(data.tokens);
                if (data?.reviews) setReviews(data.reviews);
                if (data?.notificationsCount !== undefined) {
                    setNotifications(data.notificationsCount, data.notificationsBreakdown || { bookings: 0, alerts: 0 });
                }

                // Vibrate on New Booking
                if (data?.tokens && Array.isArray(data.tokens)) {
                    const currentIds = data.tokens.map((t: any) => t.id).filter(Boolean);
                    const hasNew = currentIds.some((id: string) => !prevTokenIds.current.includes(id));
                    if (prevTokenIds.current.length > 0 && hasNew && settings?.vibrateOnBooking) {
                        try {
                            // Vibration removed for production stability
                        } catch (e) {
                            // Vibration might not be available
                        }
                    }
                    prevTokenIds.current = currentIds;
                }

                // SYNC USER DATA
                if (data?.shop && user) {
                    try {
                        const { setAuthenticated } = useAppStore.getState();
                        const updatedUser = {
                            ...user,
                            shopName: data.shop.name || user.shopName,
                            upiId: data.shop.upi_id || user.upiId,
                            paymentQr: data.shop.payment_qr || user.paymentQr,
                            qrCode: data.shop.qr_code || user.qrCode,
                            image: data.shop.profileImage || user.image,
                            avatar: data.shop.profileImage || user.avatar
                        };
                        setAuthenticated(true, updatedUser);
                    } catch (e) {
                        // Keep existing user data
                    }
                }
            }
        } catch (e: any) {
            console.error("Dashboard refresh failed:", e?.message || e);
            // Don't crash - just skip this update
        }
    };

    // Fetch Shop Status and Dashboard Data
    React.useEffect(() => {
        if (user?.id) {
            const { apiService } = require('@/services/api');
            apiService.getShopStatus(user.id).then(setShopOpen);
            refreshDashboard();

            const interval = setInterval(refreshDashboard, 30000);
            return () => clearInterval(interval);
        }
    }, [user?.id]);

    // Manual refresh logic
    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await refreshDashboard();
        setRefreshing(false);
    }, [user?.id]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    {/* Avatar / Shop Logo */}
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: user?.avatar || user?.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (user?.name || 'Partner') }}
                            style={styles.avatarImage}
                        />
                        <View style={styles.onlineBadge} />
                    </View>

                    <View style={styles.headerContent}>
                        <Text style={[styles.shopName, { color: colors.textPrimary }]}>{user?.shopName || 'My Salon'}</Text>
                        <Text style={[styles.dateText, { color: colors.textTertiary }]}>
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </Text>
                    </View>
                </View>



                <View style={styles.headerActions}>

                    <TouchableOpacity onPress={() => router.push('/ranking')} style={[styles.actionButton, { backgroundColor: colors.surface }]}>
                        <Ionicons name="stats-chart-outline" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/notifications')} style={[styles.actionButton, { backgroundColor: colors.surface }]}>
                        <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
                        {(((settings?.notifyTokens ? (notificationsBreakdown?.bookings || 0) : 0) +
                            (settings?.notifyAlerts ? (notificationsBreakdown?.alerts || 0) : 0)) > 0) &&
                            <View style={[styles.badge, { backgroundColor: '#EF4444', borderColor: colors.surface || '#FFF' }]} />
                        }
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
            >
                <ShopLeaderboard isOpen={isShopOpen} />

                <UnifiedBusinessInsights stats={stats} earnings={earnings} />

                <ServiceManagementCard />

                <LifetimePerformance />

                <TouchableOpacity
                    style={[styles.manageServicesBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => setMediaModalVisible(true)}
                >
                    <View style={styles.manageServicesIcon}>
                        <Ionicons name="videocam-outline" size={24} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.manageServicesTitle, { color: colors.textPrimary }]}>Shop Media & Reels</Text>
                        <Text style={[styles.manageServicesSubtitle, { color: colors.textTertiary }]}>Upload photos, videos & promos</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </TouchableOpacity>

                <View style={styles.spacer} />

                {/* Loyal Customers - Placeholder until API provides it */}
                {/* <LoyalCustomersCard customers={[]} /> */}

                <ReviewsCard onRefresh={refreshDashboard} />

                <DownloadReports />

                <LeaderboardCard employees={partners} onRefresh={refreshDashboard} />

                {/* ServiceManagementModal removed - logic moved to ServiceManagementCard */}

                <ShopMediaModal
                    visible={mediaModalVisible}
                    onClose={() => setMediaModalVisible(false)}
                />

                <Text style={[styles.footerText, { color: colors.textTertiary }]}>
                    Data updated just now
                </Text>
            </ScrollView>

            {/* FAB Removed as requested */}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 29, // Shifted down slightly for better visibility
        paddingBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: -2,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatarImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E2E8F0',
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#22C55E', // Green for online
        borderWidth: 2,
        borderColor: '#FFF',
    },
    headerContent: {
        justifyContent: 'center',
        flex: 1,
    },
    greeting: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 2,
    },
    shopName: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 2,
    },
    dateText: {
        fontSize: 11,
        fontWeight: '500',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        width: 48, // Increased from 44
        height: 48, // Increased from 44
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 2,
    },
    scrollContent: {
        paddingTop: 8,
        padding: 20,
        paddingBottom: 100,
    },
    spacer: {
        height: 8,
    },
    footerText: {
        textAlign: 'center',
        fontSize: 10,
        marginTop: 20,
    },
    manageServicesBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginTop: 20,
    },
    manageServicesIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    manageServicesTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    manageServicesSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    }
});


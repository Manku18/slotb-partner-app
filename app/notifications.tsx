import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Platform,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// --- Types ---
type NotificationType = 'booking' | 'system' | 'alert' | 'payment';

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    time: string;
    read: boolean;
}

// --- Dummy Data ---
const DUMMY_NOTIFICATIONS: Notification[] = [
    // Today
    {
        id: '1',
        type: 'booking',
        title: 'New Booking Request',
        message: 'Amit Sharma wants to book a "Haircut" for 5:00 PM today.',
        time: 'Just now',
        read: false,
    },
    {
        id: '2',
        type: 'payment',
        title: 'Payment Received',
        message: 'You received ₹450 from Vikram K via UPI.',
        time: '2 mins ago',
        read: false,
    },
    {
        id: '3',
        type: 'alert',
        title: 'Token Missed',
        message: 'Token #12 (Rohan) was marked as missed.',
        time: '1 hour ago',
        read: true,
    },
    // Yesterday
    {
        id: '4',
        type: 'system',
        title: 'Weekly Performance',
        message: 'Your shop had 45 bookings this week! Check your dashboard.',
        time: 'Yesterday',
        read: true,
    },
    {
        id: '5',
        type: 'booking',
        title: 'Booking Cancelled',
        message: 'Suresh cancelled his appointment for 10:00 AM.',
        time: 'Yesterday',
        read: true,
    },
];

// ... imports
import { apiService } from '@/services/api';
import { useAppStore } from '@/store/useAppStore';

// ...

export default function NotificationsScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { user, notifications: badgeCount, setNotifications: setBadgeCount } = useAppStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        if (!user?.id) return;
        try {
            const data = await apiService.getNotifications(user.id);
            // Transform
            const mapped: Notification[] = data.map((n: any) => ({
                id: n.id.toString(),
                type: n.message.toLowerCase().includes('booking') ? 'booking' : 'system',
                title: n.message.toLowerCase().includes('booking') ? 'Booking Update' : 'Shop Alert',
                message: n.message,
                time: n.created_at, // You might want to format this
                read: n.is_read == 1
            }));
            setNotifications(mapped);
            // Update badge count based on unread
            const unread = mapped.filter(n => !n.read).length;
            setBadgeCount(unread);
        } catch (e) {
            console.error(e);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchNotifications();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchNotifications();
        setRefreshing(false);
    };

    // ... actions (handlePressNotification just updates local state for now)
    const handlePressNotification = (id: string) => {
        const isUnread = notifications.find(n => n.id === id)?.read === false;
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
        if (isUnread) {
            setBadgeCount(Math.max(0, badgeCount - 1));
        }
    };

    const handleMarkAllRead = async () => {
        if (!user?.id) return;
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setBadgeCount(0);
        try {
            await apiService.markAllNotificationsRead(user.id);
        } catch (e) {
            console.error("Failed to mark all read", e);
        }
    };

    const handleClearAll = () => {
        if (!user?.id) return;
        Alert.alert(
            "Clear All",
            "Are you sure you want to permanently clear all notifications?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear",
                    style: "destructive",
                    onPress: async () => {
                        setNotifications([]);
                        setBadgeCount(0);
                        try {
                            await apiService.clearNotifications(user.id);
                        } catch (e) {
                            console.error("Failed to clear notifications", e);
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteNotification = async (id: string) => {
        if (!user?.id) return;
        const isUnread = notifications.find(n => n.id === id)?.read === false;

        setNotifications(prev => prev.filter(n => n.id !== id));
        if (isUnread) {
            setBadgeCount(Math.max(0, badgeCount - 1));
        }

        try {
            await apiService.deleteNotification(user.id, id);
        } catch (e) {
            console.error("Failed to delete notification", e);
        }
    };

    // --- Render Helpers ---

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'booking': return 'calendar';
            case 'payment': return 'wallet';
            case 'alert': return 'alert-circle';
            case 'system': return 'information-circle';
            default: return 'notifications';
        }
    };

    const getColor = (type: NotificationType) => {
        switch (type) {
            case 'booking': return '#3B82F6'; // Blue
            case 'payment': return '#10B981'; // Green
            case 'alert': return '#EF4444'; // Red
            case 'system': return '#8B5CF6'; // Purple
            default: return colors.textSecondary;
        }
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[
                styles.card,
                { backgroundColor: item.read ? colors.surface : colors.background },
                !item.read && { borderColor: colors.primary, borderWidth: 1 } // Highlight unread
            ]}
            onPress={() => handlePressNotification(item.id)}
            onLongPress={() => {
                Alert.alert(
                    "Delete Notification",
                    "Do you want to delete this notification?",
                    [
                        { text: "Cancel", style: "cancel" },
                        { text: "Delete", style: "destructive", onPress: () => handleDeleteNotification(item.id) }
                    ]
                );
            }}
            activeOpacity={0.7}
        >
            {/* Icon Column */}
            <View style={[styles.iconBox, { backgroundColor: `${getColor(item.type)}15` }]}>
                <Ionicons name={getIcon(item.type)} size={22} color={getColor(item.type)} />
            </View>

            {/* Content Column */}
            <View style={styles.content}>
                <View style={styles.row}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>
                        {item.title}
                    </Text>
                    <Text style={[styles.time, { color: colors.textTertiary }]}>{item.time}</Text>
                </View>
                <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={2}>
                    {item.message}
                </Text>
            </View>

            {/* Unread Indicator */}
            {!item.read && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle={colors.background === '#000' ? 'light-content' : 'dark-content'} />
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Notifications</Text>

                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={handleMarkAllRead}>
                        <Ionicons name="checkmark-done-outline" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleClearAll} style={{ marginLeft: 16 }}>
                        <Ionicons name="trash-outline" size={24} color={colors.textTertiary} />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="notifications-off-outline" size={64} color={colors.textTertiary} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No notifications</Text>
                    </View>
                }
            />
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
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 20 : 40,
        height: 110,
    },
    headerTitle: {
        fontSize: 24, // High-impact title
        fontWeight: '900', // Maximum bold
        letterSpacing: -0.5,
    },
    headerActions: {
        flexDirection: 'row',
    },
    iconBtn: {
        padding: 4,
    },
    listContent: {
        padding: 16,
        gap: 12,
    },
    card: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: 'transparent',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    content: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        flex: 1,
        marginRight: 8,
    },
    time: {
        fontSize: 11,
        marginTop: 2,
    },
    message: {
        fontSize: 13,
        lineHeight: 18,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        position: 'absolute',
        top: 16,
        right: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        opacity: 0.5,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
    }
});

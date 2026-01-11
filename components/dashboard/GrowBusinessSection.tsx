import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import * as NavigationBar from 'expo-navigation-bar';
import { Alert, Platform, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DashboardCard } from './DashboardCard';

export function GrowBusinessSection() {
    const { colors } = useTheme();
    const { user } = useAppStore();

    const handleAction = async (action: string) => {
        if (action === 'Share') {
            try {
                const shopLink = `https://slotb.in/shop/${user?.shopName?.replace(/\s+/g, '-').toLowerCase() || 'myshop'}`;
                await Share.share({
                    message: `Check out ${user?.shopName || 'my shop'} on SlotB! Book your appointment now: ${shopLink}`,
                    url: shopLink,
                });
            } catch (error) {
                Alert.alert('Error', 'Could not share profile');
            } finally {
                // RESTORE NAVIGATION BAR STATE (Fix for Android shift issue)
                if (Platform.OS === 'android') {
                    setTimeout(async () => {
                        try {
                            // Edge-to-edge is enabled by default in SDK 52+, causing these to warn
                            // await NavigationBar.setPositionAsync('absolute');
                            // await NavigationBar.setBackgroundColorAsync('#ffffff00');
                            // await NavigationBar.setBehaviorAsync('overlay-swipe');
                            await NavigationBar.setVisibilityAsync('hidden');
                        } catch (e) { }
                    }, 500); // Small delay to ensure share sheet is fully gone
                }
            }
        } else if (action === 'Boost') {
            Alert.alert('Boost Visibility', 'Boost packages coming soon! Stay tuned to get featured.');
        } else if (action === 'Apply') {
            Alert.alert('Get Verified', 'Verification process will be available shortly. Contact support for early access.');
        }
    };

    const actions = [
        {
            id: 1,
            title: 'Boost Visibility',
            subtitle: 'Get featured on top of search results',
            icon: 'rocket-outline',
            color: '#F59E0B', // Amber
            action: 'Boost'
        },
        {
            id: 2,
            title: 'Get Verified Badge',
            subtitle: 'Build trust with a verified checkmark',
            icon: 'checkmark-circle-outline',
            color: '#3B82F6', // Blue
            action: 'Apply'
        },
        {
            id: 3,
            title: 'Share Profile',
            subtitle: 'Share your shop link on social media',
            icon: 'share-social-outline',
            color: '#10B981', // Emerald
            action: 'Share'
        }
    ];

    return (
        <DashboardCard
            title="Grow Your Business"
            icon="trending-up-outline"
        >
            <View style={styles.container}>
                {actions.map((item, index) => (
                    <View key={item.id} style={[styles.item, index !== actions.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                        <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                            <Ionicons name={item.icon as any} size={22} color={item.color} />
                        </View>
                        <View style={styles.content}>
                            <Text style={[styles.title, { color: colors.textPrimary }]}>{item.title}</Text>
                            <Text style={[styles.subtitle, { color: colors.textTertiary }]}>{item.subtitle}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            onPress={() => handleAction(item.action)}
                        >
                            <Text style={[styles.actionText, { color: colors.textPrimary }]}>{item.action}</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </DashboardCard>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 4,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
        marginRight: 12,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 12,
    },
    actionBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
    },
    actionText: {
        fontSize: 12,
        fontWeight: '600',
    }
});

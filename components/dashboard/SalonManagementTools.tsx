import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DashboardCard } from './DashboardCard';

export function SalonManagementTools() {
    const { colors } = useTheme();

    const tools = [
        {
            id: 'staff',
            title: 'Manage Team',
            subtitle: 'Attendance, shifts & performance',
            icon: 'people-circle-outline',
            color: '#8B5CF6', // Violet
            action: () => Alert.alert('Manage Team', 'Staff management module coming soon!')
        },
        {
            id: 'timings',
            title: 'Shop Schedule',
            subtitle: 'Set opening hours & holidays',
            icon: 'time-outline',
            color: '#EC4899', // Pink
            action: () => Alert.alert('Shop Schedule', 'Schedule management coming soon!')
        },
        {
            id: 'customers',
            title: 'Customer List',
            subtitle: 'View history & send offers',
            icon: 'happy-outline',
            color: '#06B6D4', // Cyan
            action: () => Alert.alert('Customer List', 'CRM features are on the way!')
        }
    ];

    return (
        <DashboardCard
            title="Salon Management"
            icon="briefcase-outline"
        >
            <View style={styles.container}>
                {tools.map((item, index) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[styles.item, index !== tools.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}
                        onPress={item.action}
                    >
                        <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                            <Ionicons name={item.icon as any} size={22} color={item.color} />
                        </View>
                        <View style={styles.content}>
                            <Text style={[styles.title, { color: colors.textPrimary }]}>{item.title}</Text>
                            <Text style={[styles.subtitle, { color: colors.textTertiary }]}>{item.subtitle}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                    </TouchableOpacity>
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
        paddingVertical: 14, // Slightly taller for clickability since the whole row is clickable
    },
    iconBox: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
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
    }
});

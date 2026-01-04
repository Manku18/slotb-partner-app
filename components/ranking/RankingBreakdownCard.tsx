import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'; // Added TouchableOpacity
import { RankingData } from './rankingTypes';

export interface RankingBreakdownCardProps {
    rankingData: RankingData | null;
    onPressRules?: () => void; // Added prop
}

export function RankingBreakdownCard({ rankingData, onPressRules }: RankingBreakdownCardProps) {
    const { colors } = useTheme();

    if (!rankingData) return null;

    const { breakdown, performance } = rankingData;

    // Derived counts
    // Left Tokens are now merged into Cancellations for display
    const totalCancellations = performance.cancellations + performance.noShows;

    return (
        <View style={[styles.container, { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.title, { color: '#111827' }]}>Score Breakdown</Text>
                {onPressRules && (
                    <TouchableOpacity onPress={onPressRules}>
                        <Text style={{ color: '#4F46E5', fontSize: 12, fontWeight: '600' }}>View Rules</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Rows */}
            <View style={styles.row}>
                <View style={styles.leftCol}>
                    <Ionicons name="checkmark-circle" size={18} color="#059669" />
                    <View>
                        <Text style={[styles.label, { color: '#374151' }]}>Completed Bookings</Text>
                        <Text style={[styles.subLabel, { color: '#6B7280' }]}>
                            {performance.completedBookings} x 10 pts
                        </Text>
                    </View>
                </View>
                <Text style={[styles.value, { color: '#059669' }]}>+{breakdown.bookingScore}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
                <View style={styles.leftCol}>
                    <Ionicons name="star" size={18} color="#D97706" />
                    <View>
                        <Text style={[styles.label, { color: '#374151' }]}>Rating Bonus</Text>
                        <Text style={[styles.subLabel, { color: '#6B7280' }]}>
                            Total Stars x 1 pt
                        </Text>
                    </View>
                </View>
                <Text style={[styles.value, { color: '#D97706' }]}>+{breakdown.ratingScore}</Text>
            </View>

            <View style={styles.divider} />

            {/* Merged Cancellation Row */}
            <View style={styles.row}>
                <View style={styles.leftCol}>
                    <Ionicons name="alert-circle" size={18} color="#EF4444" />
                    <View>
                        <Text style={[styles.label, { color: '#374151' }]}>Cancellations & Left Tokens</Text>
                        <Text style={[styles.subLabel, { color: '#6B7280' }]}>
                            {totalCancellations} x -5 pts
                        </Text>
                    </View>
                </View>
                <Text style={[styles.value, { color: '#EF4444' }]}>-{breakdown.penaltyScore}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    leftCol: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
    },
    subLabel: {
        fontSize: 11,
    },
    value: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 4,
        marginLeft: 30, // Indent
    },
});

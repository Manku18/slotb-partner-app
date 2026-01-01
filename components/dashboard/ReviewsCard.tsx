import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Alert, ActivityIndicator } from 'react-native';
import { apiService } from '@/services/api';
import { DASHBOARD_TEXT } from '../../app/(tabs)/dashboard.constants';
import { DashboardCard } from './DashboardCard';

import { useAppStore } from '@/store/useAppStore';

export function ReviewsCard({ onRefresh }: { onRefresh?: () => void }) {
    const { colors } = useTheme();
    const { reviews_data } = useAppStore();
    const [modalVisible, setModalVisible] = useState(false);
    const [replyingTo, setReplyingTo] = useState<any>(null);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const reviews = reviews_data || [];
    const totalReviews = reviews.length;
    const rating = totalReviews > 0
        ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / totalReviews).toFixed(1)
        : '0.0';

    const handleReply = async () => {
        if (!replyingTo || !replyText.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await apiService.replyReview(replyingTo.id, replyText);
            if (res.ok) {
                Alert.alert('Success', 'Reply saved successfully');
                setReplyingTo(null);
                setReplyText('');
                if (onRefresh) onRefresh();
            } else {
                Alert.alert('Error', res.error || 'Failed to save reply');
            }
        } catch (e) {
            Alert.alert('Error', 'Network error while saving reply');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <DashboardCard
                title={DASHBOARD_TEXT.reviews.title}
                icon="star"
                rightElement={
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 12 }}>Show More</Text>
                    </TouchableOpacity>
                }
            >
                <View style={styles.headerStats}>
                    <Text style={[styles.ratingValue, { color: colors.textPrimary }]}>{rating}</Text>
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <Ionicons key={i} name="star" size={14} color="#F59E0B" />
                        ))}
                    </View>
                    <Text style={[styles.totalCount, { color: colors.textSecondary }]}>({totalReviews} Reviews)</Text>
                </View>

                <View style={styles.snippetContainer}>
                    {reviews.slice(0, 2).map((r, i) => (
                        <View key={i} style={styles.snippetWrapper}>
                            <View style={[styles.snippet, { backgroundColor: r.rating >= 4 ? '#DEF7EC' : '#FDE8E8' }]}>
                                <Text style={[styles.snippetName, { color: r.rating >= 4 ? '#03543F' : '#9B1C1C' }]}>
                                    {r.name || 'User'} ({r.rating}★)
                                </Text>
                                <Text numberOfLines={1} style={[styles.snippetText, { color: r.rating >= 4 ? '#03543F' : '#9B1C1C' }]}>
                                    "{r.text || r.review_text}"
                                </Text>
                            </View>
                            {(r.reply && r.reply.trim().length > 0) && (
                                <View style={[styles.snippetReply, { borderLeftColor: colors.primary }]}>
                                    <Text style={[styles.snippetReplyText, { color: colors.textSecondary }]} numberOfLines={1}>
                                        <Text style={{ fontWeight: 'bold', color: colors.primary }}>Reply:</Text> {r.reply}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))}
                    {reviews.length === 0 && (
                        <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No reviews yet.</Text>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.replyButton, { borderColor: colors.primary }]}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={[styles.replyText, { color: colors.primary }]}>{DASHBOARD_TEXT.reviews.reply}</Text>
                </TouchableOpacity>
            </DashboardCard>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Reviews</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                            {reviews.map((r) => (
                                <View key={r.id} style={styles.reviewItem}>
                                    <View style={styles.reviewHeader}>
                                        <Text style={[styles.reviewerName, { color: colors.textPrimary }]}>{r.name}</Text>
                                        <View style={styles.ratingBadge}>
                                            <Text style={styles.ratingText}>{r.rating} ★</Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.reviewBody, { color: colors.textSecondary }]}>{r.text || r.review_text}</Text>

                                    {replyingTo?.id === r.id ? (
                                        <View style={styles.replyInputWrapper}>
                                            <TextInput
                                                style={[styles.replyInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surface }]}
                                                placeholder="Type your reply..."
                                                placeholderTextColor={colors.textTertiary}
                                                value={replyText}
                                                onChangeText={setReplyText}
                                                multiline
                                            />
                                            <View style={styles.replyActions}>
                                                <TouchableOpacity onPress={() => setReplyingTo(null)} disabled={isSubmitting}>
                                                    <Text style={{ color: colors.textTertiary, fontSize: 13 }}>Cancel</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={handleReply}
                                                    style={[styles.smallReplyBtn, { backgroundColor: colors.primary }]}
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? (
                                                        <ActivityIndicator size="small" color="#FFF" />
                                                    ) : (
                                                        <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '700' }}>Save</Text>
                                                    )}
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ) : (
                                        (r.reply && r.reply.trim().length > 0) ? (
                                            <View style={[styles.replyContainer, { backgroundColor: colors.surface, borderLeftColor: colors.primary }]}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                                    <Text style={[styles.replyLabel, { color: colors.primary }]}>Shop Reply:</Text>
                                                    <TouchableOpacity
                                                        onPress={() => { setReplyingTo(r); setReplyText(r.reply); }}
                                                        style={{ padding: 4 }}
                                                    >
                                                        <Ionicons name="pencil" size={16} color={colors.primary} />
                                                    </TouchableOpacity>
                                                </View>
                                                <Text style={[styles.replyBodyInner, { color: colors.textSecondary }]}>{r.reply}</Text>
                                            </View>
                                        ) : (
                                            <TouchableOpacity
                                                onPress={() => { setReplyingTo(r); setReplyText(''); }}
                                                style={{ alignSelf: 'flex-start', marginTop: 8 }}
                                            >
                                                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>Reply</Text>
                                            </TouchableOpacity>
                                        )
                                    )}
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    headerStats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    ratingValue: {
        fontSize: 24,
        fontWeight: '800',
    },
    starsRow: {
        flexDirection: 'row',
        gap: 2,
    },
    totalCount: {
        fontSize: 12,
        fontWeight: '500',
    },
    snippetContainer: {
        gap: 8,
        marginBottom: 16,
    },
    snippet: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        gap: 8,
    },
    snippetName: {
        fontWeight: '700',
        fontSize: 11,
    },
    snippetWrapper: {
        marginBottom: 8,
    },
    snippetReply: {
        marginLeft: 20,
        paddingLeft: 10,
        borderLeftWidth: 2,
        marginTop: 4,
    },
    snippetReplyText: {
        fontSize: 10,
        fontStyle: 'italic',
    },
    snippetText: {
        flex: 1,
        fontSize: 11,
        fontWeight: '500',
    },
    replyButton: {
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    replyText: {
        fontSize: 12,
        fontWeight: '700',
    },
    emptyText: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 10,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        height: '60%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    reviewItem: {
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    reviewerName: {
        fontWeight: '700',
        fontSize: 14,
    },
    ratingBadge: {
        backgroundColor: '#FEF9C3',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    ratingText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#B45309',
    },
    reviewBody: {
        fontSize: 13,
        lineHeight: 18,
    },
    replyContainer: {
        marginTop: 10,
        padding: 10,
        borderLeftWidth: 3,
        borderRadius: 4,
    },
    replyLabel: {
        fontSize: 10,
        fontWeight: '800',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    replyBodyInner: { // Renamed from replyBody to avoid conflict
        fontSize: 13,
        fontStyle: 'italic',
    },
    replyInputWrapper: {
        marginTop: 10,
    },
    replyInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        minHeight: 60,
        textAlignVertical: 'top',
    },
    replyActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 8,
        gap: 16,
    },
    smallReplyBtn: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 6,
    },
});

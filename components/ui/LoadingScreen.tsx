import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { SlotBColors } from '@/constants/theme';

export default function LoadingScreen() {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={SlotBColors.primary} />
            <Text style={styles.text}>Opening SlotB...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    text: {
        marginTop: 20,
        fontSize: 16,
        fontWeight: '600',
        color: SlotBColors.textSecondary
    }
});

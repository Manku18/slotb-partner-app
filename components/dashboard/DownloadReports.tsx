import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DASHBOARD_TEXT } from '../../app/(tabs)/dashboard.constants';
import { DashboardCard } from './DashboardCard';

import { useAppStore } from '@/store/useAppStore';
import { apiService } from '@/services/api';
import { Alert, ActivityIndicator } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export function DownloadReports() {
    const { colors } = useTheme();
    const { user } = useAppStore();
    const [loading, setLoading] = React.useState(false);

    const handleDownload = async (type: 'monthly' | 'yearly') => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const data = await apiService.getReportData(user.id, type, new Date().getFullYear(), new Date().getMonth() + 1);
            if (data) {
                const html = `
                <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                    <style>
                        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1f2937; }
                        .header { border-bottom: 2px solid #7c3aed; padding-bottom: 20px; margin-bottom: 30px; }
                        .shop-name { font-size: 24px; font-weight: bold; color: #7c3aed; }
                        .report-title { font-size: 18px; color: #6b7280; margin-top: 5px; }
                        .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
                        .stat-card { background: #f9fafb; padding: 20px; border-radius: 12px; }
                        .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
                        .stat-value { font-size: 20px; font-weight: bold; color: #111827; margin-top: 5px; }
                        .footer { margin-top: 50px; font-size: 10px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px; }
                        .highlight { color: #059669; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="shop-name">slotB.in Partner</div>
                        <div class="report-title">${type.toUpperCase()} Performance Report - ${data.period}</div>
                    </div>
                    
                    <div class="summary-grid">
                        <div class="stat-card">
                            <div class="stat-label">Total Bookings</div>
                            <div class="stat-value">${data.totalBookings}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Served Bookings</div>
                            <div class="stat-value highlight">${data.servedBookings}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Missed Bookings</div>
                            <div class="stat-value" style="color: #dc2626;">${data.missedBookings}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Total Revenue</div>
                            <div class="stat-value">₹${data.totalEarnings}</div>
                        </div>
                    </div>

                    <div style="margin-top: 20px; padding: 20px; background: #f3f4f6; border-radius: 12px;">
                        <div class="stat-label">Shop Payout</div>
                        <div class="stat-value" style="font-size: 28px; color: #7c3aed;">₹${data.totalEarnings - data.partnerEarnings}</div>
                        <div class="stat-label" style="margin-top: 10px;">Partner Share: ₹${data.partnerEarnings}</div>
                    </div>

                    <div class="footer">
                        Generated via slotB Partner App on ${new Date().toLocaleDateString()}
                    </div>
                </body>
                </html>
                `;

                const { uri } = await Print.printToFileAsync({ html });
                await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to generate PDF report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardCard
            title={DASHBOARD_TEXT.reports.title}
            icon="document-text"
        >
            <View style={styles.container}>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => handleDownload('monthly')}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name="cloud-download-outline" size={20} color={colors.primary} />}
                    <Text style={[styles.text, { color: colors.textPrimary }]}>{DASHBOARD_TEXT.reports.monthly}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => handleDownload('yearly')}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name="cloud-download-outline" size={20} color={colors.primary} />}
                    <Text style={[styles.text, { color: colors.textPrimary }]}>{DASHBOARD_TEXT.reports.yearly}</Text>
                </TouchableOpacity>
            </View>
        </DashboardCard>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    text: {
        fontSize: 13,
        fontWeight: '600',
    }
});

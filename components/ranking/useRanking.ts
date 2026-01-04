import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
    RankingConfig,
    RankingData,
    RankingPeriod,
    DEFAULT_RANKING_CONFIG,
    PartnerPerformance
} from './rankingTypes';
import { calculateRankingScore, simulateLeaderboard } from './rankingUtils';

export const useRanking = () => {
    const { user, stats, settings } = useAppStore();

    const [period, setPeriod] = useState<RankingPeriod>('month');
    const [config, setConfig] = useState<RankingConfig>(DEFAULT_RANKING_CONFIG);
    const [isEligible, setIsEligible] = useState(true); // Mock eligibility for now

    // Derive generic performance from Dashboard Stats (Mocking specific period data for now)
    const currentPerformance: PartnerPerformance = useMemo(() => {
        // In a real scenario, we'd fetch specific performance for the selected 'period'
        return {
            onlineBookings: stats?.onlineBookings || 0,
            completedBookings: stats?.realServedBookings || 0, // Assuming served = completed
            averageRating: 4.7, // Mock
            reviewCount: 12, // Mock
            cancellations: 1, // Mock
            noShows: 0 // Mock
        };
    }, [stats, period]);

    const rankingData = useMemo(() => {
        if (!user?.id) return null;

        const leaderboard = simulateLeaderboard(user.id, currentPerformance, config);
        const myRank = leaderboard.find(p => p.partnerId === user.id);

        return {
            leaderboard,
            myRank: myRank || null
        };
    }, [user, currentPerformance, config]);

    return {
        period,
        setPeriod,
        config,
        setConfig, // Admin function
        isEligible,
        currentPerformance,
        myRanking: rankingData?.myRank,
        leaderboard: rankingData?.leaderboard,
        isLoading: false
    };
};

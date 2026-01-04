import { PartnerPerformance, RankingConfig, RankingData, DEFAULT_RANKING_CONFIG } from './rankingTypes';

/**
 * Calculates the ranking score based on performance metrics and configuration weights.
 */
export const calculateRankingScore = (
    performance: PartnerPerformance,
    config: RankingConfig = DEFAULT_RANKING_CONFIG
): { totalScore: number; breakdown: RankingData['breakdown'] } => {

    // Core Scoring Logic
    const bookingScore = performance.completedBookings * config.bookingWeight;

    // Rating Score: Total Stars * 1
    // Using Math.round in case average isn't integer
    const totalStars = Math.round(performance.averageRating * performance.reviewCount);
    const ratingScore = totalStars * config.ratingWeight;

    // Penalties check
    // "Left Tokens" are now considered "Cancellations"
    const totalCancellations = performance.cancellations + performance.noShows;
    const penaltyScore = totalCancellations * config.cancellationPenalty;

    const totalScore = Math.max(0, Math.round(bookingScore + ratingScore - penaltyScore));

    return {
        totalScore,
        breakdown: {
            bookingScore,
            ratingScore,
            penaltyScore
        }
    };
};

/**
 * Simulates a leaderboard by generating mock partners and sorting them.
 * This is for frontend simulation ONLY.
 */
export const simulateLeaderboard = (
    currentPartnerId: string,
    currentPartnerPerformance: PartnerPerformance,
    config: RankingConfig
): RankingData[] => {

    const mockPartners: Array<{ id: string, perf: PartnerPerformance }> = [
        { id: currentPartnerId, perf: currentPartnerPerformance }, // Add current user first
        // Generate random competitors
        ...Array.from({ length: 19 }).map((_, i) => ({
            id: `p${i}`,
            perf: {
                onlineBookings: Math.floor(Math.random() * 80),
                completedBookings: Math.floor(Math.random() * 70),
                averageRating: 3.5 + (Math.random() * 1.5),
                reviewCount: Math.floor(Math.random() * 50),
                cancellations: Math.floor(Math.random() * 3),
                noShows: Math.floor(Math.random() * 2)
            }
        }))
    ];

    // Calculate scores for all
    const rankedPartners = mockPartners.map(p => {
        const { totalScore, breakdown } = calculateRankingScore(p.perf, config);
        return {
            partnerId: p.id,
            score: totalScore,
            rank: 0, // Will set after sorting
            percentile: 0,
            breakdown,
            performance: p.perf
        };
    });

    // Sort: High score first. Tie-break: Bookings, then Rating.
    rankedPartners.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.performance.completedBookings !== a.performance.completedBookings) return b.performance.completedBookings - a.performance.completedBookings;
        return b.performance.averageRating - a.performance.averageRating;
    });

    // Assign Ranks
    rankedPartners.forEach((p, index) => {
        p.rank = index + 1;
        p.percentile = Math.round(((index + 1) / rankedPartners.length) * 100);
    });

    return rankedPartners;
};

export const getRankingContextText = (rank: number, period: string): string => {
    if (rank === 1) return `🏆 You are the #1 Salon ${period}!`;
    if (rank <= 3) return `🔥 Top 3! Outstanding performance ${period}.`;
    if (rank <= 10) return `🚀 You're in the Top 10 ${period}.`;
    return `Keep pushing to reach the top!`;
};

/**
 * Calculates points needed to reach a target rank.
 * simplified: (Target Score - My Score) / Weight + Buffer
 */
export const getGapToTop10 = (leaderboard: RankingData[], myScore: number, config: RankingConfig): number => {
    if (leaderboard.length < 10) return 0;
    const targetPartner = leaderboard[9]; // 10th place
    const diff = targetPartner.score - myScore;
    if (diff <= 0) return 0;

    // Calculate needed bookings (rounding up)
    return Math.ceil((diff + 1) / config.bookingWeight);
};

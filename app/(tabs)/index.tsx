import { PricingSection } from '@/components/PricingSection';
import { GlassCard } from '@/components/ui/GlassCard';
import { SlotBShadows } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context'; // Removed to match Dashboard behavior

const { width, height } = Dimensions.get('window');

const ADS_DATA = [
  { id: '1', title: 'New Feature Alert', subtitle: 'Detailed Analytics Now Live', icon: 'stats-chart' },
  { id: '2', title: 'Boost Your Shop', subtitle: 'Get Featured for 24h', icon: 'rocket' },
  { id: '3', title: 'Partner Program', subtitle: 'Earn Rewards', icon: 'gift' },
];

const GALLERY_DATA = [
  { id: '1', title: 'Fade Master', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&q=80' },
  { id: '2', title: 'Beard Trim', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&q=80' },
  { id: '3', title: 'Classic Cut', image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=500&q=80' },
];

const INSIGHTS_DATA = [
  { id: '1', title: 'Maximizing Earnings', desc: 'Tips to increase daily revenue.' },
  { id: '2', title: 'Customer Retention', desc: 'How to keep them coming back.' },
  { id: '3', title: 'Seasonal Trends', desc: 'Summer styles are in demand.' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, notifications, setStats, setEarnings, setTokens, setPartners, setAuthenticated } = useAppStore();
  const { colors } = useTheme();

  const [isShopOpen, setShopOpen] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isSmartMode, setSmartMode] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [galleryActiveSlide, setGalleryActiveSlide] = useState(0);

  const { scrollTo } = useLocalSearchParams<{ scrollTo: string }>();
  const mainScrollRef = React.useRef<ScrollView>(null);
  const adsScrollRef = React.useRef<ScrollView>(null);
  const galleryScrollRef = React.useRef<ScrollView>(null);

  // Handle Deep Link Scroll
  React.useEffect(() => {
    if (scrollTo === 'pricing' && mainScrollRef.current) {
      // Delay slightly to allow layout
      setTimeout(() => {
        mainScrollRef.current?.scrollToEnd({ animated: true });
      }, 500);
    }
  }, [scrollTo]);

  // Fetch Live Data
  React.useEffect(() => {
    async function loadData() {
      if (!user?.id) return;

      try {
        const { apiService } = require('@/services/api'); // Ensure apiService is available
        const data = await apiService.getDashboard();

        // Update Store with Live Data
        setStats(data.stats);
        setEarnings(data.earnings);
        setTokens(data.tokens);
        setPartners(data.partners || []);

        // SYNC USER DATA
        if (data.shop && user) {
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
        }
      } catch (e) {
        console.error("Dashboard Load Failed", e);
        // Do NOT fall back to mocks. Keep empty or show error.
      } finally {
        setRefreshing(false);
      }
    }
    loadData();

    // Polling every 30 seconds for live updates
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [user?.id, refreshing]);

  // Auto-scroll for Ads
  React.useEffect(() => {
    const interval = setInterval(() => {
      let nextSlide = activeSlide + 1;
      if (nextSlide >= ADS_DATA.length) nextSlide = 0;
      if (adsScrollRef.current) {
        adsScrollRef.current.scrollTo({ x: nextSlide * width, animated: true });
        setActiveSlide(nextSlide);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [activeSlide]);

  // Auto-scroll for Gallery
  React.useEffect(() => {
    const interval = setInterval(() => {
      let nextSlide = galleryActiveSlide + 1;
      if (nextSlide >= GALLERY_DATA.length) nextSlide = 0;
      if (galleryScrollRef.current) {
        galleryScrollRef.current.scrollTo({ x: nextSlide * width, animated: true });
        setGalleryActiveSlide(nextSlide);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [galleryActiveSlide]);

  // Effect to fetch initial status
  React.useEffect(() => {
    if (user?.id) {
      const { apiService } = require('@/services/api');
      apiService.getShopStatus(user.id).then(setShopOpen);
    }
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
          <TouchableOpacity onPress={() => router.push('/notifications')} style={[styles.headerActionButton, { backgroundColor: colors.surface }]}>
            <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
            {notifications > 0 && <View style={[styles.headerBadge, { backgroundColor: '#EF4444', borderColor: colors.surface }]} />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={mainScrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent]} // Removed fixed minHeight to let content dictate height
      >
        {/* Ads Carousel */}
        <View style={styles.sectionNoMargin}>
          <ScrollView
            ref={adsScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.heroCarouselContainer}
            onScroll={(event) => {
              const slide = Math.ceil(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
              if (slide !== activeSlide) {
                setActiveSlide(slide);
              }
            }}
            scrollEventThrottle={16}
          >
            {ADS_DATA.map((item) => (
              <GlassCard key={item.id} style={styles.heroCard} variant="default">
                <View style={styles.heroContent}>
                  <View style={[styles.adIconContainer, { backgroundColor: colors.background }]}>
                    <Ionicons name={item.icon as any} size={32} color={colors.primary} />
                  </View>
                  <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                  <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                  <TouchableOpacity style={[styles.heroButton, { backgroundColor: '#0A1A10' }]}>
                    <Text style={styles.adButtonText}>EXPLORE NOW</Text>
                    <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))}
          </ScrollView>

          <View style={styles.paginationContainer}>
            {ADS_DATA.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  { backgroundColor: index === activeSlide ? colors.primary : colors.textTertiary }
                ]}
              />
            ))}
          </View>
        </View>

        {/* Status Section (Red Glow Logic) */}
        <View style={styles.section}>
          <GlassCard
            style={[
              styles.statusCard,
              !isShopOpen && {
                backgroundColor: '#DC2626',
                shadowColor: '#DC2626',
                shadowOpacity: 0.6,
                shadowRadius: 20
              }
            ]}
            variant={isShopOpen ? "mustard" : "default"}
          >
            <View style={styles.statusMainRow}>
              <View style={styles.statusInfo}>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: isShopOpen ? colors.success : '#FFFFFF' }
                ]} />
                <View>
                  <Text style={[
                    styles.statusTitle,
                    { color: isShopOpen ? colors.textPrimary : '#FFFFFF' }
                  ]}>
                    LIVE AVAILABILITY
                  </Text>
                  <Text style={[
                    styles.statusValue,
                    { color: isShopOpen ? colors.textPrimary : '#FFFFFF' }
                  ]}>
                    {isShopOpen ? 'OPEN NOW' : 'CLOSED'}
                  </Text>
                  <TouchableOpacity onPress={() => setSmartMode(!isSmartMode)} style={[
                    styles.smartBadge,
                    !isShopOpen && { backgroundColor: 'rgba(255,255,255,0.2)' }
                  ]}>
                    <Ionicons name="sparkles" size={10} color={isShopOpen ? colors.primary : '#FFFFFF'} />
                    <Text style={[
                      styles.smartText,
                      { color: isShopOpen ? colors.primary : '#FFFFFF' }
                    ]}>
                      Smart {isSmartMode ? 'ON' : 'OFF'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShopOpen(!isShopOpen)}
                style={styles.switchTouchArea}
              >
                <View style={styles.switchContainer}>
                  <Switch
                    trackColor={{ false: '#FFFFFF', true: colors.primary }}
                    thumbColor={isShopOpen ? colors.surface : '#FF0000'}
                    ios_backgroundColor="#FFFFFF"
                    onValueChange={async (value) => {
                      setShopOpen(value); // Optimistic update
                      if (user?.id) {
                        try {
                          const { apiService } = require('@/services/api');
                          await apiService.toggleShopStatus(user.id, value);
                        } catch (e) {
                          setShopOpen(!value); // Revert on failure
                          alert("Failed to update status");
                        }
                      }
                    }}
                    value={isShopOpen}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>

        {/* NEW: Payment QR Preview Section on Home */}
        {user?.paymentQr && (
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>YOUR PAYMENT QR</Text>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push('/payment-qr' as any)}
              style={styles.qrPreviewCard}
            >
              <GlassCard style={styles.qrPreviewInner} variant="default">
                <View style={styles.qrPreviewContent}>
                  <View style={styles.qrPreviewText}>
                    <Text style={[styles.qrPreviewTitle, { color: colors.textPrimary }]}>Merchant QR Active</Text>
                    <Text style={[styles.qrPreviewSub, { color: colors.textSecondary }]}>Click to view full screen</Text>
                    <View style={styles.activeBadge}>
                      <Ionicons name="checkmark-done" size={12} color="#10B981" />
                      <Text style={styles.activeBadgeText}>LIVE ON SITE</Text>
                    </View>
                  </View>
                  <View style={styles.qrImageMiniContainer}>
                    <Image source={{ uri: user.paymentQr }} style={styles.qrImageMini} />
                  </View>
                </View>
              </GlassCard>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        < View style={styles.section} >
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>QUICK ACTIONS</Text>
          <View style={styles.actionsGrid}>
            {[
              { label: 'Ranking', icon: 'trophy-outline', route: '/ranking' as const },
              { label: 'Profile', icon: 'person-outline', route: '/profile' as const },
              { label: 'Payment QR', icon: 'qr-code-outline', route: '/payment-qr' as const }, // Renamed from Booking QR
              { label: 'Shop QR', icon: 'wallet-outline', route: '/shop-qr' as const }
            ].map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionButton, { backgroundColor: colors.surface }]}
                onPress={() => router.push(action.route as any)}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.background }]}>
                  <Ionicons name={action.icon as any} size={24} color={colors.primary} />
                </View>
                <Text style={[styles.actionText, { color: colors.textSecondary }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View >

        {/* Trending Styles (reduced height to 25vh) */}
        < View style={[styles.section, { height: height * 0.25 }]} >
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>TRENDING STYLES</Text>
          <ScrollView
            ref={galleryScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.galleryCarouselContainer}
            onScroll={(event) => {
              const slide = Math.ceil(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
              setGalleryActiveSlide(slide);
            }}
            scrollEventThrottle={16}
          >
            {GALLERY_DATA.map((item) => (
              <View key={item.id} style={[styles.galleryLargeCard, { width: width - 40, height: height * 0.20 }]}>
                <Image source={{ uri: item.image }} style={styles.galleryLargeImage} />
                <View style={styles.galleryLargeOverlay}>
                  <Text style={styles.galleryLargeTitle}>{item.title}</Text>
                  <TouchableOpacity style={styles.galleryFab}>
                    <Ionicons name="arrow-forward" size={20} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
          {/* Pagination Dots for Gallery */}
          <View style={[styles.paginationContainer, { marginTop: 10, marginBottom: 0 }]}>
            {GALLERY_DATA.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  { backgroundColor: index === galleryActiveSlide ? colors.primary : colors.textTertiary }
                ]}
              />
            ))}
          </View>
        </View >

        {/* Partner Insights (Increased height to 50vh) */}
        < PricingSection />

      </ScrollView >
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 29,
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
  headerActionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 10,
  },
  section: {
    marginBottom: 14,
  },
  sectionNoMargin: {
    marginBottom: 1,
  },
  sectionLast: {
    marginBottom: 0,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.7,
  },
  heroCarouselContainer: {
    paddingHorizontal: 0,
  },
  heroCard: {
    // Match width/height logic but with fixes
    width: width - 40,
    height: height * 0.38,
    borderRadius: 0, // Super smooth corners (Matches user request for "corner issue" fix)
    justifyContent: 'center',
    padding: 24,
    marginHorizontal: 20,
    // Dynamic background for contrast safety, but keep light if theme requires
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden', // CRITICAL: Fixes content passing corners
  },
  heroContent: {
    alignItems: 'flex-start',
    width: '100%',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    lineHeight: 40,
    color: '#000000', // Force black since card is white
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 24,
    opacity: 0.8,
    color: '#333333', // Force dark grey
  },
  heroButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  adButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  adIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20, // Shifted down (from -40)
    marginBottom: 30,
    gap: 4,
    zIndex: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusCard: {
    marginHorizontal: 20,
    padding: 10,
    borderRadius: 30, // Consistent with Hero
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  statusMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  statusTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 0,
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 0,
    letterSpacing: -0.5,
  },
  smartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  smartText: {
    fontSize: 11,
    fontWeight: '600',
  },
  switchTouchArea: {
    padding: 6,
  },
  switchContainer: {
    transform: [{ scale: 1.1 }],
    padding: 4,
    borderRadius: 10,
    // Removed duplicate dark background/shadow
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 16,
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (width - 40 - 16) / 2, // 20 padding * 2 = 40, 16 gap
    borderRadius: 24,
    padding: 15,
    alignItems: 'center',
    ...SlotBShadows.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Gallery Carousel (30vh)
  galleryCarouselContainer: {
    paddingHorizontal: 0,
  },
  galleryLargeCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
    ...SlotBShadows.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  galleryLargeImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  galleryLargeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(73, 72, 72, 0.3)', // Ensure text readability
  },
  galleryLargeTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    width: '70%',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  galleryFab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  // Insights (40vh)
  insightsCard: {
    flex: 1,
    padding: 24,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  insightsList: {
    flex: 1,
  },
  insightItem: {
    paddingVertical: 16,
  },
  insightItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  insightItemDesc: {
    fontSize: 14,
    opacity: 0.8,
  },
  readMoreBtn: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  readMoreText: {
    fontWeight: '700',
    fontSize: 14,
  },
  // QR Preview Styles
  qrPreviewCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    ...SlotBShadows.card,
  },
  qrPreviewInner: {
    padding: 20,
    borderRadius: 24,
  },
  qrPreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  qrPreviewText: {
    flex: 1,
  },
  qrPreviewTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  qrPreviewSub: {
    fontSize: 13,
    marginBottom: 12,
    opacity: 0.8,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  activeBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  qrImageMiniContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#FFF',
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  qrImageMini: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
});

import { Token, TokenStatus } from '@/components/tokens/token.types';
import { generateMockTokens } from '@/components/tokens/token.utils';
import { create } from 'zustand';

// Mock Data Interfaces
export interface RangeStats {
  served: number;
  missed: number;
  earnings: number;
  bookings: number;
}

export interface DashboardStats {
  totalBookings?: number;
  totalBookingsGrowth?: string;
  onlineBookings?: number;
  onlineBookingsGrowth?: string;
  offlineBookings?: number;
  offlineBookingsGrowth?: string;
  realServedBookings?: number;
  realMissedBookings?: number;
  realTotalEarnings?: number;
  today?: RangeStats;
  weekly?: RangeStats;
  monthly?: RangeStats;
  lifetime?: RangeStats;
  history?: any;
  breakdown?: any;
}

export interface EarningsEntry {
  date: string;
  amount: number;
}

export interface EarningsData {
  revenue: number;
  revenueGrowth: string;
  chartData: number[];
}

export interface Partner {
  id: string;
  name: string;
  bookings: number;
  earnings: number;
  rank: number;
  rating?: number;
}

export interface User {
  id: string;
  name: string;
  shopName: string;
  avatar?: string;
  qrCode?: string;
  upiId?: string;
  image?: string;
  paymentQr?: string;
}

interface AppState {
  // Auth
  isAuthenticated: boolean;
  user: User | null;
  setAuthenticated: (status: boolean, user?: User) => void;

  // Theme
  isDarkMode: boolean;
  toggleTheme: () => void;

  // Dashboard Data
  stats: DashboardStats | null;
  earnings: EarningsData | null;
  partners: Partner[];
  setStats: (stats: DashboardStats) => void;
  setEarnings: (earnings: EarningsData) => void;
  setPartners: (partners: Partner[]) => void;

  // Notifications
  notifications: number;
  setNotifications: (count: number) => void;

  // Tokens
  tokens: Token[];
  filteredTokens: Token[];
  tokenFilter: 'all' | TokenStatus;
  setTokens: (tokens: Token[]) => void;
  setTokenFilter: (filter: 'all' | TokenStatus) => void;
  addToken: (token: Token) => void;
  updateTokenStatus: (id: string, status: TokenStatus) => void;
  // Reviews
  reviews_data: any[];
  setReviews: (reviews: any[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Auth
  isAuthenticated: false,
  user: null,
  setAuthenticated: (status, user) => set({ isAuthenticated: status, user: user || null }),

  // Theme
  isDarkMode: false, // Default to Light
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

  // Dashboard Data
  stats: null,
  earnings: null,
  partners: [],
  setStats: (stats) => set({ stats }),
  setEarnings: (earnings) => set({ earnings }),
  setPartners: (partners) => set({ partners }),
  reviews_data: [],
  setReviews: (reviews_data) => set({ reviews_data }),

  // Notifications (Mock initial count)
  notifications: 0,
  setNotifications: (count) => set({ notifications: count }),

  // Tokens (Mock Data)
  // Tokens (Real Data via API)
  tokens: [],
  filteredTokens: [],
  tokenFilter: 'all',

  setTokens: (tokens) => set({ tokens, filteredTokens: tokens }),

  setTokenFilter: (filter) => set((state) => {
    if (filter === 'all') {
      return { tokenFilter: filter, filteredTokens: state.tokens };
    }
    return {
      tokenFilter: filter,
      filteredTokens: state.tokens.filter(t => t.status === filter)
    };
  }),

  addToken: (token) => set((state) => {
    const newTokens = [token, ...state.tokens];
    return {
      tokens: newTokens,
      filteredTokens: state.tokenFilter === 'all' ? newTokens : newTokens.filter(t => t.status === state.tokenFilter)
    };
  }),

  updateTokenStatus: (id, status) => set((state) => {
    const newTokens = state.tokens.map(t => t.id === id ? { ...t, status } : t);
    return {
      tokens: newTokens,
      filteredTokens: state.tokenFilter === 'all' ? newTokens : newTokens.filter(t => t.status === state.tokenFilter)
    };
  }),
}));


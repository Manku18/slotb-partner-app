import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native'; // Added AppState
import 'react-native-reanimated';

import { SlotBColors } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import { usePushNotifications } from '@/hooks/usePushNotifications'; // Import Hook
import { useWebSocket } from '@/hooks/useWebSocket';
import LoadingScreen from '@/components/ui/LoadingScreen';

export const unstable_settings = {
  anchor: '(tabs)',
};

const customLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: SlotBColors.background,
    card: SlotBColors.background, // Navigate/Tab bar background
    text: SlotBColors.textPrimary,
    border: SlotBColors.border,
    primary: SlotBColors.primary,
  },
};

const RootLayoutNav = () => {
  const segments = useSegments();
  const router = useRouter();
  // Ensure navigation is ready
  const rootNavigationState = useRootNavigationState();
  const authKey = useAppStore((state) => state.authKey);
  const isHydrated = useAppStore((state) => state.isHydrated);

  // Initialize Real-time Updates
  useWebSocket();

  useEffect(() => {
    const checkNavigation = async () => {
      // 1. Wait for hydration and navigation ready
      // 2. Ensure the root layout is fully mounted
      if (!isHydrated || !rootNavigationState?.key) return;

      // Handling redirection safely
      const firstSegment = segments[0] as string | undefined;
      const inAuthGroup = firstSegment === '(tabs)';
      const onAuthPage = firstSegment === 'login' || firstSegment === 'welcome' || firstSegment === 'signup';

      if (!authKey && inAuthGroup) {
        // Use setImmediate or setTimeout to ensure navigation happens after render commit
        setTimeout(() => {
          router.replace('/welcome');
        }, 0);
      } else if (authKey && onAuthPage) {
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 0);
      }
    };

    checkNavigation();
  }, [authKey, segments, isHydrated, rootNavigationState?.key]);


  useEffect(() => {
    // Run for immersive mode and ensure it stays hidden on resume
    if (Platform.OS === 'android') {
      const setupNav = async () => {
        try {
          // Edge-to-edge is enabled by default in SDK 52+, causing these to warn
          // await NavigationBar.setPositionAsync('absolute');
          // await NavigationBar.setBackgroundColorAsync('#ffffff00');
          // await NavigationBar.setBehaviorAsync('overlay-swipe');
          await NavigationBar.setVisibilityAsync('hidden');
        } catch (e) {
          // Ignore
        }
      };

      setupNav();

      const subscription = AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'active') {
          // Re-apply when coming back to foreground
          setupNav();
        }
      });

      return () => {
        subscription.remove();
      };
    }
  }, []);

  if (!isHydrated) {
    return <LoadingScreen />;
  }

  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="preferences" options={{ headerShown: false }} />
      <Stack.Screen name="notification-settings" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      <Stack.Screen name="ranking" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="shop-qr" options={{ headerShown: false }} />
      <Stack.Screen name="payment-qr" options={{ headerShown: false }} />
      <Stack.Screen name="privacy" options={{ headerShown: false }} />
      <Stack.Screen name="help" options={{ headerShown: false }} />
    </Stack>
  );
}

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const { expoPushToken, notification } = usePushNotifications(); // Init Push Logic
  // Optionally console log token for debugging or send to backend here if hook doesn't (hook logs it)

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={customLightTheme}>
          <RootLayoutNav />
          {/* Status Bar: Dark content for light background */}
          <StatusBar style="dark" />
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

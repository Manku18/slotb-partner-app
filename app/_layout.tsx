import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native'; // Added AppState
import 'react-native-reanimated';

import { SlotBColors } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

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
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Handling redirection safely
    const inAuthGroup = segments[0] === '(tabs)';
    const onLoginPage = segments[0] === 'login';

    if (!isAuthenticated && inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && onLoginPage) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);

  useEffect(() => {
    // Run for immersive mode and ensure it stays hidden on resume
    if (Platform.OS === 'android') {
      const setupNav = async () => {
        try {
          await NavigationBar.setPositionAsync('absolute');
          await NavigationBar.setBackgroundColorAsync('#ffffff00');
          // Use 'overlay-swipe' to let content draw under bar, but keep it hidden usually
          await NavigationBar.setBehaviorAsync('overlay-swipe');
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

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
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

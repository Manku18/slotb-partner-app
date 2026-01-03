import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
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
    const inAuthGroup = segments[0] === '(tabs)';
    const onLoginPage = segments[0] === 'login';

    const frameId = requestAnimationFrame(() => {
      try {
        if (!isAuthenticated) {
          if (inAuthGroup) {
            router.replace('/login');
          }
        } else {
          // If authenticated, only redirect AWAY from login page
          if (onLoginPage) {
            router.replace('/(tabs)');
          }
        }
      } catch (error) {
        // Ignored
      }
    });


    // Immersive Mode for Android
    if (Platform.OS === 'android') {
      const enableImmersiveMode = async () => {
        await NavigationBar.setPositionAsync('absolute');
        await NavigationBar.setBackgroundColorAsync('#ffffff00'); // Transparent
        await NavigationBar.setVisibilityAsync('hidden');
        await NavigationBar.setBehaviorAsync('overlay-swipe'); // Swipe to reveal
      };
      enableImmersiveMode();
    }

    return () => cancelAnimationFrame(frameId);
  }, [isAuthenticated, segments, router]);

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

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={customLightTheme}>
        <RootLayoutNav />
        {/* Status Bar: Dark content for light background */}
        <StatusBar style="dark" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

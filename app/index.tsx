import { useRouter, useRootNavigationState } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import React, { useEffect } from 'react';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function Index() {
    const authKey = useAppStore((state) => state.authKey);
    const isHydrated = useAppStore((state) => state.isHydrated);
    const router = useRouter();
    const rootNavigationState = useRootNavigationState();

    useEffect(() => {
        // 1. Auth check must run ONLY ONCE (guarded by deps)
        // 2. Navigation must run ONLY AFTER auth check completes (isHydrated)
        if (!isHydrated || !rootNavigationState?.key) return;

        const performNavigation = () => {
            if (authKey) {
                router.replace('/(tabs)');
            } else {
                router.replace('/welcome');
            }
        };

        // Delay slightly to allow root layout to mount
        const timer = setTimeout(performNavigation, 0);
        return () => clearTimeout(timer);

    }, [authKey, isHydrated, rootNavigationState?.key]);

    // 3. While auth is being checked, render loading screen
    return <LoadingScreen />;
}

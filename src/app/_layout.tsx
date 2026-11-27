/**
 * Tomato Animes - Root Layout
 * Expo Router v4 root layout with providers
 */

import React from 'react';
import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@theme/themeProvider';
import { ToastProvider } from '@components/glass';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAuth } from '@hooks/useAuth';
import { useEffect } from 'react';
import { SplashScreen } from '@screens/SplashScreen';

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const { initializeAuth } = useAuth();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultColorScheme="system">
          <ToastProvider>
            <Slot />
            <StatusBar style="auto" />
          </ToastProvider>
        </ThemeProvider>
        {__DEV__ && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
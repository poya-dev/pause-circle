// Import  global CSS file
import '../../global.css';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colorScheme } from 'nativewind';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { APIProvider } from '@/api';
import { loadSelectedTheme } from '@/lib/hooks/use-selected-theme';
import { useAuthStore } from '@/lib/stores';

const queryClient = new QueryClient();

export default function RootLayout() {
  const { isAuthenticated, loading, initialize } = useAuthStore();
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    // Force dark theme for our app
    colorScheme.set('dark');
    loadSelectedTheme();

    let mounted = true;

    const initAuth = async () => {
      try {
        await initialize();
      } finally {
        if (mounted) {
          setIsInitialized(true);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, [initialize]);

  // Only show loading state during initial load
  if (!isInitialized) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: '#0B1020' }}
        >
          <ActivityIndicator size="large" color="#22D3EE" />
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <QueryClientProvider client={queryClient}>
          <APIProvider>
            <StatusBar style="light" backgroundColor="#0B1020" />
            {loading ? (
              <View
                className="flex-1 items-center justify-center"
                style={{ backgroundColor: '#0B1020' }}
              >
                <ActivityIndicator size="large" color="#22D3EE" />
              </View>
            ) : !isAuthenticated ? (
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'fade',
                }}
              >
                <Stack.Screen name="(app)" />
              </Stack>
            ) : (
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Screen name="(app)" />
              </Stack>
            )}
          </APIProvider>
        </QueryClientProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

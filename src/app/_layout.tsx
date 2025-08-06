// Import  global CSS file
import '../../global.css';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { APIProvider } from '@/api';
import { useAuthStore } from '@/lib/stores';

const queryClient = new QueryClient();

export default function RootLayout() {
  const { isAuthenticated, loading, initialize } = useAuthStore();
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
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
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <QueryClientProvider client={queryClient}>
          <APIProvider>
            <StatusBar style="dark" />
            {loading ? (
              <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#2563EB" />
              </View>
            ) : !isAuthenticated ? (
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'fade',
                }}
              >
                <Stack.Screen name="welcome" />
                <Stack.Screen name="login" />
                <Stack.Screen name="signup" />
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

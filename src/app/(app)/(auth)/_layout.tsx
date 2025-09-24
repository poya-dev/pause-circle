import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router, Stack } from 'expo-router';
import * as React from 'react';

import colors from '@/components/ui/colors';

const modalHeader = {
  headerShown: true,
  headerTitleAlign: 'center' as const,
  headerBackground: () => <BlurView tint="dark" intensity={28} />,
  headerLeft: () => (
    <Ionicons
      name="close"
      size={22}
      color={colors.text.primary}
      style={{ paddingHorizontal: 12 }}
      onPress={() => router.back()}
    />
  ),
} as const;

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.base.DEFAULT },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="sign-up-email"
        options={{
          ...modalHeader,
          presentation: 'modal',
          headerShown: true,
          title: 'Create account',
          headerTitleStyle: {
            color: colors.text.primary,
            fontWeight: '600',
          },
        }}
      />
    </Stack>
  );
}

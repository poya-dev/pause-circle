import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { useAuthStore } from '@/lib/stores';

function NotificationIcon() {
  const scale = useSharedValue(1);
  const hasUnread = true; // Replace with real notification state

  React.useEffect(() => {
    if (hasUnread) {
      scale.value = withRepeat(
        withSequence(withSpring(1.2), withSpring(1)),
        3,
        true
      );
    }
  }, [hasUnread, scale]);

  const rStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable className="relative p-2">
      <Animated.View style={rStyle}>
        <Ionicons
          name="notifications-outline"
          size={24}
          color={hasUnread ? '#00C4B4' : '#94A3B8'}
        />
        {hasUnread && (
          <View className="absolute right-2 top-2 size-2 rounded-full bg-[#00C4B4]" />
        )}
      </Animated.View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView
        className="flex-1 bg-neutral-50"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header */}
        <Animated.View
          entering={FadeIn}
          className="bg-white px-4 pb-4"
          style={{ paddingTop: insets.top + 14 }}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-neutral-900">
                Hi, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}!
              </Text>
              <Text className="text-neutral-500">
                Let&apos;s stay focused today
              </Text>
            </View>
            <NotificationIcon />
          </View>
          <View className="h-4" />
          <View className="flex-row items-center gap-2">
            <Ionicons name="calendar-outline" size={24} color="#00C4B4" />
            <Text className="text-neutral-500">Today</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </>
  );
}

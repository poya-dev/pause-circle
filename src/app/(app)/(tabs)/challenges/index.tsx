import { router, Stack } from 'expo-router';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';

export default function ChallengesScreen() {
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
                Challenges
              </Text>
              <Text className="text-neutral-500">
                Build better digital habits together
              </Text>
            </View>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => router.push('/challenges/join-challenge')}
                className="rounded-lg border border-[#00C4B4] px-4 py-2"
              >
                <Text className="font-medium text-[#00C4B4]">Join</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/challenges/create-challenge')}
                className="rounded-lg bg-[#00C4B4] px-4 py-2"
              >
                <Text className="font-medium text-white">Create</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </>
  );
}

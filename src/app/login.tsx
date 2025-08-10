import * as React from 'react';

import { Button, SafeAreaView, Text, View } from '@/components/ui';

export default function LoginScreen(): React.ReactElement {
  return (
    <SafeAreaView className="bg-charcoal-950 flex-1">
      <View className="flex-1 px-6">
        {/* Brand */}
        <View className="mt-16 items-center">
          <View className="bg-primary-600/20 size-14 items-center justify-center rounded-full">
            <View className="bg-primary-600 size-9 rounded-full" />
          </View>
          <Text className="mt-4 text-2xl font-semibold text-neutral-100">
            Pause Circle
          </Text>
          <Text className="mt-2 text-center text-neutral-400">
            Sign in to start focusing
          </Text>
        </View>

        {/* Social sign-in (UI only) */}
        <View className="mt-12 space-y-4">
          <Button
            onPress={() => {}}
            className="h-[52px] rounded-xl bg-white/10"
            variant="outline"
            size="lg"
          >
            <Text className="text-neutral-100">Continue with Apple</Text>
          </Button>
          <Button
            onPress={() => {}}
            className="h-[52px] rounded-xl bg-white"
            variant="outline"
            size="lg"
          >
            <Text className="text-neutral-900">Continue with Google</Text>
          </Button>
          <Button
            onPress={() => {}}
            className="h-[52px] rounded-xl border border-neutral-800 bg-transparent"
            variant="ghost"
            size="lg"
          >
            <Text className="text-neutral-200">Continue with Email</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

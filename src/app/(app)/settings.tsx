import { Stack } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { useAuth } from '@/lib/auth';

export default function SettingsScreen() {
  const { signOut } = useAuth();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerShown: true,
        }}
      />
      <View className="flex-1 bg-white p-4">
        <View className="space-y-4">
          <View className="rounded-lg border border-neutral-200 bg-white">
            <View className="border-b border-neutral-200 p-4">
              <Text className="text-sm font-medium text-neutral-500">
                Account
              </Text>
            </View>
            <View className="p-4">
              <Button
                variant="destructive"
                onPress={() => {
                  signOut();
                }}
              >
                <Text className="font-medium text-white">Sign Out</Text>
              </Button>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}

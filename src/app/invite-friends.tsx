import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as React from 'react';
import { Alert, Share } from 'react-native';

import { Button, SafeAreaView, Text, View } from '@/components/ui';

export default function InviteFriendsScreen() {
  const handleShare = async () => {
    try {
      const result = await Share.share({
        message:
          'Join my Unscroll challenge! Click here to join: unscroll.app/join?code=xyz',
      });

      if (result.action === Share.sharedAction) {
        router.replace('/(app)');
      }
    } catch (_error) {
      Alert.alert('Error', 'Failed to share challenge');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="mt-16">
          <Text className="mb-3 text-[32px] font-bold text-neutral-900">
            Invite Friends
          </Text>
          <Text className="mb-8 text-xl leading-relaxed text-neutral-600">
            Share the challenge with your friends
          </Text>
        </View>

        {/* Illustration */}
        <View className="items-center">
          <View className="mb-10 size-[160px] items-center justify-center rounded-3xl bg-blue-50">
            <Ionicons name="share-social" size={80} color="#2563EB" />
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mt-auto space-y-5 pb-8">
          <Button
            onPress={handleShare}
            className="h-[52px] rounded-xl bg-blue-600"
            variant="default"
            size="lg"
          >
            <Text className="text-lg font-medium text-white">
              Share Challenge
            </Text>
          </Button>

          <Button
            onPress={() => router.replace('/(app)')}
            className="h-[52px] rounded-xl border-2 border-neutral-200"
            variant="ghost"
            size="lg"
          >
            <Text className="text-lg font-medium text-neutral-900">Skip</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

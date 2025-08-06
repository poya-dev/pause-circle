import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui';
import { useAuthStore } from '@/lib/stores';

type SettingItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  isDestructive?: boolean;
  onPress?: () => void;
};

function SettingItem({
  icon,
  label,
  value,
  isDestructive,
  onPress,
}: SettingItemProps) {
  return (
    <Pressable
      className="flex-row items-center justify-between border-b border-neutral-100 px-5 py-4 active:bg-neutral-50/50"
      onPress={onPress}
    >
      <View className="flex-row items-center gap-4">
        <Ionicons
          name={icon}
          size={22}
          color={isDestructive ? '#ef4444' : '#64748b'}
        />
        <Text
          className={`text-[16px] ${
            isDestructive ? 'text-red-500' : 'text-slate-700'
          }`}
        >
          {label}
        </Text>
      </View>
      {value && (
        <View className="flex-row items-center">
          <Text className="mr-2 text-[15px] text-slate-500">{value}</Text>
          <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
        </View>
      )}
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="mb-2 px-5 text-[15px] font-medium text-slate-500">
      {title}
    </Text>
  );
}

export default function SettingsScreen() {
  const { signOut } = useAuthStore();

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="py-6">
        {/* General Section */}
        <View className="mb-8">
          <SectionHeader title="General" />
          <View className="bg-white">
            <SettingItem
              icon="notifications-outline"
              label="Notifications"
              value="On"
              onPress={() => {}}
            />
            <SettingItem
              icon="moon-outline"
              label="Dark Mode"
              value="Off"
              onPress={() => {}}
            />
            <SettingItem
              icon="lock-closed-outline"
              label="Privacy"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Support Section */}
        <View className="mb-8">
          <SectionHeader title="Support" />
          <View className="bg-white">
            <SettingItem
              icon="help-circle-outline"
              label="Help Center"
              onPress={() => {}}
            />
            <SettingItem
              icon="star-outline"
              label="Rate Us"
              onPress={() => {}}
            />
            <SettingItem
              icon="document-text-outline"
              label="Terms of Service"
              onPress={() => {}}
            />
            <SettingItem
              icon="shield-outline"
              label="Privacy Policy"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Account Section */}
        <View className="mb-8">
          <SectionHeader title="Account" />
          <View className="bg-white">
            <SettingItem
              icon="log-out-outline"
              label="Sign Out"
              isDestructive
              onPress={signOut}
            />
          </View>
        </View>

        {/* Version Info */}
        <Text className="text-center text-[13px] text-slate-400">
          Version 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

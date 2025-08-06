import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as React from 'react';

import { SafeAreaView, Text, View } from './';

type HeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
};

export function Header({
  title,
  subtitle,
  showBack = true,
  rightElement,
}: HeaderProps) {
  const router = useRouter();

  return (
    <View className="bg-white">
      <SafeAreaView edges={['top']} className="bg-white">
        <View className="border-b border-neutral-100 px-4 pb-2 pt-1">
          <View className="flex-row items-center">
            {showBack && (
              <View
                className="mr-2 size-7 items-center justify-center rounded-full active:bg-neutral-50"
                onTouchEnd={() => router.back()}
              >
                <Ionicons name="chevron-back" size={18} color="#171717" />
              </View>
            )}
            <View>
              <Text className="text-[17px] font-medium text-neutral-900">
                {title}
              </Text>
              {subtitle && (
                <Text className="text-[13px] leading-relaxed text-neutral-600">
                  {subtitle}
                </Text>
              )}
            </View>
          </View>
          {rightElement && (
            <View className="absolute right-4 top-1/2 -translate-y-1/2">
              {rightElement}
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

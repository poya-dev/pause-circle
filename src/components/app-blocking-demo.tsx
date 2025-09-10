import * as React from 'react';

import { Pressable, Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';

import { AppBlockingOverlay } from './app-blocking-overlay';

export function AppBlockingDemo(): React.ReactElement {
  const [showOverlay, setShowOverlay] = React.useState(false);
  const [blockReason, setBlockReason] = React.useState<'rule' | 'focus'>(
    'focus'
  );

  return (
    <View className="p-4">
      <Text
        className="mb-4 text-lg font-semibold"
        style={{ color: colors.text.primary }}
      >
        App Blocking Demo
      </Text>

      <View className="gap-3">
        <Pressable
          onPress={() => {
            setBlockReason('focus');
            setShowOverlay(true);
          }}
          className="rounded-xl px-4 py-3"
          style={{ backgroundColor: colors.primary.light }}
        >
          <Text
            className="text-center font-semibold"
            style={{ color: colors.base.DEFAULT }}
          >
            Demo Focus Block
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            setBlockReason('rule');
            setShowOverlay(true);
          }}
          className="rounded-xl border border-white/20 px-4 py-3"
        >
          <Text
            className="text-center font-medium"
            style={{ color: colors.text.primary }}
          >
            Demo Schedule Block
          </Text>
        </Pressable>
      </View>

      <AppBlockingOverlay
        visible={showOverlay}
        onClose={() => setShowOverlay(false)}
        blockedApp={{
          packageName: 'com.instagram.android',
          appName: 'Instagram',
        }}
        blockReason={blockReason}
        ruleName={blockReason === 'rule' ? 'Evening Focus Time' : undefined}
        timeRemaining={blockReason === 'focus' ? 1234 : undefined}
      />
    </View>
  );
}

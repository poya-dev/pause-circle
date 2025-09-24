import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { Modal } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Pressable, Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';
import { useAppInfo, useFocusSession } from '@/lib/hooks';

type AppBlockingOverlayProps = {
  visible: boolean;
  onClose: () => void;
  blockedApp: {
    packageName: string;
    appName: string;
  };
  blockReason: 'rule' | 'focus';
  ruleName?: string;
  timeRemaining?: number; // for focus sessions, in seconds
};

export function AppBlockingOverlay({
  visible,
  onClose,
  blockedApp,
  blockReason,
  ruleName,
  timeRemaining,
}: AppBlockingOverlayProps): React.ReactElement {
  const { session, pauseSession } = useFocusSession();
  const getAppInfo = useAppInfo();

  const appInfo = React.useMemo(() => {
    return getAppInfo(blockedApp.packageName);
  }, [blockedApp.packageName, getAppInfo]);

  const formatTime = React.useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleBreakRule = () => {
    // In a real app, you might want to add some friction here
    // like requiring a reason, showing consequences, etc.
    onClose();
  };

  const handlePauseFocus = () => {
    if (session) {
      pauseSession();
    }
    onClose();
  };

  if (!visible) return <></>;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1">
        {/* Background */}
        <LinearGradient
          colors={[colors.base.DEFAULT, colors.base[900], '#0D1424']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute inset-0"
        />

        <BlurView tint="dark" intensity={80} className="flex-1">
          <View className="flex-1 items-center justify-center px-8">
            {/* App Icon and Info */}
            <View className="mb-8 items-center">
              <View
                className="mb-4 size-24 items-center justify-center rounded-3xl shadow-2xl"
                style={{
                  backgroundColor: `${appInfo.color}20`,
                  borderWidth: 2,
                  borderColor: `${appInfo.color}40`,
                }}
              >
                <Ionicons
                  name={appInfo.icon as any}
                  size={48}
                  color={appInfo.color}
                />
              </View>

              <Text className="mb-2 text-center text-2xl font-bold text-white">
                {blockedApp.appName}
              </Text>

              <View className="flex-row items-center rounded-full bg-red-500/20 px-4 py-2">
                <Ionicons name="shield-outline" size={16} color="#EF4444" />
                <Text className="ml-2 text-sm font-medium text-red-400">
                  App Blocked
                </Text>
              </View>
            </View>

            {/* Block Reason */}
            <View className="mb-8 w-full rounded-2xl bg-white/5 p-6">
              {blockReason === 'focus' ? (
                <>
                  <View className="mb-4 flex-row items-center justify-center">
                    <Ionicons
                      name="flash"
                      size={24}
                      color={colors.primary.light}
                    />
                    <Text className="ml-2 text-lg font-semibold text-white">
                      Focus Session Active
                    </Text>
                  </View>

                  {timeRemaining && timeRemaining > 0 && (
                    <View className="mb-4 items-center">
                      <View className="relative">
                        <Svg width={100} height={100} viewBox="0 0 100 100">
                          <Circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="4"
                          />
                          <Circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={colors.primary.light}
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - timeRemaining / (session?.duration || 1) / 60)}`}
                            transform="rotate(-90 50 50)"
                          />
                        </Svg>

                        <View className="absolute inset-0 items-center justify-center">
                          <Text className="text-lg font-bold text-white">
                            {formatTime(timeRemaining)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  <Text className="text-center text-sm text-gray-300">
                    You&apos;re in a focus session. This app is temporarily
                    blocked to help you stay concentrated.
                  </Text>
                </>
              ) : (
                <>
                  <View className="mb-4 flex-row items-center justify-center">
                    <Ionicons
                      name="time-outline"
                      size={24}
                      color={colors.primary.light}
                    />
                    <Text className="ml-2 text-lg font-semibold text-white">
                      Scheduled Block
                    </Text>
                  </View>

                  {ruleName && (
                    <View className="mb-3 rounded-lg bg-white/5 p-3">
                      <Text className="text-center text-sm font-medium text-gray-300">
                        Rule: {ruleName}
                      </Text>
                    </View>
                  )}

                  <Text className="text-center text-sm text-gray-300">
                    This app is blocked according to your schedule. Focus on
                    what matters most.
                  </Text>
                </>
              )}
            </View>

            {/* Action Buttons */}
            <View className="w-full gap-3">
              {blockReason === 'focus' ? (
                <>
                  <Pressable
                    onPress={handlePauseFocus}
                    className="w-full rounded-xl py-4"
                    style={{ backgroundColor: colors.primary.light }}
                  >
                    <Text className="text-center text-base font-semibold text-black">
                      Pause Focus Session
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={onClose}
                    className="w-full rounded-xl border border-white/20 py-4"
                  >
                    <Text className="text-center text-base font-medium text-white">
                      Go Back
                    </Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable
                    onPress={onClose}
                    className="w-full rounded-xl py-4"
                    style={{ backgroundColor: colors.primary.light }}
                  >
                    <Text className="text-center text-base font-semibold text-black">
                      Stay Focused
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleBreakRule}
                    className="w-full rounded-xl border border-red-500/50 py-4"
                  >
                    <Text className="text-center text-base font-medium text-red-400">
                      Override Block (Not Recommended)
                    </Text>
                  </Pressable>
                </>
              )}
            </View>

            {/* Quick Stats */}
            <View className="mt-8 w-full rounded-xl bg-white/5 p-4">
              <Text className="mb-2 text-center text-xs font-medium text-gray-400">
                Today&apos;s Progress
              </Text>
              <View className="flex-row justify-around">
                <View className="items-center">
                  <Text className="text-sm font-bold text-white">2h 15m</Text>
                  <Text className="text-xs text-gray-400">Focused</Text>
                </View>
                <View className="items-center">
                  <Text className="text-sm font-bold text-white">7</Text>
                  <Text className="text-xs text-gray-400">Blocks</Text>
                </View>
                <View className="items-center">
                  <Text className="text-sm font-bold text-white">89%</Text>
                  <Text className="text-xs text-gray-400">Success</Text>
                </View>
              </View>
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

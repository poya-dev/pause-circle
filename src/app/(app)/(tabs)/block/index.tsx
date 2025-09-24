import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import * as React from 'react';
import { Alert, Animated, Easing, TextInput } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppSelection } from '@/components/app-selection';
import { Pressable, ScrollView, Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';
import { useAppInfo, useBlockingRules, useInstalledApps } from '@/lib/hooks';

// Types removed - using types from the blocking service

// Glass helpers removed - not used in this component

export default function BlockScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const {
    rules,
    deleteRule: deleteRuleMutation,
    updateRule,
  } = useBlockingRules();

  // Animation for floating button
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (showCreateModal) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [showCreateModal, pulseAnim]);

  const toggleRule = (id: string) => {
    const rule = rules.find((r) => r.id === id);
    if (rule) {
      updateRule({ id, updates: { isActive: !rule.isActive } });
    }
  };

  const deleteRule = (id: string) => {
    Alert.alert('Delete Rule', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteRuleMutation(id),
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1" style={{ backgroundColor: colors.base.DEFAULT }}>
        <LinearGradient
          colors={[colors.base.DEFAULT, colors.base[900], '#0D1424']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute inset-0"
        />

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingTop: insets.top + 16,
            paddingBottom: 120,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6">
            {/* Header */}
            <View className="mb-8">
              <Text
                className="text-2xl font-bold"
                style={{ color: colors.text.primary }}
              >
                Block Apps
              </Text>
              <Text
                className="mt-1 text-base"
                style={{ color: colors.text.secondary }}
              >
                Focus on what matters
              </Text>
            </View>

            {/* Rules List */}
            {rules.length > 0 ? (
              <>
                {rules.some((r) => r.isActive) && (
                  <View className="mb-6 pb-2">
                    <Text
                      className="mb-4 text-lg font-semibold"
                      style={{ color: colors.text.primary }}
                    >
                      Active
                    </Text>
                    <View className="gap-4">
                      {rules
                        .filter((r) => r.isActive)
                        .map((rule) => (
                          <RuleItem
                            key={rule.id}
                            rule={rule}
                            onToggle={() => toggleRule(rule.id)}
                            onDelete={() => deleteRule(rule.id)}
                          />
                        ))}
                    </View>
                  </View>
                )}

                {rules.some((r) => !r.isActive) && (
                  <View className="mb-6 pb-2">
                    <Text
                      className="mb-4 text-lg font-semibold"
                      style={{ color: colors.text.primary }}
                    >
                      Scheduled
                    </Text>
                    <View className="gap-4">
                      {rules
                        .filter((r) => !r.isActive)
                        .map((rule) => (
                          <RuleItem
                            key={rule.id}
                            rule={rule}
                            onToggle={() => toggleRule(rule.id)}
                            onDelete={() => deleteRule(rule.id)}
                          />
                        ))}
                    </View>
                  </View>
                )}
              </>
            ) : (
              // ✅ Empty State: Better Placeholder with Icon and Description
              <View className="items-center py-16">
                <View
                  className="mb-6 size-24 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  <Ionicons
                    name="shield-outline"
                    size={40}
                    color={colors.text.muted}
                  />
                </View>
                <Text
                  className="mb-2 text-center text-lg font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  No rules created yet
                </Text>
                <Text
                  className="text-center text-base leading-6"
                  style={{ color: colors.text.muted }}
                >
                  Create your first app blocking rule to start focusing on what
                  matters
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Create Rule Modal */}
        <CreateRuleBottomSheet
          isVisible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateRule={() => {
            setShowCreateModal(false);
          }}
        />

        {/* Floating Action Button */}
        <BlockAppsButton
          onFocus={() => setShowCreateModal(true)}
          visible={!showCreateModal}
        />
      </View>
    </>
  );
}

function BlockAppsButton({
  onFocus,
  visible,
}: {
  onFocus: () => void;
  visible: boolean;
}) {
  const bob = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: 3000,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 3000,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bob]);

  const translateY = bob.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 100,
        borderRadius: 20,
        zIndex: 999,
      }}
    >
      <BlurView
        tint="dark"
        intensity={40}
        style={{ borderRadius: 20, zIndex: 999 }}
      >
        <Pressable
          onPress={onFocus}
          className="flex-row items-center justify-center rounded-2xl border border-white/10 p-4 active:opacity-90"
          style={{
            backgroundColor: 'rgba(13,20,36,0.6)',
          }}
          android_ripple={{ color: '#FFFFFF20' }}
        >
          <Ionicons
            name="shield-outline"
            size={20}
            color={colors.primary.light}
          />
          <Text className="ml-2 text-lg font-medium text-white">
            Block Apps
          </Text>
        </Pressable>
      </BlurView>
    </Animated.View>
  );
}

// ---------- Rule Item Component (Matches Screenshot) ----------
function RuleItem({
  rule,
  onToggle,
  onDelete,
}: {
  rule: any; // Using the real BlockingRule type
  onToggle: () => void;
  onDelete: () => void;
}) {
  const { apps } = useInstalledApps();
  const getAppInfo = useAppInfo();

  const selectedApps = React.useMemo(() => {
    return apps.filter((app) => rule.blockedApps.includes(app.packageName));
  }, [apps, rule.blockedApps]);

  return (
    <View className="flex-row items-center gap-4 border-b border-white/10 py-4">
      {/* App Icons Stack */}
      <View className="flex-row">
        {selectedApps.slice(0, 3).map((app, i) => {
          const appInfo = getAppInfo(app.packageName);
          return (
            <View
              key={app.id}
              className="size-12 items-center justify-center rounded-xl"
              style={[
                {
                  backgroundColor: `${appInfo.color}15`,
                  marginLeft: i > 0 ? -8 : 0, // Reduced overlap for better stacking
                  zIndex: selectedApps.length - i, // Ensure proper layering
                },
              ]}
            >
              <Ionicons
                name={appInfo.icon as any}
                size={20}
                color={appInfo.color}
              />
            </View>
          );
        })}
        {selectedApps.length > 3 && (
          <View
            className="size-12 items-center justify-center rounded-xl"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              marginLeft: -8,
              zIndex: 1,
            }}
          >
            <Text style={{ color: colors.text.primary, fontSize: 12 }}>
              +{selectedApps.length - 3}
            </Text>
          </View>
        )}
      </View>

      {/* Details */}
      <View className="flex-1">
        <Text
          className="mb-1 text-base font-semibold"
          style={{ color: colors.text.primary }}
        >
          {rule.name}
        </Text>
        <Text className="mb-1 text-xs" style={{ color: colors.text.secondary }}>
          {selectedApps.map((app) => app.name).join(', ')} • {rule.startTime} -{' '}
          {rule.endTime}
        </Text>
        <Text className="text-xs" style={{ color: colors.text.muted }}>
          {rule.days.join(', ')}
        </Text>
      </View>

      {/* Actions */}
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={onToggle}
          className="rounded-full p-2 active:opacity-70"
          style={{ backgroundColor: `${rule.color}15` }}
        >
          <Ionicons
            name={rule.isActive ? 'pause' : 'play'}
            size={18}
            color={rule.color}
          />
        </Pressable>
        <Pressable
          onPress={onDelete}
          className="rounded-full p-2 active:opacity-70"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
        </Pressable>
      </View>
    </View>
  );
}

// ---------- Create Rule Bottom Sheet (Fixed Color Picker) ----------
function CreateRuleBottomSheet({
  isVisible,
  onClose,
  onCreateRule,
}: {
  isVisible: boolean;
  onClose: () => void;
  onCreateRule: () => void;
}) {
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const snapPoints = React.useMemo(() => ['85%'], []);
  const { createRule } = useBlockingRules();

  const [selectedApps, setSelectedApps] = React.useState<string[]>([]);
  const [startTime, setStartTime] = React.useState(new Date());
  const [endTime, setEndTime] = React.useState(new Date());
  const [selectedDays, setSelectedDays] = React.useState<string[]>([]);
  const [ruleName, setRuleName] = React.useState('');
  const [selectedColor, setSelectedColor] = React.useState('#22D3EE');
  const [showStartTimePicker, setShowStartTimePicker] = React.useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = React.useState(false);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  React.useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
      const now = new Date();
      now.setHours(18, 0, 0, 0);
      setStartTime(now);
      now.setHours(21, 0, 0, 0);
      setEndTime(now);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  // toggleApp function removed - now handled by AppSelection component

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  const handleCreate = () => {
    if (selectedApps.length === 0) {
      Alert.alert('Please select at least one app.');
      return;
    }
    if (selectedDays.length === 0) {
      Alert.alert('Please select at least one day.');
      return;
    }
    if (!ruleName.trim()) {
      Alert.alert('Please enter a rule name.');
      return;
    }

    createRule({
      name: ruleName.trim(),
      blockedApps: selectedApps,
      startTime: startTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      endTime: endTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      days: selectedDays,
      isActive: false,
      color: selectedColor,
    });

    onCreateRule();
    setSelectedApps([]);
    setSelectedDays([]);
    setRuleName('');
    setSelectedColor('#22D3EE');
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={isVisible ? 0 : -1}
      snapPoints={snapPoints}
      onClose={onClose}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: colors.base.DEFAULT }}
      handleIndicatorStyle={{ backgroundColor: colors.text.muted }}
    >
      <BottomSheetView className="flex-1 px-6">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="mb-6 flex-row items-center justify-between">
            <Text
              className="text-xl font-bold"
              style={{ color: colors.text.primary }}
            >
              Block Apps
            </Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text.muted} />
            </Pressable>
          </View>

          {/* App Selection */}
          <View className="mb-6 max-h-64">
            <AppSelection
              selectedApps={selectedApps}
              onSelectionChange={setSelectedApps}
              title="Select apps to block"
              description="Choose apps to include in this rule"
              categories={['social', 'entertainment', 'games', 'productivity']}
            />
          </View>

          {/* Time Range */}
          <View className="mb-6">
            <Text
              className="mb-3 text-sm font-medium"
              style={{ color: colors.text.secondary }}
            >
              Time Range
            </Text>
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Pressable
                  onPress={() => setShowStartTimePicker(true)}
                  className="rounded-xl px-4 py-3"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                >
                  <Text
                    className="text-center text-base font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    {formatTime(startTime)}
                  </Text>
                </Pressable>
              </View>
              <View className="flex-1">
                <Pressable
                  onPress={() => setShowEndTimePicker(true)}
                  className="rounded-xl px-4 py-3"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                >
                  <Text
                    className="text-center text-base font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    {formatTime(endTime)}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Repeat Days */}
          <View className="mb-6">
            <Text
              className="mb-3 text-sm font-medium"
              style={{ color: colors.text.secondary }}
            >
              Repeat
            </Text>
            <View className="flex-row justify-between">
              {days.map((day) => (
                <Pressable
                  key={day}
                  onPress={() => toggleDay(day)}
                  className={`size-10 items-center justify-center rounded-full ${
                    selectedDays.includes(day)
                      ? 'bg-primary-light'
                      : 'bg-white/8 border border-white/10'
                  }`}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{
                      color: selectedDays.includes(day)
                        ? colors.base.DEFAULT
                        : colors.text.primary,
                    }}
                  >
                    {day[0]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Rule Name */}
          <View className="mb-6">
            <TextInput
              value={ruleName}
              onChangeText={setRuleName}
              placeholder="e.g., Focus Time"
              placeholderTextColor={colors.text.muted}
              className="rounded-xl px-4 py-3 text-base"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: colors.text.primary,
              }}
            />
          </View>

          {/* Color Picker */}
          <View className="mb-6">
            <Text
              className="mb-3 text-sm font-medium"
              style={{ color: colors.text.secondary }}
            >
              Color
            </Text>
            <View className="flex-row gap-3">
              {[
                '#22D3EE',
                '#10B981',
                '#F59E0B',
                '#EF4444',
                '#8B5CF6',
                '#EC4899',
                '#B91C1C',
              ].map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  className="size-12 rounded-full"
                  style={{
                    backgroundColor: color,
                    borderWidth: selectedColor === color ? 3 : 0,
                    borderColor: 'rgba(255,255,255,0.8)',
                  }}
                />
              ))}
            </View>
          </View>

          {/* Create Button */}
          <Pressable
            onPress={handleCreate}
            className="mb-6 w-full rounded-xl py-4"
            style={{
              backgroundColor:
                selectedApps.length > 0 &&
                selectedDays.length > 0 &&
                ruleName.trim()
                  ? colors.primary.light
                  : colors.text.muted,
            }}
            disabled={
              !selectedApps.length || !selectedDays.length || !ruleName.trim()
            }
          >
            <Text
              className="text-center text-base font-semibold"
              style={{ color: colors.base.DEFAULT }}
            >
              Create Rule
            </Text>
          </Pressable>
        </ScrollView>

        {/* Time Pickers */}
        <DateTimePickerModal
          isVisible={showStartTimePicker}
          mode="time"
          onConfirm={(time) => {
            setStartTime(time);
            setShowStartTimePicker(false);
          }}
          onCancel={() => setShowStartTimePicker(false)}
          date={startTime}
        />
        <DateTimePickerModal
          isVisible={showEndTimePicker}
          mode="time"
          onConfirm={(time) => {
            setEndTime(time);
            setShowEndTimePicker(false);
          }}
          onCancel={() => setShowEndTimePicker(false)}
          date={endTime}
        />
      </BottomSheetView>
    </BottomSheet>
  );
}

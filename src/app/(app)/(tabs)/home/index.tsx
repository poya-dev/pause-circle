// app/(tabs)/home.tsx
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import * as React from 'react';
import { Modal, Pressable as RNPressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { AppSelection } from '@/components/app-selection';
import { Pressable, ScrollView, Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';

// ---------- Glass helpers ----------
const glass = {
  card: {
    backgroundColor: 'rgba(13,20,36,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
};
const blur = { subtle: 8, medium: 15, strong: 25 };

type CardProps = {
  children: React.ReactNode;
  className?: string;
  style?: any;
  onPress?: () => void;
};

const Card = ({ children, className, style, onPress }: CardProps) => {
  const content = (
    <BlurView tint="dark" intensity={28} style={{ borderRadius: 24 }}>
      <View
        className={className}
        style={[{ borderRadius: 24 }, glass.card, style]}
      >
        {children}
      </View>
    </BlurView>
  );
  if (onPress) {
    return (
      <RNPressable onPress={onPress} style={{ borderRadius: 24 }}>
        {content}
      </RNPressable>
    );
  }
  return content;
};

// ---------- Metric Card Component (copied from analytics) ----------
// This component is no longer used - removed in favor of inline metrics
function WeeklyScreenTimeChart({
  onBarPress,
}: {
  onBarPress: (day: string, time: number) => void;
}) {
  const weekData = [
    { day: 'Mon', time: 180, label: '3h' },
    { day: 'Tue', time: 210, label: '3h 30m' },
    { day: 'Wed', time: 165, label: '2h 45m' },
    { day: 'Thu', time: 195, label: '3h 15m' },
    { day: 'Fri', time: 240, label: '4h' },
    { day: 'Sat', time: 300, label: '5h' },
    { day: 'Today', time: 192, label: '3h 12m' },
  ];

  const maxTime = Math.max(...weekData.map((d) => d.time));
  const chartHeight = 100;
  const chartWidth = 275; // Reduced to fit better within container

  // Generate Y-axis ticks for better readability
  const yTicks = [0, 1, 2, 3, 4, 5, 6].map((h) => h * 60);

  // Add state for tooltip and selection
  const [selectedPoint, setSelectedPoint] = React.useState<string | null>(null);
  const [tooltipVisible, setTooltipVisible] = React.useState(false);
  const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 });

  const handlePointPress = (dayData: (typeof weekData)[0], index: number) => {
    const totalPoints = weekData.length;
    const pointWidth = chartWidth / totalPoints;

    const x = index * pointWidth + pointWidth / 2;
    const y = -50;

    setTooltipPosition({ x, y });
    setSelectedPoint(dayData.day);
    setTooltipVisible(true);

    setTimeout(() => {
      setTooltipVisible(false);
      setSelectedPoint(null);
    }, 2000);

    onBarPress(dayData.day, dayData.time);
  };

  return (
    <View className="mt-4">
      <View className="mb-3 flex-row items-center justify-between">
        <View>
          <Text className="text-sm font-medium text-gray-300">
            Weekly Trend
          </Text>
        </View>
      </View>

      <View className="w-full overflow-scroll rounded-xl bg-gray-800/30 p-4">
        {/* Main Chart Area */}
        <View className="flex-row">
          {/* Y-axis labels view with reduced width */}
          <View className="shrink-1 relative w-8 px-2">
            {yTicks.map((tick) => {
              const normalizedValue = tick - 0; // Always start from 0
              const range = Math.max(maxTime, 360) - 0; // Range from 0 to max or 6h
              const y =
                chartHeight - (normalizedValue / range) * (chartHeight - 8);
              const isVisible = tick >= 0 && tick <= Math.max(maxTime, 360); // Show 0-6h range

              if (!isVisible) return null;

              return (
                <View
                  key={tick}
                  className="absolute w-6 items-end justify-center"
                  style={{ top: y - 8, left: 0, height: 16 }}
                >
                  <Text className="text-[8px] font-light text-gray-50  dark:text-gray-500">
                    {tick === 0 ? '0m' : `${tick / 60}h`}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Sparkline chart view with constrained width */}
          <View
            className="relative"
            style={{ height: chartHeight, width: chartWidth - 10 }}
          >
            <Svg
              width={chartWidth - 10}
              height={chartHeight}
              viewBox={`0 0 ${chartWidth - 10} ${chartHeight}`}
            >
              {yTicks.map((tick) => {
                const normalizedValue = tick - 0; // Always start from 0
                const range = Math.max(maxTime, 360) - 0; // Range from 0 to max or 6h
                const y =
                  chartHeight - (normalizedValue / range) * (chartHeight - 8);
                const isVisible = tick >= 0 && tick <= Math.max(maxTime, 360); // Show 0-6h range

                if (!isVisible) return null;

                return (
                  <Line
                    key={tick}
                    x1="0"
                    y1={y}
                    x2={chartWidth - 10}
                    y2={y}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="0.5"
                  />
                );
              })}

              <Path
                d={weekData
                  .map((dayData, index) => {
                    const x = (index / (weekData.length - 1)) * chartWidth;
                    const normalizedValue = dayData.time - 0; // Always start from 0
                    const range = Math.max(maxTime, 360) - 0; // Range from 0 to max or 6h
                    const y =
                      chartHeight -
                      (normalizedValue / range) * (chartHeight - 8);
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ')}
                stroke={colors.primary.light}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {weekData.map((dayData, index) => {
                const x = (index / (weekData.length - 1)) * chartWidth;
                const normalizedValue = dayData.time - 0; // Always start from 0
                const range = Math.max(maxTime, 360) - 0; // Range from 0 to max or 6h
                const y =
                  chartHeight - (normalizedValue / range) * (chartHeight - 8);
                const isToday = dayData.day === 'Today';
                const isSelected = selectedPoint === dayData.day;

                return (
                  <Circle
                    key={dayData.day}
                    cx={x}
                    cy={y}
                    r={isToday || isSelected ? 4 : 2}
                    fill={
                      isToday
                        ? colors.primary.light
                        : isSelected
                          ? '#60A5FA'
                          : '#6B7280'
                    }
                    stroke={isToday ? colors.primary.light : 'transparent'}
                    strokeWidth={isToday ? 2 : 0}
                  />
                );
              })}
            </Svg>

            {/* Interactive overlay for touch */}
            <View className="absolute inset-0">
              {weekData.map((dayData, index) => {
                const pointWidth = chartWidth / weekData.length;
                return (
                  <Pressable
                    key={dayData.day}
                    onPress={() => handlePointPress(dayData, index)}
                    style={{
                      position: 'absolute',
                      left: index * pointWidth,
                      top: 0,
                      width: pointWidth,
                      height: chartHeight,
                    }}
                  />
                );
              })}
            </View>
          </View>
        </View>

        {/* Day labels with proper alignment */}
        <View
          className="mt-3 flex-row justify-between px-1"
          style={{ marginLeft: 32, width: chartWidth - 20 }}
        >
          {weekData.map((dayData) => (
            <View key={dayData.day} className="items-center">
              <Text
                className={`gap-2 text-xs font-light ${
                  dayData.day === 'Today'
                    ? selectedPoint === dayData.day
                      ? 'text-primary-light'
                      : 'text-primary-light'
                    : selectedPoint === dayData.day
                      ? 'text-blue-300'
                      : 'text-gray-400'
                }`}
              >
                {dayData.day}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Tooltip */}
      {tooltipVisible && selectedPoint && (
        <View
          className="absolute z-10 rounded-lg bg-gray-800 px-3 py-2 shadow-lg"
          style={{
            left: tooltipPosition.x + 32, // Adjusted for Y-axis width
            top: tooltipPosition.y + 100, // Positioned above chart
            opacity: tooltipVisible ? 1 : 0,
          }}
        >
          <Text className="text-center text-sm font-medium text-white">
            {weekData.find((d) => d.day === selectedPoint)?.label}
          </Text>
          {/* Tooltip arrow */}
          <View className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-gray-800" />
        </View>
      )}
    </View>
  );
}

// ---------- Focus Duration Bottom Sheet ----------
function FocusDurationBottomSheet({
  visible,
  onClose,
  onStart,
}: {
  visible: boolean;
  onClose: () => void;
  onStart: (duration: number, selectedApps: string[]) => void;
}) {
  const durations = [15, 25, 45, 60];
  const [selectedDuration, setSelectedDuration] = React.useState(25);
  const [selectedApps, setSelectedApps] = React.useState<string[]>([]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/50">
        <Pressable className="flex-1" onPress={onClose} />
        <BlurView
          tint="dark"
          intensity={40}
          style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        >
          <View className="rounded-t-3xl bg-gray-900/80 p-6">
            {/* Header with close button */}
            <View className="mb-6">
              {/* Close button positioned absolutely at top right */}
              <View className="absolute right-0 top-0 z-10">
                <Pressable onPress={onClose}>
                  <Ionicons name="close" size={24} color={colors.text.muted} />
                </Pressable>
              </View>

              {/* Centered title and icon */}
              <View className="items-center">
                <Ionicons name="flash" size={32} color={colors.primary.light} />
                <Text className="mt-2 text-xl font-bold text-white">
                  Focus Session
                </Text>
                <Text className="mt-1 text-sm text-gray-400">
                  Block distractions and stay focused
                </Text>
              </View>
            </View>

            {/* Duration Selection */}
            <View className="mb-6">
              <Text className="mb-3 text-sm font-medium text-gray-300">
                Duration
              </Text>
              <View className="flex-row justify-between gap-3">
                {durations.map((duration) => (
                  <Pressable
                    key={duration}
                    onPress={() => setSelectedDuration(duration)}
                    className={`flex-1 items-center rounded-xl py-4 ${
                      selectedDuration === duration
                        ? 'bg-primary-light'
                        : 'bg-gray-800/50'
                    }`}
                  >
                    <Text
                      className={`text-lg font-bold ${
                        selectedDuration === duration
                          ? 'text-black'
                          : 'text-white'
                      }`}
                    >
                      {duration}
                    </Text>
                    <Text
                      className={`text-xs ${
                        selectedDuration === duration
                          ? 'text-black/70'
                          : 'text-gray-400'
                      }`}
                    >
                      min
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* App Selection */}
            <View className="mb-6 max-h-80">
              <AppSelection
                selectedApps={selectedApps}
                onSelectionChange={setSelectedApps}
                title="Block Apps"
                description="Select apps to block during focus session"
                categories={['social', 'entertainment', 'games']}
                maxSelection={10}
              />
            </View>

            {/* Start Focus Button */}
            <Pressable
              onPress={() => onStart(selectedDuration, selectedApps)}
              className="w-full rounded-xl py-4"
              style={{
                backgroundColor: colors.primary.light,
              }}
            >
              <Text className="text-center text-base font-semibold text-black">
                Start Focus
              </Text>
            </Pressable>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

// ---------- Focus Mode Overlay ----------
function FocusModeOverlay({
  visible,
  timeLeft,
  totalTime,
  onPause,
  selectedApps,
}: {
  visible: boolean;
  timeLeft: number;
  totalTime: number;
  onPause: () => void;
  selectedApps: string[];
}) {
  if (!visible) return null;

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset =
    circumference - (timeLeft / totalTime) * circumference;

  return (
    <View className="absolute inset-0 z-[300]">
      <BlurView tint="dark" intensity={60} className="flex-1">
        <View className="flex-1 items-center justify-center">
          {/* Timer Circle */}
          <View className="relative">
            <Svg width={200} height={200} viewBox="0 0 200 200">
              <Circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
              />
              <Circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={colors.primary.light}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 100 100)"
              />
            </Svg>

            <View className="absolute inset-0 flex items-center justify-center">
              <Text className="text-4xl font-bold text-white">
                {formatMins(timeLeft)}
              </Text>
            </View>
          </View>

          {/* Selected Apps Info */}
          {selectedApps.length > 0 && (
            <View className="mt-4 rounded-full bg-white/10 px-4 py-2">
              <Text className="text-sm text-white">
                Focusing on {selectedApps.length} app
                {selectedApps.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}

          {/* Pause Button */}
          <Pressable
            onPress={onPause}
            className="mt-8 rounded-full bg-white/20 px-8 py-3"
          >
            <Text className="text-lg font-medium text-white">Pause Focus</Text>
          </Pressable>
        </View>
      </BlurView>
    </View>
  );
}

// ---------- Main Screen ----------
export default function HomeScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();

  // Mock data
  const userName = 'Friend';
  const [screenTimeToday] = React.useState(3 * 60 + 12);
  const [screenTimeYesterday] = React.useState(3 * 60 + 25);
  const screenDelta = screenTimeToday - screenTimeYesterday;

  // Focus state & timer
  const [focusActive, setFocusActive] = React.useState(false);
  const [showDurationSheet, setShowDurationSheet] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(25 * 60);
  const [totalFocusTime, setTotalFocusTime] = React.useState(25 * 60);
  const [selectedApps, setSelectedApps] = React.useState<string[]>([]);

  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (focusActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && focusActive) {
      setFocusActive(false);
      setTimeLeft(totalFocusTime);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [focusActive, timeLeft, totalFocusTime]);

  const onFocus = () => {
    setShowDurationSheet(true);
  };

  const onStartFocus = (duration: number, apps: string[]) => {
    setTotalFocusTime(duration * 60);
    setTimeLeft(duration * 60);
    setSelectedApps(apps);
    setFocusActive(true);
    setShowDurationSheet(false);
  };

  const onPauseFocus = () => {
    setFocusActive(false);
    setTimeLeft(totalFocusTime);
  };

  const deltaLabel =
    screenDelta === 0
      ? '— vs yesterday'
      : `${screenDelta > 0 ? '+' : '-'}${formatMins(Math.abs(screenDelta))} vs yesterday`;

  const greeting = React.useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

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
            paddingHorizontal: 24,
            paddingBottom: 140,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="mb-6 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="to-primary-DEFAULT size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-light">
                <View className="bg-base-DEFAULT size-9 items-center justify-center rounded-full">
                  <Ionicons
                    name="person"
                    size={18}
                    color={colors.primary.light}
                  />
                </View>
              </View>
              <View>
                <Text
                  className="text-lg font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  {userName}
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.text.secondary }}
                >
                  {greeting}
                </Text>
              </View>
            </View>

            <BlurView
              tint="dark"
              intensity={blur.subtle}
              className="overflow-hidden rounded-full"
              style={glass.card}
            >
              <RNPressable
                onPress={() => router.push('/settings')}
                style={{ borderRadius: 9999 }}
                hitSlop={10}
              >
                <View className="p-2">
                  <Ionicons
                    name="settings-outline"
                    size={20}
                    color={colors.text.muted}
                  />
                </View>
              </RNPressable>
            </BlurView>
          </View>

          {/* Screen Time Overview Card */}
          <Card className="mb-6 rounded-3xl p-6">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-white">
                Screen Time Today
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.text.muted}
              />
            </View>

            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-3xl font-bold text-white">
                {formatMins(screenTimeToday)}
              </Text>
              <Text className="mt-1 text-sm text-gray-400">{deltaLabel}</Text>
            </View>

            {/* Daily Usage Graph */}
            <WeeklyScreenTimeChart
              onBarPress={(day, time) => {
                console.log(`Bar pressed for ${day} with time: ${time}`);
              }}
            />

            {/* Top Apps Section */}
            <View className="mt-6 border-t border-gray-700/50 pt-4">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-sm font-medium text-gray-300">
                  Top Apps
                </Text>
                <Text className="text-xs text-gray-500">Today</Text>
              </View>
              <View className="flex-row justify-start">
                <View className="size-8 items-center justify-center rounded-full bg-red-500">
                  <Ionicons name="logo-youtube" size={14} color="white" />
                </View>
                <View className="-ml-2 size-8 items-center justify-center rounded-full bg-pink-500">
                  <Ionicons name="logo-instagram" size={14} color="white" />
                </View>
                <View className="-ml-2 size-8 items-center justify-center rounded-full bg-blue-500">
                  <Ionicons name="logo-twitter" size={14} color="white" />
                </View>
                <View className="-ml-2 size-8 items-center justify-center rounded-full bg-green-500">
                  <Ionicons name="logo-slack" size={14} color="white" />
                </View>
              </View>
            </View>

            {/* Focus & Pickups Section */}
            <View className="mt-6 border-t border-gray-700/50 pt-4">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-sm font-medium text-gray-300">
                  Today&apos;s Progress
                </Text>
                <Text className="text-xs text-gray-500">Focus & Pickups</Text>
              </View>
              <View className="flex-row gap-3">
                <View className="flex-1 flex-row items-center gap-3 rounded-2xl bg-gray-800/30 p-3">
                  <View className="size-8 items-center justify-center rounded-full bg-green-500/20">
                    <Ionicons name="flash-outline" size={16} color="#2ED48A" />
                  </View>
                  <View>
                    <Text className="text-xs text-gray-400">Focus</Text>
                    <Text className="text-lg font-bold text-white">1h 30m</Text>
                  </View>
                </View>
                <View className="flex-1 flex-row items-center gap-3 rounded-2xl bg-gray-800/30 p-3">
                  <View className="size-8 items-center justify-center rounded-full bg-blue-500/20">
                    <Ionicons
                      name="phone-portrait-outline"
                      size={16}
                      color="#6E8BFF"
                    />
                  </View>
                  <View>
                    <Text className="text-xs text-gray-400">Pickups</Text>
                    <Text className="text-lg font-bold text-white">65</Text>
                  </View>
                </View>
              </View>
            </View>
          </Card>

          {/* Remove the separate PickupAndFocusCards component */}
        </ScrollView>

        {/* Focus Action Bar */}
        <View className="absolute inset-x-6 bottom-28 z-[200]">
          <BlurView tint="dark" intensity={40} style={{ borderRadius: 20 }}>
            <Pressable
              onPress={onFocus}
              className="flex-row items-center justify-center rounded-2xl border border-white/10 p-4 active:opacity-90"
              style={{
                backgroundColor: 'rgba(13,20,36,0.6)',
              }}
              android_ripple={{ color: '#FFFFFF20' }}
            >
              <Ionicons
                name="flash-outline"
                size={20}
                color={colors.primary.light}
              />
              <Text className="ml-2 text-lg font-medium text-white">
                Start Focus
              </Text>
            </Pressable>
          </BlurView>
        </View>

        {/* Focus Duration Bottom Sheet */}
        <FocusDurationBottomSheet
          visible={showDurationSheet}
          onClose={() => setShowDurationSheet(false)}
          onStart={onStartFocus}
        />

        {/* Focus Mode Overlay */}
        <FocusModeOverlay
          visible={focusActive}
          timeLeft={timeLeft}
          totalTime={totalFocusTime}
          onPause={onPauseFocus}
          selectedApps={selectedApps}
        />
      </View>
    </>
  );
}

// ---------- utils ----------
function formatMins(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

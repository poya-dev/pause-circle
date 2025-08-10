// app/(tabs)/home.tsx
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import * as React from 'react';
import {
  Linking,
  Modal,
  Platform,
  Pressable as RNPressable,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Defs,
  LinearGradient as SvgLinear,
  Path,
  Stop,
} from 'react-native-svg';

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

const RowCard = ({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress?: () => void;
}) => {
  const content = (
    <BlurView tint="dark" intensity={20} style={{ borderRadius: 16 }}>
      <View
        className="flex-row items-center justify-between px-4 py-3"
        style={[{ borderRadius: 16 }, glass.card]}
      >
        {children}
      </View>
    </BlurView>
  );
  return onPress ? (
    <RNPressable onPress={onPress} style={{ borderRadius: 16 }}>
      {content}
    </RNPressable>
  ) : (
    content
  );
};

// ---------- Tiny Sparkline (no external chart lib) ----------
function Sparkline({
  data,
  width = 160,
  height = 48,
  stroke = 2,
}: {
  data: number[];
  width?: number;
  height?: number;
  stroke?: number;
}) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(1, max - min);
  const pad = 2;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * w;
    const y = pad + h - ((v - min) / range) * h;
    return { x, y };
  });

  const path = points.reduce(
    (acc, p, i) => acc + (i === 0 ? `M${p.x},${p.y}` : ` L${p.x},${p.y}`),
    ''
  );
  const areaPath = path + ` L${pad + w},${pad + h} L${pad},${pad + h} Z`;
  const gradId = 'sparkGrad';

  return (
    <Svg width={width} height={height}>
      <Defs>
        <SvgLinear id={gradId} x1="0" y1="0" x2="0" y2="1">
          <Stop
            offset="0"
            stopColor={colors.primary.light}
            stopOpacity="0.35"
          />
          <Stop offset="1" stopColor={colors.primary.light} stopOpacity="0" />
        </SvgLinear>
      </Defs>
      <Path d={areaPath} fill={`url(#${gradId})`} />
      <Path
        d={path}
        fill="none"
        stroke={colors.primary.light}
        strokeWidth={stroke}
      />
    </Svg>
  );
}

// ---------- Small UI bits ----------
function MiniStat({
  title,
  value,
  icon,
  sub,
  onPress,
}: {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  sub?: string;
  onPress?: () => void;
}) {
  const content = (
    <BlurView tint="dark" intensity={18} style={{ borderRadius: 16, flex: 1 }}>
      <View style={[glass.card, { padding: 12, borderRadius: 16 }]}>
        <View className="mb-1 flex-row items-center justify-between">
          <Text className="text-xs" style={{ color: colors.text.secondary }}>
            {title}
          </Text>
          <Ionicons name={icon} size={16} color={colors.text.muted} />
        </View>
        <Text
          className="text-xl font-bold"
          style={{ color: colors.text.primary }}
        >
          {value}
        </Text>
        {sub ? (
          <Text
            className="mt-0.5 text-xs"
            style={{ color: colors.text.secondary }}
          >
            {sub}
          </Text>
        ) : null}
      </View>
    </BlurView>
  );
  if (onPress)
    return (
      <Pressable className="flex-1" onPress={onPress}>
        {content}
      </Pressable>
    );
  return content;
}

function QuickAction({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress?: () => void;
}) {
  return (
    <RowCard onPress={onPress}>
      <View className="flex-row items-center gap-3">
        <BlurView
          tint="light"
          intensity={blur.subtle}
          className="size-10 items-center justify-center overflow-hidden rounded-lg"
          style={{
            backgroundColor: `${colors.primary.light}20`,
            borderWidth: 1,
            borderColor: `${colors.primary.light}40`,
          }}
        >
          <Ionicons name={icon} size={20} color={colors.primary.light} />
        </BlurView>
        <View>
          <Text className="font-medium" style={{ color: colors.text.primary }}>
            {title}
          </Text>
          <Text className="text-xs" style={{ color: colors.text.secondary }}>
            {subtitle}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
    </RowCard>
  );
}

function AppRow({
  app,
  onSetLimit,
}: {
  app: {
    key: string;
    name: string;
    icon: keyof typeof Ionicons.glyphMap;
    minutes: number;
    color: string;
    limit?: number | null;
  };
  onSetLimit: (key: string, mins: number) => void;
}) {
  const ratio = app.limit ? Math.min(1, app.minutes / app.limit) : 0;
  return (
    <View className="rounded-xl p-3" style={[glass.card, { borderRadius: 16 }]}>
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View
            className="mr-3 size-10 items-center justify-center rounded-full"
            style={{ backgroundColor: `${app.color}26` }}
          >
            <Ionicons name={app.icon as any} size={18} color={app.color} />
          </View>
          <View>
            <Text
              className="font-semibold"
              style={{ color: colors.text.primary }}
            >
              {app.name}
            </Text>
            <Text className="text-xs" style={{ color: colors.text.secondary }}>
              {formatMins(app.minutes)}
              {app.limit ? ` • Limit: ${formatMins(app.limit)}` : ''}
            </Text>
          </View>
        </View>
        <Pressable
          className="rounded-lg px-3 py-1"
          onPress={() => onSetLimit(app.key, app.limit ?? 60)}
          style={{ backgroundColor: 'rgba(255,255,255,0.10)' }}
        >
          <Text
            className="text-sm font-medium"
            style={{ color: colors.primary.light }}
          >
            {app.limit ? 'Change' : 'Set limit'}
          </Text>
        </Pressable>
      </View>

      {app.limit ? (
        <>
          <View
            className="h-2 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.10)' }}
          >
            <View
              style={{
                width: `${Math.max(6, ratio * 100)}%`,
                height: '100%',
                backgroundColor: app.color,
              }}
            />
          </View>
          <Text
            className="mt-1 text-xs"
            style={{ color: colors.text.secondary }}
          >
            {ratio >= 1
              ? 'Limit reached'
              : `${formatMins(app.limit - app.minutes)} left today`}
          </Text>
        </>
      ) : null}
    </View>
  );
}

// ---------- Limit sheet ----------
function LimitSheet({
  visible,
  appName,
  currentLimit,
  onClose,
  onSave,
}: {
  visible: boolean;
  appName: string;
  currentLimit?: number | null;
  onClose: () => void;
  onSave: (mins: number) => void;
}) {
  const [tmp, setTmp] = React.useState<number | null>(currentLimit ?? null);
  React.useEffect(() => setTmp(currentLimit ?? null), [visible, currentLimit]);

  const options = [15, 30, 60, 120];

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <BlurView
          tint="dark"
          intensity={28}
          style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        >
          <View
            style={[
              glass.card,
              {
                padding: 20,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              },
            ]}
          >
            <View
              className="mb-3 h-1.5 w-12 self-center rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
            />
            <Text
              className="mb-1 text-center text-base font-semibold"
              style={{ color: colors.text.primary }}
            >
              {currentLimit ? 'Change daily limit' : 'Set daily limit'}
            </Text>
            <Text
              className="mb-3 text-center text-xs"
              style={{ color: colors.text.secondary }}
            >
              {appName}
            </Text>

            <View className="mb-2 flex-row flex-wrap justify-center gap-8">
              {options.map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setTmp(m)}
                  className="rounded-xl px-3 py-2"
                  style={{
                    backgroundColor:
                      tmp === m
                        ? `${colors.primary.light}22`
                        : 'rgba(255,255,255,0.10)',
                    borderWidth: 1,
                    borderColor:
                      tmp === m ? colors.primary.light : colors.cardBorder,
                  }}
                >
                  <Text
                    style={{
                      color:
                        tmp === m ? colors.primary.light : colors.text.primary,
                    }}
                  >
                    {m}m
                  </Text>
                </Pressable>
              ))}
            </View>

            <View className="mt-4 flex-row gap-10">
              <Pressable
                className="flex-1 rounded-xl border px-4 py-3"
                style={{ borderColor: colors.cardBorder }}
                onPress={onClose}
              >
                <Text
                  className="text-center"
                  style={{ color: colors.text.primary }}
                >
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                className="flex-1 rounded-xl px-4 py-3"
                style={{
                  backgroundColor: tmp
                    ? colors.primary.light
                    : colors.cardBorder,
                }}
                disabled={!tmp}
                onPress={() => {
                  if (tmp) onSave(tmp);
                  onClose();
                }}
              >
                <Text className="text-center font-semibold text-white">
                  {currentLimit ? 'Update' : 'Set limit'}
                </Text>
              </Pressable>
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

// ---------- Permissions preflight (UI only) ----------
function PermissionsSheet({
  visible,
  onClose,
  onContinue,
}: {
  visible: boolean;
  onClose: () => void;
  onContinue: () => void;
}) {
  const isIOS = Platform.OS === 'ios';
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <BlurView
          tint="dark"
          intensity={28}
          style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        >
          <View
            style={[
              glass.card,
              {
                padding: 20,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              },
            ]}
          >
            <View
              className="mb-3 h-1.5 w-12 self-center rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
            />
            <Text
              className="mb-1 text-center text-base font-semibold"
              style={{ color: colors.text.primary }}
            >
              One-time setup
            </Text>
            <Text
              className="mb-4 text-center text-xs"
              style={{ color: colors.text.secondary }}
            >
              Enable system permissions so “Block now” can prevent app usage.
            </Text>

            {isIOS ? (
              <View style={{ gap: 10 }}>
                <RowCard>
                  <View className="flex-row items-center gap-3">
                    <Ionicons
                      name="shield-outline"
                      size={18}
                      color={colors.text.secondary}
                    />
                    <View>
                      <Text style={{ color: colors.text.primary }}>
                        Screen Time (Family Controls)
                      </Text>
                      <Text
                        className="text-xs"
                        style={{ color: colors.text.secondary }}
                      >
                        Allow Pause to manage app categories you choose.
                      </Text>
                    </View>
                  </View>
                </RowCard>
                <RowCard>
                  <View className="flex-row items-center gap-3">
                    <Ionicons
                      name="checkbox-outline"
                      size={18}
                      color={colors.text.secondary}
                    />
                    <View>
                      <Text style={{ color: colors.text.primary }}>
                        Allow during setup
                      </Text>
                      <Text
                        className="text-xs"
                        style={{ color: colors.text.secondary }}
                      >
                        You may see an Apple permission sheet.
                      </Text>
                    </View>
                  </View>
                </RowCard>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                <RowCard>
                  <View className="flex-row items-center gap-3">
                    <Ionicons
                      name="stats-chart-outline"
                      size={18}
                      color={colors.text.secondary}
                    />
                    <View>
                      <Text style={{ color: colors.text.primary }}>
                        Usage Access
                      </Text>
                      <Text
                        className="text-xs"
                        style={{ color: colors.text.secondary }}
                      >
                        Lets Pause detect the current foreground app.
                      </Text>
                    </View>
                  </View>
                </RowCard>
                <RowCard>
                  <View className="flex-row items-center gap-3">
                    <Ionicons
                      name="albums-outline"
                      size={18}
                      color={colors.text.secondary}
                    />
                    <View>
                      <Text style={{ color: colors.text.primary }}>
                        Draw over other apps
                      </Text>
                      <Text
                        className="text-xs"
                        style={{ color: colors.text.secondary }}
                      >
                        Shows a gentle “reflection” screen over blocked apps.
                      </Text>
                    </View>
                  </View>
                </RowCard>
              </View>
            )}

            <View className="mt-5 flex-row gap-10">
              <Pressable
                className="flex-1 rounded-xl border px-4 py-3"
                style={{ borderColor: colors.cardBorder }}
                onPress={onClose}
              >
                <Text
                  className="text-center"
                  style={{ color: colors.text.primary }}
                >
                  Not now
                </Text>
              </Pressable>
              <Pressable
                className="flex-1 rounded-xl px-4 py-3"
                style={{ backgroundColor: colors.primary.light }}
                onPress={onContinue}
              >
                <Text className="text-center font-semibold text-white">
                  I’ve enabled it
                </Text>
              </Pressable>
            </View>

            <Pressable
              className="mt-3 items-center py-1"
              onPress={() => {
                // optional helper: opens app settings (UI-only for now)
                Linking.openSettings?.();
              }}
            >
              <Text
                className="text-xs"
                style={{ color: colors.text.secondary }}
              >
                Open system settings
              </Text>
            </Pressable>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

// ---------- Main screen ----------
export default function HomeScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();

  // Mock data (wire to TanStack Query later)
  const userName = 'Friend';

  // Screen time today & yesterday (mins)
  const [screenTimeToday] = React.useState(3 * 60 + 12);
  const [screenTimeYesterday] = React.useState(3 * 60 + 25);
  const screenDelta = screenTimeToday - screenTimeYesterday;
  const sparkData = React.useMemo(
    () => [12, 18, 10, 20, 24, 22, 30, 28, 26, 18, 16, 12],
    []
  );

  // Top apps
  const [apps, setApps] = React.useState<
    {
      key: string;
      name: string;
      icon: keyof typeof Ionicons.glyphMap;
      minutes: number;
      color: string;
      limit?: number | null;
    }[]
  >([
    {
      key: 'tiktok',
      name: 'TikTok',
      icon: 'logo-tiktok',
      minutes: 85,
      color: '#FF2D55',
      limit: 120,
    },
    {
      key: 'instagram',
      name: 'Instagram',
      icon: 'logo-instagram',
      minutes: 62,
      color: '#E4405F',
      limit: null as number | null,
    },
    {
      key: 'youtube',
      name: 'YouTube',
      icon: 'logo-youtube',
      minutes: 54,
      color: '#FF0000',
      limit: 90,
    },
  ]);

  // Stats
  const [pickups] = React.useState(68);
  const [notifications] = React.useState(187);
  const [savedMinutesWeek] = React.useState(142); // mock

  // Block Now state (UI)
  const [blockOpen, setBlockOpen] = React.useState(false);
  const [blockActive, setBlockActive] = React.useState(false);
  const [blockEndAt, setBlockEndAt] = React.useState<number | null>(null);
  const [blockRemaining, setBlockRemaining] = React.useState(0); // seconds
  const [blockScope, setBlockScope] = React.useState<
    'social' | 'entertainment' | 'selected' | 'device'
  >('social');

  // Permissions preflight (UI only)
  const [permissionsOk, setPermissionsOk] = React.useState(false);
  const [permOpen, setPermOpen] = React.useState(false);
  const [pendingBlock, setPendingBlock] = React.useState<{
    duration: number;
    scope: 'social' | 'entertainment' | 'selected' | 'device';
    selectedKeys?: string[];
  } | null>(null);

  React.useEffect(() => {
    if (!blockActive || !blockEndAt) return;
    const tick = () => {
      const left = Math.max(0, Math.round((blockEndAt - Date.now()) / 1000));
      setBlockRemaining(left);
      if (left <= 0) {
        setBlockActive(false);
        setBlockEndAt(null);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [blockActive, blockEndAt]);

  const actuallyStartBlock = React.useCallback(
    (cfg: {
      duration: number;
      scope: 'social' | 'entertainment' | 'selected' | 'device';
      selectedKeys?: string[];
    }) => {
      setBlockScope(cfg.scope);
      setBlockEndAt(Date.now() + cfg.duration * 60 * 1000);
      setBlockActive(true);
      setBlockOpen(false);
    },
    []
  );

  const onRequestStartBlock = (cfg: {
    duration: number;
    scope: 'social' | 'entertainment' | 'selected' | 'device';
    selectedKeys?: string[];
  }) => {
    if (!permissionsOk) {
      setPendingBlock(cfg);
      setBlockOpen(false);
      setPermOpen(true);
      return;
    }
    actuallyStartBlock(cfg);
  };

  const endBlock = () => {
    setBlockActive(false);
    setBlockEndAt(null);
  };
  const extendBlock = (mins: number) => {
    setBlockEndAt((prev) => (prev ? prev + mins * 60 * 1000 : prev));
  };

  const openLimit = (key: string, _suggested: number) => {
    const app = apps.find((a) => a.key === key)!;
    setLimitTarget({ key, name: app.name, current: app.limit ?? null });
    setLimitOpen(true);
  };
  const saveLimit = (mins: number) => {
    if (!limitTarget) return;
    setApps((prev) =>
      prev.map((a) => (a.key === limitTarget.key ? { ...a, limit: mins } : a))
    );
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

  const [limitOpen, setLimitOpen] = React.useState(false);
  const [limitTarget, setLimitTarget] = React.useState<{
    key: string;
    name: string;
    current: number | null;
  } | null>(null);
  const [limitsOpen, setLimitsOpen] = React.useState(false);
  const [inChallenge] = React.useState(false);

  const scopeLabel = React.useMemo(() => {
    switch (blockScope) {
      case 'social':
        return 'All Social';
      case 'entertainment':
        return 'All Entertainment';
      case 'selected':
        return 'Selected apps';
      case 'device':
        return 'Entire device';
      default:
        return '';
    }
  }, [blockScope]);

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
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6" style={{ paddingTop: insets.top + 16 }}>
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

            {/* Hero: Screen time today */}
            <Card
              className="rounded-3xl p-5"
              onPress={() => router.push('/recap?filter=today')}
            >
              <View className="mb-2 flex-row items-center justify-between">
                <Text
                  className="text-base font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  Screen time today
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.text.muted}
                />
              </View>

              <View className="flex-row items-end justify-between">
                <View>
                  <Text
                    className="text-3xl font-bold"
                    style={{ color: colors.text.primary }}
                  >
                    {formatMins(screenTimeToday)}
                  </Text>
                  <Text
                    className="mt-1 text-xs"
                    style={{ color: colors.text.secondary }}
                  >
                    {deltaLabel}
                  </Text>
                </View>
                <Sparkline data={sparkData} />
              </View>
            </Card>

            {/* Top Apps (3) */}
            <View className="mt-8">
              <View className="mb-3 flex-row items-center justify-between">
                <Text
                  className="text-lg font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  Top apps
                </Text>
                <Pressable
                  onPress={() => router.push('/recap?view=apps')}
                  className="rounded-lg px-3 py-1"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{ color: colors.primary.light }}
                  >
                    See all
                  </Text>
                </Pressable>
              </View>
              <View className="space-y-3">
                {apps.slice(0, 3).map((app) => (
                  <AppRow
                    key={app.key}
                    app={app}
                    onSetLimit={(k) => openLimit(k, 60)}
                  />
                ))}
              </View>
            </View>

            {/* Stats row */}
            <View className="mt-8 flex-row gap-4">
              <MiniStat
                title="Pickups"
                value={`${pickups}`}
                icon="hand-left-outline"
                onPress={() => router.push('/recap?filter=today')}
              />
              <MiniStat
                title="Notifications"
                value={`${notifications}`}
                icon="notifications-outline"
                onPress={() => router.push('/recap?filter=today')}
              />
            </View>
            <View className="mt-4 flex-row gap-4">
              <MiniStat
                title="Time saved"
                value={formatMins(savedMinutesWeek)}
                icon="shield-checkmark-outline"
                sub="this week"
                onPress={() => router.push('/recap?view=saved')}
              />
            </View>

            {/* Quick actions */}
            <View className="mt-8">
              <Text
                className="mb-3 text-lg font-semibold"
                style={{ color: colors.text.primary }}
              >
                Quick actions
              </Text>
              <View className="space-y-3">
                <QuickAction
                  icon="flash-outline"
                  title="Block now"
                  subtitle="Temporarily block distractions"
                  onPress={() => setBlockOpen(true)}
                />
                <QuickAction
                  icon="time-outline"
                  title="App limits"
                  subtitle="Set daily limits for apps"
                  onPress={() => setLimitsOpen(true)}
                />
                <QuickAction
                  icon="moon-outline"
                  title="Quiet hours"
                  subtitle="Mute notifications on a schedule"
                  onPress={() => router.push('/settings?section=quiet')}
                />
              </View>
            </View>

            {/* Suggested challenge */}
            {!inChallenge && (
              <Card className="mt-8 rounded-3xl p-5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text
                      className="font-semibold"
                      style={{ color: colors.text.primary }}
                    >
                      Join a challenge
                    </Text>
                    <Text
                      className="text-xs"
                      style={{ color: colors.text.secondary }}
                    >
                      Cut TikTok to 30m/day with 1,200 others
                    </Text>
                  </View>
                  <Pressable
                    className="rounded-xl px-3 py-2"
                    onPress={() => router.push('/groups')}
                    style={{
                      backgroundColor: colors.card,
                      borderWidth: 1,
                      borderColor: colors.cardBorder,
                    }}
                  >
                    <Text style={{ color: colors.text.primary }}>Explore</Text>
                  </Pressable>
                </View>
              </Card>
            )}
          </View>
        </ScrollView>

        {/* Active Block pill */}
        {blockActive && (
          <BlurView
            tint="dark"
            intensity={24}
            style={{
              position: 'absolute',
              left: 16,
              right: 16,
              bottom: insets.bottom + 76,
              borderRadius: 16,
            }}
          >
            <View
              style={[glass.card, { borderRadius: 16 }]}
              className="flex-row items-center justify-between px-4 py-3"
            >
              <View className="flex-row items-center" style={{ gap: 10 }}>
                <Ionicons
                  name="timer-outline"
                  size={18}
                  color={colors.text.secondary}
                />
                <Text style={{ color: colors.text.primary }}>
                  Blocking • {scopeLabel} — {formatSecs(blockRemaining)} left
                </Text>
              </View>
              <View className="flex-row items-center" style={{ gap: 14 }}>
                <RNPressable onPress={() => extendBlock(15)}>
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
                    color={colors.text.primary}
                  />
                </RNPressable>
                <RNPressable onPress={endBlock}>
                  <Ionicons name="stop" size={20} color={colors.text.primary} />
                </RNPressable>
              </View>
            </View>
          </BlurView>
        )}
      </View>

      {/* Sheets */}
      <LimitSheet
        visible={limitOpen}
        appName={limitTarget?.name ?? ''}
        currentLimit={limitTarget?.current ?? null}
        onClose={() => setLimitOpen(false)}
        onSave={saveLimit}
      />
      <BlockSheet
        visible={blockOpen}
        apps={apps.map(({ key, name, icon, color }) => ({
          key,
          name,
          icon,
          color,
        }))}
        onClose={() => setBlockOpen(false)}
        onStart={(cfg) => onRequestStartBlock(cfg)}
      />
      <LimitsSummarySheet
        visible={limitsOpen}
        apps={apps}
        onClose={() => setLimitsOpen(false)}
        onToggle={(key, enabled) => {
          setApps((prev) =>
            prev.map((a) =>
              a.key === key
                ? { ...a, limit: enabled ? (a.limit ?? 60) : null }
                : a
            )
          );
        }}
        onEdit={(key) => {
          const app = apps.find((a) => a.key === key);
          if (!app) return;
          setLimitTarget({
            key: app.key,
            name: app.name,
            current: app.limit ?? null,
          });
          setLimitOpen(true);
        }}
      />
      <PermissionsSheet
        visible={permOpen}
        onClose={() => {
          setPendingBlock(null);
          setPermOpen(false);
        }}
        onContinue={() => {
          setPermissionsOk(true);
          setPermOpen(false);
          if (pendingBlock) {
            actuallyStartBlock(pendingBlock);
            setPendingBlock(null);
          }
        }}
      />
    </>
  );
}

// ---------- Block Now sheet ----------
function BlockSheet({
  visible,
  apps,
  onClose,
  onStart,
}: {
  visible: boolean;
  apps: {
    key: string;
    name: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
  }[];
  onClose: () => void;
  onStart: (cfg: {
    duration: number;
    scope: 'social' | 'entertainment' | 'selected' | 'device';
    selectedKeys?: string[];
  }) => void;
}) {
  const [scope, setScope] = React.useState<
    'social' | 'entertainment' | 'selected' | 'device'
  >('social');
  const [duration, setDuration] = React.useState(30);
  const [selected, setSelected] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!visible) return;
    setScope('social');
    setDuration(30);
    setSelected([]);
  }, [visible]);

  const toggleApp = (k: string) => {
    setSelected((arr) =>
      arr.includes(k) ? arr.filter((x) => x !== k) : [...arr, k]
    );
  };

  const DurChip = ({ m }: { m: number }) => (
    <Pressable
      onPress={() => setDuration(m)}
      className="rounded-xl px-3 py-2"
      style={{
        backgroundColor:
          duration === m
            ? `${colors.primary.light}22`
            : 'rgba(255,255,255,0.10)',
        borderWidth: 1,
        borderColor: duration === m ? colors.primary.light : colors.cardBorder,
      }}
    >
      <Text
        style={{
          color: duration === m ? colors.primary.light : colors.text.primary,
        }}
      >
        {m}m
      </Text>
    </Pressable>
  );

  const ScopeChip = ({
    v,
    label,
  }: {
    v: 'social' | 'entertainment' | 'selected' | 'device';
    label: string;
  }) => (
    <Pressable
      onPress={() => setScope(v)}
      className="rounded-xl px-3 py-2"
      style={{
        backgroundColor:
          scope === v ? `${colors.primary.light}22` : 'rgba(255,255,255,0.10)',
        borderWidth: 1,
        borderColor: scope === v ? colors.primary.light : colors.cardBorder,
      }}
    >
      <Text
        style={{
          color: scope === v ? colors.primary.light : colors.text.primary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <BlurView
          tint="dark"
          intensity={28}
          style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        >
          <View
            style={[
              glass.card,
              {
                padding: 20,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              },
            ]}
          >
            <View
              className="mb-3 h-1.5 w-12 self-center rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
            />
            <Text
              className="mb-1 text-center text-base font-semibold"
              style={{ color: colors.text.primary }}
            >
              Block now
            </Text>
            <Text
              className="mb-3 text-center text-xs"
              style={{ color: colors.text.secondary }}
            >
              Choose what to block and for how long
            </Text>

            <Text
              className="mb-2 text-xs"
              style={{ color: colors.text.secondary }}
            >
              Scope
            </Text>
            <View className="mb-3 flex-row flex-wrap gap-8">
              <ScopeChip v="social" label="All Social" />
              <ScopeChip v="entertainment" label="All Entertainment" />
              <ScopeChip v="selected" label="Selected apps" />
              <ScopeChip v="device" label="Entire device" />
            </View>

            <Text
              className="mb-2 text-xs"
              style={{ color: colors.text.secondary }}
            >
              Duration
            </Text>
            <View className="mb-3 flex-row flex-wrap gap-8">
              {[15, 30, 60, 120].map((m) => (
                <DurChip key={m} m={m} />
              ))}
            </View>

            {scope === 'selected' ? (
              <>
                <Text
                  className="mb-2 text-xs"
                  style={{ color: colors.text.secondary }}
                >
                  Pick apps
                </Text>
                <View className="mb-2 flex-row flex-wrap gap-6">
                  {apps.map((a) => (
                    <Pressable
                      key={a.key}
                      onPress={() => toggleApp(a.key)}
                      className="rounded-full px-3 py-2"
                      style={{
                        backgroundColor: selected.includes(a.key)
                          ? `${colors.primary.light}22`
                          : 'rgba(255,255,255,0.10)',
                        borderWidth: 1,
                        borderColor: selected.includes(a.key)
                          ? colors.primary.light
                          : colors.cardBorder,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <Ionicons
                        name={a.icon as any}
                        size={14}
                        color={
                          selected.includes(a.key)
                            ? colors.primary.light
                            : colors.text.secondary
                        }
                      />
                      <Text
                        style={{
                          color: selected.includes(a.key)
                            ? colors.primary.light
                            : colors.text.primary,
                        }}
                      >
                        {a.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}

            <View className="mt-4 flex-row gap-10">
              <Pressable
                className="flex-1 rounded-xl border px-4 py-3"
                style={{ borderColor: colors.cardBorder }}
                onPress={onClose}
              >
                <Text
                  className="text-center"
                  style={{ color: colors.text.primary }}
                >
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                className="flex-1 rounded-xl px-4 py-3"
                style={{ backgroundColor: colors.primary.light }}
                onPress={() =>
                  onStart({ duration, scope, selectedKeys: selected })
                }
              >
                <Text className="text-center font-semibold text-white">
                  Start
                </Text>
              </Pressable>
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

// ---------- utils ----------
function formatMins(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
function formatSecs(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ---------- Limits Summary sheet (tiny manager) ----------
function LimitsSummarySheet({
  visible,
  apps,
  onClose,
  onToggle,
  onEdit,
}: {
  visible: boolean;
  apps: {
    key: string;
    name: string;
    icon: keyof typeof Ionicons.glyphMap;
    minutes: number;
    color: string;
    limit?: number | null;
  }[];
  onClose: () => void;
  onToggle: (key: string, enabled: boolean) => void;
  onEdit: (key: string) => void;
}) {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <BlurView
          tint="dark"
          intensity={28}
          style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        >
          <View
            style={[
              glass.card,
              {
                padding: 20,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              },
            ]}
          >
            <View
              className="mb-3 h-1.5 w-12 self-center rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
            />
            <Text
              className="mb-1 text-center text-base font-semibold"
              style={{ color: colors.text.primary }}
            >
              App limits
            </Text>
            <Text
              className="mb-3 text-center text-xs"
              style={{ color: colors.text.secondary }}
            >
              Turn limits on/off and edit caps
            </Text>

            <View className="mb-3" style={{ gap: 10 }}>
              {apps.map((a) => {
                const enabled = a.limit != null;
                return (
                  <View
                    key={a.key}
                    className="rounded-xl p-3"
                    style={[glass.card, { borderRadius: 16 }]}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <View
                          className="mr-3 size-10 items-center justify-center rounded-full"
                          style={{ backgroundColor: `${a.color}26` }}
                        >
                          <Ionicons
                            name={a.icon as any}
                            size={18}
                            color={a.color}
                          />
                        </View>
                        <View>
                          <Text
                            className="font-semibold"
                            style={{ color: colors.text.primary }}
                          >
                            {a.name}
                          </Text>
                          <Text
                            className="text-xs"
                            style={{ color: colors.text.secondary }}
                          >
                            {enabled
                              ? `Limit: ${formatMins(a.limit as number)}`
                              : 'No limit'}
                          </Text>
                        </View>
                      </View>
                      <Switch
                        value={enabled}
                        onValueChange={(v) => onToggle(a.key, v)}
                        thumbColor="#fff"
                        trackColor={{
                          true: `${colors.primary.light}66`,
                          false: 'rgba(255,255,255,0.2)',
                        }}
                      />
                    </View>

                    <View className="mt-3 flex-row items-center justify-between">
                      <View
                        className="h-2 flex-1 overflow-hidden rounded-full"
                        style={{ backgroundColor: 'rgba(255,255,255,0.10)' }}
                      >
                        {enabled ? (
                          <View
                            style={{
                              width: `${Math.min(100, Math.max(6, (a.minutes / (a.limit as number)) * 100))}%`,
                              height: '100%',
                              backgroundColor: a.color,
                            }}
                          />
                        ) : null}
                      </View>
                      <Pressable
                        className="ml-3 rounded-lg px-3 py-1"
                        style={{ backgroundColor: 'rgba(255,255,255,0.10)' }}
                        onPress={() => onEdit(a.key)}
                      >
                        <Text
                          className="text-sm font-medium"
                          style={{ color: colors.primary.light }}
                        >
                          Change
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>

            <Pressable
              className="mt-2 rounded-xl px-4 py-3"
              style={{ backgroundColor: colors.primary.light }}
              onPress={onClose}
            >
              <Text className="text-center font-semibold text-white">Done</Text>
            </Pressable>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

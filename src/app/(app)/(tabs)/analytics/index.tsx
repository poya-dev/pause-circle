// AnalyticsScreen.tsx
// pnpm add react-native-calendars date-fns react-native-svg
import { Ionicons } from '@expo/vector-icons';
import {
  differenceInCalendarDays,
  format,
  isBefore,
  isEqual,
  parseISO,
} from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import * as React from 'react';
import {
  Modal,
  RefreshControl,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import type { DateData } from 'react-native-calendars';
import { Calendar } from 'react-native-calendars';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable, Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';

/* =========================
   Types & helpers
   ========================= */
type DateFilter = 'today' | 'week' | 'month';
type DateRange = { startDate: string; endDate: string } | null;
type MarkedDates = Record<string, any>;

type Category = 'social' | 'entertainment' | 'productivity' | 'games' | 'other';
type CategoryOrAll = 'all' | Category;

type AppUsageData = {
  key: string;
  name: string;
  timeSpent: number; // minutes
  sessions: number;
  icon: string;
  color: string;
  category: Category;
  limit?: number | null;
};

type PerDayCats = {
  day: string; // Mon..Sun
  vals: Record<Category, number>; // minutes by cat
  total: number;
};

type GeneratedData = {
  apps: AppUsageData[];
  perDayCats: PerDayCats[];
  totals: {
    screenTime: number;
    focusTime: number;
    pickups: number;
    notifications: number;
  };
};

const CATEGORY_LABEL: Record<Category, string> = {
  productivity: 'Productivity',
  social: 'Social',
  entertainment: 'Entertainment',
  games: 'Games',
  other: 'Other',
};
const CATEGORY_COLOR: Record<Category, string> = {
  social: '#6E8BFF',
  entertainment: '#FF7A7A',
  productivity: '#2ED48A',
  games: '#C792FF',
  other: '#A3B1C6',
};
const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SECTION_GAP = 24;
const CONTENT_PAD = 24; // outer page padding
const CARD_PAD = 16; // card inner padding

const formatHM = (min: number) => {
  const h = Math.floor(min / 60);
  const m = Math.floor(min % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};
const getCatTint = (c: CategoryOrAll) =>
  c === 'all' ? colors.primary.light : CATEGORY_COLOR[c];

/* =========================
   Mock data (range-aware)
   ========================= */
function generateData(filter: DateFilter, range?: DateRange): GeneratedData {
  const days = range
    ? Math.max(
        1,
        differenceInCalendarDays(
          parseISO(range.endDate),
          parseISO(range.startDate)
        ) + 1
      )
    : filter === 'today'
      ? 1
      : filter === 'week'
        ? 7
        : 30;

  const base = {
    social: 55,
    entertainment: 50,
    productivity: 70,
    games: 20,
    other: 15,
  };

  const totals = {
    screenTime: Object.values(base).reduce((a, b) => a + b, 0) * days,
    focusTime: 90 * days,
    pickups: 65 * days,
    notifications: 180 * days,
  };

  const apps: AppUsageData[] = [
    {
      key: 'tiktok',
      name: 'TikTok',
      timeSpent: 24 * days,
      sessions: 6 * days,
      icon: 'logo-tiktok',
      color: '#FF2D55',
      category: 'entertainment',
      limit: 90,
    },
    {
      key: 'instagram',
      name: 'Instagram',
      timeSpent: 28 * days,
      sessions: 5 * days,
      icon: 'logo-instagram',
      color: '#E4405F',
      category: 'social',
      limit: null,
    },
    {
      key: 'youtube',
      name: 'YouTube',
      timeSpent: 22 * days,
      sessions: 3 * days,
      icon: 'logo-youtube',
      color: '#FF0000',
      category: 'entertainment',
      limit: 120,
    },
    {
      key: 'slack',
      name: 'Slack',
      timeSpent: 30 * days,
      sessions: 8 * days,
      icon: 'logo-slack',
      color: '#2ED48A',
      category: 'productivity',
      limit: null,
    },
    {
      key: 'chess',
      name: 'Chess',
      timeSpent: 10 * days,
      sessions: 1 * days,
      icon: 'game-controller',
      color: '#C792FF',
      category: 'games',
      limit: null,
    },
  ];

  const perDayCats: PerDayCats[] = Array.from(
    { length: Math.min(days, 7) },
    (_, i) => {
      const vals = {
        social: 45 + (i % 3) * 15,
        entertainment: 35 + ((i + 1) % 3) * 12,
        productivity: 75 + ((i + 2) % 3) * 20,
        games: 15 + ((i + 3) % 2) * 8,
        other: 12 + (i % 2) * 5,
      };
      const total = Object.values(vals).reduce((a, b) => a + b, 0);
      return { day: WEEK[i % 7], vals, total };
    }
  );

  return { apps, perDayCats, totals };
}

/* =========================
   UI atoms
   ========================= */
function Card({
  children,
  style,
  onPress,
  radius = 20,
  padding = CARD_PAD,
  variant = 'glass', // 'glass' | 'flat'
}: {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
  radius?: number;
  padding?: number;
  variant?: 'glass' | 'flat';
}) {
  const base = (
    <View style={{ borderRadius: radius, overflow: 'hidden' }}>
      {variant === 'glass' && (
        <LinearGradient
          colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', inset: 0 }}
        />
      )}
      <View
        style={[
          {
            borderRadius: radius,
            backgroundColor:
              variant === 'glass'
                ? 'rgba(13,20,36,0.35)'
                : 'rgba(18,24,38,0.95)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.06)',
            padding,
          },
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
  if (onPress) return <Pressable onPress={onPress}>{base}</Pressable>;
  return base;
}

function Segmented({
  value,
  onChange,
}: {
  value: DateFilter;
  onChange: (v: DateFilter) => void;
}) {
  const items: DateFilter[] = ['today', 'week', 'month'];
  return (
    <View
      className="flex-row rounded-xl p-1"
      style={{
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderColor: colors.cardBorder,
        borderWidth: 1,
      }}
    >
      {items.map((it) => (
        <Pressable
          key={it}
          onPress={() => onChange(it)}
          className="flex-1 items-center rounded-lg py-2"
          style={{
            backgroundColor:
              value === it ? colors.primary.light : 'transparent',
          }}
        >
          <Text
            style={{
              color: value === it ? '#fff' : colors.text.secondary,
              fontWeight: '600',
            }}
          >
            {it === 'today' ? 'Today' : it === 'week' ? 'Week' : 'Month'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function MetricCard({
  label,
  value,
  icon,
  tint,
}: {
  label: string;
  value: string;
  icon: string;
  tint: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        minHeight: 80,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
        padding: 16,
      }}
    >
      <View className="flex-row items-center gap-3">
        <View
          className="size-8 items-center justify-center rounded-full"
          style={{
            backgroundColor: `${tint}26`,
            borderWidth: 1,
            borderColor: `${tint}40`,
          }}
        >
          <Ionicons name={icon as any} size={16} color={tint} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            className="text-[11px] font-medium"
            style={{ color: '#FFFFFF', opacity: 0.7 }}
            numberOfLines={1}
          >
            {label}
          </Text>
          <Text
            className="text-base font-bold"
            style={{ color: '#FFFFFF', opacity: 1 }}
            numberOfLines={1}
          >
            {value}
          </Text>
        </View>
      </View>
    </View>
  );
}

function CategoryChips({
  selected,
  onSelect,
}: {
  selected: CategoryOrAll;
  onSelect: (c: CategoryOrAll) => void;
}) {
  const items: { key: CategoryOrAll; label: string; dot?: string }[] = [
    { key: 'all', label: 'All' },
    {
      key: 'productivity',
      label: 'Productivity',
      dot: CATEGORY_COLOR.productivity,
    },
    { key: 'social', label: 'Social', dot: CATEGORY_COLOR.social },
    {
      key: 'entertainment',
      label: 'Entertainment',
      dot: CATEGORY_COLOR.entertainment,
    },
    { key: 'games', label: 'Games', dot: CATEGORY_COLOR.games },
    { key: 'other', label: 'Other', dot: CATEGORY_COLOR.other },
  ];

  return (
    <View style={{ flexDirection: 'row' }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        style={{ flexGrow: 0 }}
      >
        <View style={{ flexDirection: 'row', gap: 8, paddingRight: 16 }}>
          {items.map((it) => {
            const active = selected === it.key;
            const tint = getCatTint(it.key);
            return (
              <Pressable
                key={it.key}
                onPress={() => onSelect(it.key)}
                className="rounded-xl px-3 py-2"
                style={{
                  backgroundColor: active ? tint : 'rgba(255,255,255,0.06)',
                  borderWidth: 1,
                  borderColor: active ? tint : colors.cardBorder,
                }}
              >
                <View className="flex-row items-center gap-2">
                  {it.key === 'all' ? (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        backgroundColor: colors.primary.light,
                        opacity: active ? 1 : 0.6,
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: it.dot!,
                        opacity: active ? 1 : 0.8,
                      }}
                    />
                  )}
                  <Text
                    className="text-xs font-medium"
                    style={{ color: active ? '#fff' : colors.text.secondary }}
                  >
                    {it.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

/* =========================
   Stacked Week Chart
   ========================= */
function StackedWeekChart({
  perDayCats,
  category, // 'all' or specific category
  width,
  height = 188,
  targetMinutes = 120,
  onBarPress,
  selectedIndex,
}: {
  perDayCats: PerDayCats[];
  category: CategoryOrAll;
  width: number;
  height?: number;
  targetMinutes?: number;
  onBarPress: (index: number) => void;
  selectedIndex: number | null;
}) {
  const leftAxis = 30;
  const rightAxis = 20;
  const topAxis = 20;
  const bottomAxis = 25;
  const spacing = 10;
  const barWidth = (width - leftAxis - rightAxis - spacing * 6) / 7;

  const innerH = height - topAxis - bottomAxis;

  // Find max value for Y scale
  const maxVal = Math.max(
    ...perDayCats.map((d) => (category === 'all' ? d.total : d.vals[category]))
  );
  const roundedMax = Math.ceil(maxVal / 60) * 60 || 120; // Round to nearest hour

  const xFor = (i: number) => leftAxis + spacing + i * (barWidth + spacing);
  const scaleY = (min: number) => (min / roundedMax) * innerH;

  // Generate Y-axis ticks
  const yTicks = [0, 1, 2, 3, 4, 5].map((h) => h * 60);

  return (
    <View style={{ width, height }}>
      {/* Tap outside to dismiss tooltip */}
      {selectedIndex !== null && (
        <Pressable
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'transparent',
          }}
          onPress={() => onBarPress(selectedIndex)}
        />
      )}

      {/* Grid lines */}
      {yTicks.map((h) => (
        <View
          key={h}
          style={{
            position: 'absolute',
            left: leftAxis,
            right: rightAxis,
            top: topAxis + (1 - h / 300) * innerH,
            height: 0.5,
            backgroundColor: 'rgba(255,255,255,0.06)',
            opacity: h === 0 ? 0.2 : 0.1,
          }}
        />
      ))}

      {/* Y-axis labels */}
      {yTicks.map((h) => (
        <Text
          key={h}
          style={{
            position: 'absolute',
            left: 0,
            top: topAxis + (1 - h / 300) * innerH - 8,
            fontSize: 10,
            color: colors.text.secondary,
            width: leftAxis - 8,
            textAlign: 'right',
            opacity: 0.7,
            fontWeight: '500',
          }}
        >
          {h === 0 ? '0m' : `${h / 60}h`}
        </Text>
      ))}

      {/* Target line */}
      <View
        style={{
          position: 'absolute',
          left: leftAxis,
          right: rightAxis,
          top: topAxis + scaleY(targetMinutes),
          height: 1,
          backgroundColor: colors.primary.light,
          opacity: 0.8,
          borderRadius: 0.5,
        }}
      />
      {/* Target line label */}
      <Text
        style={{
          position: 'absolute',
          right: rightAxis + 8,
          top: topAxis + scaleY(targetMinutes) - 10,
          fontSize: 10,
          color: colors.primary.light,
          fontWeight: '600',
          opacity: 0.8,
        }}
      >
        Target: {targetMinutes / 60}h
      </Text>

      {/* Bars */}
      {perDayCats.map((d, i) => {
        const segments =
          category === 'all'
            ? [
                {
                  color: CATEGORY_COLOR.productivity,
                  value: d.vals.productivity,
                },
                { color: CATEGORY_COLOR.social, value: d.vals.social },
                {
                  color: CATEGORY_COLOR.entertainment,
                  value: d.vals.entertainment,
                },
                { color: CATEGORY_COLOR.games, value: d.vals.games },
                { color: CATEGORY_COLOR.other, value: d.vals.other },
              ]
            : [{ color: getCatTint(category), value: d.vals[category] }];

        const total = segments.reduce((s, sgm) => s + sgm.value, 0);
        const barH = scaleY(total);

        return (
          <View
            key={d.day}
            style={{
              position: 'absolute',
              left: xFor(i),
              bottom: bottomAxis,
              width: barWidth,
              height: barH,
            }}
          >
            {/* Stacked segments */}
            {(() => {
              let acc = 0;
              return segments.map((sgm, idx) => {
                const h = (sgm.value / total || 0) * barH;
                const style = {
                  position: 'absolute' as const,
                  left: 0,
                  bottom: acc,
                  width: barWidth,
                  height: h,
                  backgroundColor: sgm.color,
                  borderRadius: 4,
                  shadowColor: sgm.color,
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.4,
                  shadowRadius: 3,
                  elevation: 2,
                };
                acc += h;
                return <View key={idx} style={style} />;
              });
            })()}

            {/* Bar interaction overlay */}
            <Pressable
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'transparent',
              }}
              onPress={() => onBarPress(i)}
            />
          </View>
        );
      })}

      {/* X-axis labels */}
      {perDayCats.map((d, i) => (
        <Text
          key={d.day}
          style={{
            position: 'absolute',
            left: xFor(i),
            top: height - bottomAxis + 6,
            fontSize: 11,
            color: colors.text.secondary,
            width: barWidth,
            textAlign: 'center',
            fontWeight: '600',
            opacity: 0.8,
          }}
        >
          {d.day}
        </Text>
      ))}

      {/* Selected bar highlight */}
      {selectedIndex !== null && (
        <View
          style={{
            position: 'absolute',
            left: xFor(selectedIndex) - 3,
            top: topAxis,
            bottom: bottomAxis,
            width: barWidth + 6,
            borderWidth: 2,
            borderColor: colors.primary.light,
            borderRadius: 8,
            shadowColor: colors.primary.light,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 8,
            elevation: 5,
          }}
        />
      )}

      {/* Tooltip */}
      {selectedIndex !== null &&
        perDayCats[selectedIndex] &&
        (() => {
          const day = perDayCats[selectedIndex];
          const total = category === 'all' ? day.total : day.vals[category];

          if (total === 0) return null;

          const barLeft = xFor(selectedIndex);
          const tooltipWidth = 200;
          const left = Math.max(
            8,
            Math.min(
              barLeft - tooltipWidth / 2 + barWidth / 2,
              width - tooltipWidth - 8
            )
          );
          const barTop = topAxis + (innerH - scaleY(total));

          return (
            <View
              style={{
                position: 'absolute',
                left,
                bottom: bottomAxis + barTop + 20,
                width: tooltipWidth,
                padding: 12,
                backgroundColor: 'rgba(13,20,36,0.95)',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.text.primary,
                  textAlign: 'center',
                  marginBottom: 8,
                }}
              >
                {formatHM(total)} • {day.day}
              </Text>

              {category === 'all' ? (
                <View style={{ gap: 6 }}>
                  {[
                    {
                      key: 'productivity',
                      label: 'Productivity',
                      color: CATEGORY_COLOR.productivity,
                    },
                    {
                      key: 'social',
                      label: 'Social',
                      color: CATEGORY_COLOR.social,
                    },
                    {
                      key: 'entertainment',
                      label: 'Entertainment',
                      color: CATEGORY_COLOR.entertainment,
                    },
                    {
                      key: 'games',
                      label: 'Games',
                      color: CATEGORY_COLOR.games,
                    },
                    {
                      key: 'other',
                      label: 'Other',
                      color: CATEGORY_COLOR.other,
                    },
                  ]
                    .map((cat) => ({
                      ...cat,
                      value: day.vals[cat.key as Category],
                    }))
                    .filter((item) => item.value > 0)
                    .sort((a, b) => b.value - a.value)
                    .map((item) => {
                      const percentage =
                        total > 0 ? Math.round((item.value / total) * 100) : 0;
                      return (
                        <View
                          key={item.key}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <View
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: item.color,
                              }}
                            />
                            <Text
                              style={{
                                fontSize: 12,
                                color: colors.text.secondary,
                              }}
                            >
                              {item.label}
                            </Text>
                          </View>
                          <Text
                            style={{
                              fontSize: 12,
                              color: colors.text.primary,
                              fontWeight: '500',
                            }}
                          >
                            {formatHM(item.value)} • {percentage}%
                          </Text>
                        </View>
                      );
                    })}
                </View>
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.text.secondary,
                    }}
                  >
                    {CATEGORY_LABEL[category]}
                  </Text>
                </View>
              )}
            </View>
          );
        })()}
    </View>
  );
}

/* =========================
   App list row + modal
   ========================= */
function AppRow({
  app,
  onOpen,
}: {
  app: AppUsageData;
  onOpen: (a: AppUsageData) => void;
}) {
  const hasLimit = app.limit != null;
  const ratio = hasLimit
    ? Math.min(1, app.timeSpent / (app.limit as number))
    : 0;
  return (
    <Card padding={12} radius={16} variant="glass">
      <Pressable onPress={() => onOpen(app)}>
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
              <Text
                className="text-xs"
                style={{ color: colors.text.secondary }}
              >
                {formatHM(app.timeSpent)}
                {hasLimit ? ` • Limit: ${formatHM(app.limit as number)}` : ''}
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.text.muted}
          />
        </View>
        {hasLimit && (
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
                : `${formatHM((app.limit as number) - app.timeSpent)} left today`}
            </Text>
          </>
        )}
      </Pressable>
    </Card>
  );
}

function AppDetailModal({
  visible,
  app,
  onClose,
  onSaveLimit,
}: {
  visible: boolean;
  app: AppUsageData | null;
  onClose: () => void;
  onSaveLimit: (mins: number | null) => void;
}) {
  if (!app) return null;
  const options = [15, 30, 60, 90, 120];
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <Card
          radius={24}
          padding={16}
          variant="flat"
          style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        >
          <View
            className="mb-2 h-1.5 w-12 self-center rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
          />
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View
                className="mr-3 size-10 items-center justify-center rounded-full"
                style={{ backgroundColor: `${app.color}26` }}
              >
                <Ionicons name={app.icon as any} size={18} color={app.color} />
              </View>
              <Text
                className="text-lg font-semibold"
                style={{ color: colors.text.primary }}
              >
                {app.name}
              </Text>
            </View>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={20} color={colors.text.secondary} />
            </Pressable>
          </View>

          <View className="mt-1 flex-row gap-10">
            <View>
              <Text
                className="text-[11px]"
                style={{ color: colors.text.secondary }}
              >
                Today
              </Text>
              <Text
                className="font-semibold"
                style={{ color: colors.text.primary }}
              >
                {formatHM(app.timeSpent)}
              </Text>
            </View>
            <View>
              <Text
                className="text-[11px]"
                style={{ color: colors.text.secondary }}
              >
                Sessions
              </Text>
              <Text
                className="font-semibold"
                style={{ color: colors.text.primary }}
              >
                {app.sessions}
              </Text>
            </View>
          </View>

          <View className="mt-6">
            <Text
              className="mb-2 font-semibold"
              style={{ color: colors.text.primary }}
            >
              Daily limit
            </Text>
            <View className="flex-row flex-wrap gap-8">
              {options.map((m) => {
                const active = app.limit === m;
                return (
                  <Pressable
                    key={m}
                    className="rounded-xl px-3 py-2"
                    onPress={() => onSaveLimit(m)}
                    style={{
                      backgroundColor: active
                        ? `${colors.primary.light}22`
                        : 'rgba(255,255,255,0.10)',
                      borderWidth: 1,
                      borderColor: active
                        ? colors.primary.light
                        : colors.cardBorder,
                    }}
                  >
                    <Text
                      style={{
                        color: active
                          ? colors.primary.light
                          : colors.text.primary,
                      }}
                    >
                      {m}m
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                className="rounded-xl px-3 py-2"
                onPress={() => onSaveLimit(null)}
                style={{
                  backgroundColor:
                    app.limit == null
                      ? `${colors.primary.light}22`
                      : 'rgba(255,255,255,0.10)',
                  borderWidth: 1,
                  borderColor:
                    app.limit == null
                      ? colors.primary.light
                      : colors.cardBorder,
                }}
              >
                <Text
                  style={{
                    color:
                      app.limit == null
                        ? colors.primary.light
                        : colors.text.primary,
                  }}
                >
                  No limit
                </Text>
              </Pressable>
            </View>
          </View>

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
                Done
              </Text>
            </Pressable>
          </View>
        </Card>
      </View>
    </Modal>
  );
}

/* =========================
   Date Range Picker
   ========================= */
function DateRangePicker({
  visible,
  initialRange,
  onClose,
  onApply,
}: {
  visible: boolean;
  initialRange?: DateRange;
  onClose: () => void;
  onApply: (range: NonNullable<DateRange>) => void;
}) {
  const [start, setStart] = React.useState<string | null>(
    initialRange?.startDate ?? null
  );
  const [end, setEnd] = React.useState<string | null>(
    initialRange?.endDate ?? null
  );

  React.useEffect(() => {
    setStart(initialRange?.startDate ?? null);
    setEnd(initialRange?.endDate ?? null);
  }, [initialRange, visible]);

  const onDayPress = (d: DateData) => {
    const day = d.dateString;
    if (!start || (start && end)) {
      setStart(day);
      setEnd(null);
      return;
    }
    if (isBefore(parseISO(day), parseISO(start))) {
      setStart(day);
      setEnd(null);
      return;
    }
    if (isEqual(parseISO(day), parseISO(start))) {
      setEnd(day);
      return;
    }
    setEnd(day);
  };

  const marked: MarkedDates = React.useMemo(() => {
    const m: MarkedDates = {};
    if (start)
      m[start] = {
        startingDay: true,
        color: colors.primary.light,
        textColor: '#fff',
      } as any;
    if (start && end) {
      let cur = parseISO(start);
      const last = parseISO(end);
      while (cur <= last) {
        const key = format(cur, 'yyyy-MM-dd');
        m[key] = {
          ...(m[key] as any),
          color: colors.primary.light,
          textColor: '#fff',
          ...(key === start ? { startingDay: true } : {}),
          ...(key === end ? { endingDay: true } : {}),
        } as any;
        cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
      }
    }
    return m;
  }, [start, end]);

  const canApply = !!start && !!end;

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
      transparent
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="rounded-t-2xl bg-[#0B1220] px-4 pb-6 pt-3">
          <View className="mb-2 h-1.5 w-12 self-center rounded-full bg-white/20" />
          <Text
            className="mb-3 text-center text-base font-semibold"
            style={{ color: colors.text.primary }}
          >
            Pick a date range
          </Text>

          <Calendar
            markingType="period"
            markedDates={marked}
            onDayPress={onDayPress}
            theme={{
              calendarBackground: 'transparent',
              dayTextColor: colors.text.primary,
              monthTextColor: colors.text.primary,
              selectedDayBackgroundColor: colors.primary.light,
              arrowColor: colors.text.primary,
              todayTextColor: colors.primary.light,
            }}
            hideExtraDays
            enableSwipeMonths
          />

          <View className="mt-4 flex-row gap-8">
            <Pressable
              className="flex-1 rounded-xl border px-4 py-3"
              style={{ borderColor: colors.cardBorder }}
              onPress={() => {
                setStart(null);
                setEnd(null);
              }}
            >
              <Text
                className="text-center"
                style={{ color: colors.text.primary }}
              >
                Clear
              </Text>
            </Pressable>
            <Pressable
              className="flex-1 rounded-xl px-4 py-3"
              style={{
                backgroundColor: canApply
                  ? colors.primary.light
                  : colors.cardBorder,
              }}
              onPress={() => {
                if (canApply && start && end)
                  onApply({ startDate: start, endDate: end });
              }}
              disabled={!canApply}
            >
              <Text className="text-center font-semibold text-white">
                Apply
              </Text>
            </Pressable>
          </View>

          <Pressable className="mt-3 py-2" onPress={onClose}>
            <Text
              className="text-center"
              style={{ color: colors.text.secondary }}
            >
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/* =========================
   Main screen
   ========================= */
export default function AnalyticsScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [refreshing, setRefreshing] = React.useState(false);
  const [filter, setFilter] = React.useState<DateFilter>('week');
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [dateRange, setDateRange] = React.useState<DateRange>(null);
  const [selectedCategory, setSelectedCategory] =
    React.useState<CategoryOrAll>('all');
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailApp, setDetailApp] = React.useState<AppUsageData | null>(null);
  const [selectedBarIndex, setSelectedBarIndex] = React.useState<number | null>(
    null
  );

  const data = React.useMemo(
    () => generateData(filter, dateRange),
    [filter, dateRange]
  );

  const headerLabel = React.useMemo(() => {
    if (dateRange)
      return `${format(parseISO(dateRange.startDate), 'MMM d')} – ${format(parseISO(dateRange.endDate), 'MMM d, yyyy')}`;
    return filter === 'today'
      ? 'Today'
      : filter === 'week'
        ? 'This week'
        : 'This month';
  }, [filter, dateRange]);

  const apps = data.apps;
  const screenTimeSelected =
    selectedCategory === 'all'
      ? data.totals.screenTime
      : apps
          .filter((a) => a.category === selectedCategory)
          .reduce((s, a) => s + a.timeSpent, 0);

  const openApp = (app: AppUsageData) => {
    setDetailApp(app);
    setDetailOpen(true);
  };

  const saveLimit = (mins: number | null) => {
    if (!detailApp) return;
    // Create a new object instead of mutating the existing one
    const updatedApp = { ...detailApp, limit: mins };
    setDetailApp(updatedApp);
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

        <Animated.ScrollView
          entering={FadeIn}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 96 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                setTimeout(() => setRefreshing(false), 500);
              }}
              tintColor={colors.primary.light}
            />
          }
          onScrollBeginDrag={() => {
            // Dismiss tooltip when scrolling
            if (selectedBarIndex !== null) {
              setSelectedBarIndex(null);
            }
          }}
        >
          <View className="px-6" style={{ paddingTop: insets.top + 12 }}>
            {/* Header */}
            <View className="mb-8 flex-row items-center justify-between">
              <View>
                <Text
                  className="text-3xl font-bold"
                  style={{ color: colors.text.primary }}
                >
                  Analytics
                </Text>
                <Text style={{ color: colors.text.secondary }}>
                  {headerLabel}
                </Text>
              </View>
              <Pressable
                onPress={() => setPickerOpen(true)}
                className="rounded-xl px-3 py-2"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                }}
              >
                <Ionicons
                  name="calendar"
                  size={18}
                  color={colors.text.secondary}
                />
              </Pressable>
            </View>

            {/* Segmented */}
            <Segmented
              value={filter}
              onChange={(v) => {
                setFilter(v);
                setDateRange(null);
                setSelectedBarIndex(null);
              }}
            />

            {/* Metrics */}
            <View
              style={{
                marginTop: 12,
                marginBottom: SECTION_GAP - 8,
              }}
            >
              {/* First row: Screen time and Focus */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <MetricCard
                  label="Screen time"
                  value={formatHM(screenTimeSelected)}
                  icon="time-outline"
                  tint={colors.primary.light}
                />
                <MetricCard
                  label="Focus"
                  value={formatHM(data.totals.focusTime)}
                  icon="flash-outline"
                  tint="#2ED48A"
                />
              </View>

              {/* Second row: Pickups and Notifications */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <MetricCard
                  label="Pickups"
                  value={`${data.totals.pickups}`}
                  icon="phone-portrait-outline"
                  tint="#6E8BFF"
                />
                <MetricCard
                  label="Notifications"
                  value={`${data.totals.notifications}`}
                  icon="notifications-outline"
                  tint="#FFB86C"
                />
              </View>
            </View>

            {/* Category chips */}
            <View style={{ marginBottom: SECTION_GAP }}>
              <CategoryChips
                selected={selectedCategory}
                onSelect={(c) => {
                  setSelectedCategory(c);
                  setSelectedBarIndex(null);
                }}
              />
            </View>

            {/* Chart */}
            <Pressable
              onPress={() => {
                // Dismiss tooltip when tapping outside chart bars
                if (selectedBarIndex !== null) {
                  setSelectedBarIndex(null);
                }
              }}
            >
              <Card
                style={{
                  marginTop: 0,
                  paddingTop: 12,
                  paddingBottom: 16,
                  minHeight: 280,
                }}
                variant="glass"
              >
                <View style={{ paddingHorizontal: 12 }}>
                  <Text
                    className="mb-6 text-xl font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    {selectedCategory === 'all'
                      ? filter === 'today'
                        ? 'Today'
                        : filter === 'week'
                          ? 'This week'
                          : 'Daily average'
                      : CATEGORY_LABEL[selectedCategory]}
                  </Text>

                  <StackedWeekChart
                    perDayCats={data.perDayCats}
                    category={selectedCategory}
                    width={width - CONTENT_PAD * 2 - CARD_PAD * 2}
                    height={188}
                    targetMinutes={120}
                    selectedIndex={selectedBarIndex}
                    onBarPress={(idx) =>
                      setSelectedBarIndex((p) => (p === idx ? null : idx))
                    }
                  />

                  <Text
                    className="mt-8 text-center text-xs"
                    style={{ color: colors.text.secondary }}
                  >
                    Screen time per day • Dashed line shows target (2h) • Tap a
                    bar for details
                  </Text>
                </View>
              </Card>
            </Pressable>

            {/* Top apps */}
            <View style={{ marginTop: SECTION_GAP + 8 }}>
              <View className="mb-3 flex-row items-center justify-between">
                <Text
                  className="text-lg font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  Top apps
                </Text>
                <Pressable
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
              <View style={{ gap: 12 }}>
                {[
                  ...(selectedCategory === 'all'
                    ? apps
                    : apps.filter((a) => a.category === selectedCategory)),
                ]
                  .sort((a, b) => b.timeSpent - a.timeSpent)
                  .slice(0, 3)
                  .map((app) => (
                    <AppRow key={app.key} app={app} onOpen={openApp} />
                  ))}
              </View>
            </View>
          </View>
        </Animated.ScrollView>
      </View>

      {/* Range picker */}
      <DateRangePicker
        visible={pickerOpen}
        initialRange={dateRange}
        onClose={() => setPickerOpen(false)}
        onApply={(range) => {
          setDateRange(range);
          setPickerOpen(false);
        }}
      />

      {/* App modal */}
      <AppDetailModal
        visible={detailOpen}
        app={detailApp}
        onClose={() => setDetailOpen(false)}
        onSaveLimit={saveLimit}
      />
    </>
  );
}

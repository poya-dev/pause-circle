// src/app/(app)/(tabs)/groups/[id].tsx
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { Dimensions, Modal, Share } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { Pressable, ScrollView, Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';

/* ---------- Glass ---------- */
const glass = {
  card: {
    backgroundColor: 'rgba(13,20,36,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
};
const Card = ({ children, className, style }: any) => (
  <BlurView tint="dark" intensity={24} style={{ borderRadius: 24 }}>
    <View
      className={className}
      style={[{ borderRadius: 24 }, glass.card, style]}
    >
      {children}
    </View>
  </BlurView>
);

/* ---------- Types ---------- */
type GoalType = 'window' | 'dailyCap';
type Visibility = 'public' | 'private';
type Status = 'upcoming' | 'active' | 'completed';

type Member = {
  id: string;
  name: string;
  minutesToday: number;
  remindersToday: number;
};

type FeedItem = { id: string; who: string; when: string; text: string };

type Challenge = {
  id: string;
  title: string;
  appKey: string;
  appLabel: string;
  goalType: GoalType;
  visibility: Visibility;
  status: Status;
  startDate: Date;
  endDate: Date;
  durationDays: number;
  dayIndex: number;
  members: number;
  joined: boolean;
  isOwner?: boolean;

  quietStart?: string;
  quietEnd?: string;
  capMins?: number;

  membersList: Member[];
  feed: FeedItem[];
};

const APPS = [
  { key: 'tiktok', label: 'TikTok', icon: 'logo-tiktok', color: '#FF2D55' },
  {
    key: 'instagram',
    label: 'Instagram',
    icon: 'logo-instagram',
    color: '#E4405F',
  },
  { key: 'youtube', label: 'YouTube', icon: 'logo-youtube', color: '#FF0000' },
] as const;
const getApp = (k: string) => APPS.find((a) => a.key === k) ?? APPS[0];

/* ---------- Date helpers ---------- */
const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
const isSameDay = (a: Date, b: Date) =>
  startOfDay(a).getTime() === startOfDay(b).getTime();
const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const formatRange = (a: Date, b: Date) => {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const L = a.toLocaleDateString(undefined, opts);
  const R = b.toLocaleDateString(
    undefined,
    a.getFullYear() === b.getFullYear() ? opts : { ...opts, year: 'numeric' }
  );
  const days = Math.max(
    1,
    Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000) +
      1
  );
  return { label: `${L} – ${R}`, days };
};

/* ---------- Mock usage (UI only) ---------- */
function seededRand(seed: number) {
  let t = seed % 2147483647;
  if (t <= 0) t += 2147483646;
  return () => (t = (t * 16807) % 2147483647) / 2147483647;
}
function hourlyUsageForDay(date: Date, seedOffset = 0) {
  const s = startOfDay(date).getTime() / 86400000 + seedOffset;
  const rand = seededRand(Math.floor(s));
  const arr = Array.from({ length: 24 }, (_, h) => {
    const base =
      h >= 20 || h <= 1
        ? 6
        : h >= 12 && h <= 14
          ? 4
          : h >= 7 && h <= 9
            ? 3
            : 1.5;
    const noise = rand() * (h % 2 ? 3 : 2);
    return Math.round(Math.max(0, base + noise) * (rand() < 0.25 ? 0.8 : 1));
  });
  const opens = arr.map((m) => (m === 0 ? 0 : Math.max(1, Math.round(m / 6))));
  return { minutes: arr, opens };
}
function dailyUsageForWeek(anchor: Date, seedOffset = 0) {
  const start = startOfDay(addDays(anchor, -((anchor.getDay() + 6) % 7))); // Mon
  return Array.from({ length: 7 }, (_, i) => {
    const { minutes } = hourlyUsageForDay(addDays(start, i), seedOffset);
    const total = minutes.reduce((s, v) => s + v, 0);
    return Math.round(total);
  });
}
const sum = (a: number[]) => a.reduce((s, v) => s + v, 0);
const formatMins = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

/* ---------- Mini ring ---------- */
function MiniRing({
  pct = 0,
  size = 86,
  appColor,
}: {
  pct?: number;
  size?: number;
  appColor?: string;
}) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, pct));
  const offset = c * (1 - clamped / 100);
  const ringColor = appColor || colors.primary.light;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.10)"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={ringColor}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View className="absolute inset-0 items-center justify-center">
        <Text
          className="text-base font-semibold"
          style={{ color: colors.text.primary }}
        >
          {Math.round(clamped)}%
        </Text>
      </View>
    </View>
  );
}

/* ---------- Simple linear bar ---------- */
function LinearBar({
  pct,
  left,
  right,
}: {
  pct: number;
  left?: string;
  right?: string;
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <View>
      <View
        className="h-2.5 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: 'rgba(255,255,255,0.10)' }}
      >
        <View
          style={{
            width: `${clamped}%`,
            height: '100%',
            backgroundColor: colors.primary.light,
          }}
        />
      </View>
      {(left || right) && (
        <View className="mt-1.5 flex-row items-center justify-between">
          <Text className="text-[11px]" style={{ color: colors.text.muted }}>
            {left ?? ''}
          </Text>
          <Text className="text-[11px]" style={{ color: colors.text.muted }}>
            {right ?? ''}
          </Text>
        </View>
      )}
    </View>
  );
}

/* ---------- Avatars ---------- */
const initials = (name: string) => {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase();
};
function Avatar({ initials: ini }: { initials: string }) {
  return (
    <LinearGradient
      colors={[`${colors.primary.light}55`, `${colors.primary.light}22`]}
      className="size-8 items-center justify-center rounded-full"
    >
      <Text
        className="text-[11px] font-semibold"
        style={{ color: colors.text.primary }}
      >
        {ini}
      </Text>
    </LinearGradient>
  );
}
function AvatarStack({ names }: { names: string[] }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {names.slice(0, 5).map((n, i) => (
        <View key={n} style={{ marginLeft: i === 0 ? 0 : -10 }}>
          <Avatar initials={initials(n)} />
        </View>
      ))}
    </View>
  );
}

/* ---------- Facts row (single line, dot-separated) ---------- */
function FactsRow({
  start,
  end,
  days,
  members,
  isPrivate,
}: {
  start: Date;
  end: Date;
  days: number;
  members: number;
  isPrivate: boolean;
}) {
  const Dot = () => (
    <View
      style={{
        width: 3,
        height: 3,
        borderRadius: 2,
        backgroundColor: colors.text.muted,
        opacity: 0.8,
      }}
    />
  );
  const Line = ({ t }: { t: string }) => (
    <Text style={{ color: colors.text.secondary, fontSize: 12 }}>{t}</Text>
  );
  const left = start.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  const right = end.toLocaleDateString(
    undefined,
    start.getFullYear() === end.getFullYear()
      ? { month: 'short', day: 'numeric' }
      : { month: 'short', day: 'numeric', year: 'numeric' }
  );
  return (
    <View className="flex-row flex-wrap items-center" style={{ gap: 8 }}>
      <Line t={`${left} – ${right}`} />
      <Dot />
      <Line t={`${days} days`} />
      <Dot />
      <Line t={`${members} members`} />
      <Dot />
      <Line t={isPrivate ? 'Private' : 'Public'} />
    </View>
  );
}

/* ---------- Tiny bits ---------- */
function NavBtn({
  disabled,
  onPress,
  dir,
}: {
  disabled?: boolean;
  onPress: () => void;
  dir: 'back' | 'forward';
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className="rounded-full p-1"
      style={{
        backgroundColor: 'rgba(255,255,255,0.10)',
        opacity: disabled ? 0.4 : 1,
        borderWidth: 1,
        borderColor: colors.cardBorder,
      }}
    >
      <Ionicons
        name={dir === 'back' ? 'chevron-back' : 'chevron-forward'}
        size={16}
        color={colors.text.primary}
      />
    </Pressable>
  );
}
function MetricPill({
  icon,
  value,
  label,
}: {
  icon: any;
  value: string;
  label: string;
}) {
  return (
    <View
      className="flex-1 flex-row items-center justify-center rounded-xl px-2.5 py-2"
      style={{
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: colors.cardBorder,
        gap: 6,
      }}
    >
      <Ionicons name={icon} size={13} color={colors.text.secondary} />
      <View style={{ alignItems: 'center' }}>
        <Text
          className="text-[13px] font-semibold"
          style={{ color: colors.text.primary }}
        >
          {value}
        </Text>
        <Text className="text-[10px]" style={{ color: colors.text.secondary }}>
          {label}
        </Text>
      </View>
    </View>
  );
}

/* ---------- Mock load by id (UI only) ---------- */
function useChallenge(): [Challenge, (n: Partial<Challenge>) => void] {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const base: Challenge =
    id === '2'
      ? {
          id: '2',
          title: 'Instagram under 60m/day',
          appKey: 'instagram',
          appLabel: 'Instagram',
          goalType: 'dailyCap',
          capMins: 60,
          visibility: 'private',
          status: 'active',
          startDate: startOfDay(new Date()),
          endDate: addDays(startOfDay(new Date()), 13),
          durationDays: 14,
          dayIndex: 5,
          members: 4,
          joined: true,
          isOwner: true,
          quietStart: undefined,
          quietEnd: undefined,
          membersList: [
            { id: 'u1', name: 'You', minutesToday: 36, remindersToday: 1 },
            { id: 'u2', name: 'Sara', minutesToday: 22, remindersToday: 0 },
            { id: 'u3', name: 'Mia', minutesToday: 44, remindersToday: 2 },
            { id: 'u4', name: 'David', minutesToday: 63, remindersToday: 3 },
          ],
          feed: [
            { id: 'a', who: 'You', when: '1h ago', text: 'Dismissed reminder' },
            { id: 'b', who: 'Sara', when: '3h ago', text: 'Stayed under cap' },
            {
              id: 'c',
              who: 'Mia',
              when: 'Yesterday',
              text: '2 reminders, closed app',
            },
          ],
        }
      : {
          id: '1',
          title: 'No TikTok after 9:00 PM',
          appKey: 'tiktok',
          appLabel: 'TikTok',
          goalType: 'window',
          quietStart: '9:00 PM',
          quietEnd: '6:00 AM',
          visibility: 'private',
          status: 'active',
          startDate: startOfDay(new Date()),
          endDate: addDays(startOfDay(new Date()), 6),
          durationDays: 7,
          dayIndex: 3,
          members: 4,
          joined: true,
          isOwner: false,
          capMins: undefined,
          membersList: [
            { id: 'u1', name: 'You', minutesToday: 118, remindersToday: 2 },
            { id: 'u2', name: 'Mia', minutesToday: 62, remindersToday: 0 },
            { id: 'u3', name: 'Sam', minutesToday: 140, remindersToday: 3 },
            { id: 'u4', name: 'Ava', minutesToday: 172, remindersToday: 4 },
          ],
          feed: [
            {
              id: 'a',
              who: 'You',
              when: '9:42 PM',
              text: 'Opened app (reminder shown)',
            },
            {
              id: 'b',
              who: 'Mia',
              when: '7:15 PM',
              text: 'No reminders so far',
            },
            {
              id: 'c',
              who: 'Sam',
              when: 'Yesterday',
              text: '1 reminder, closed app',
            },
          ],
        };
  const [c, setC] = React.useState<Challenge>(base);
  return [c, (n) => setC((p) => ({ ...p, ...n }))];
}

/* ---------- ProgressCard (one ring, centered) ---------- */
function ProgressCard({ c, appColor }: { c: Challenge; appColor: string }) {
  // define "On target" for the group:
  const members = c.membersList.length;
  let onTargetCount = 0;
  if (members) {
    if (c.goalType === 'dailyCap' && c.capMins != null) {
      onTargetCount = c.membersList.filter(
        (m) => m.minutesToday <= (c.capMins as number)
      ).length;
    } else {
      // window goal → on target if 0 reminders today
      onTargetCount = c.membersList.filter(
        (m) => m.remindersToday === 0
      ).length;
    }
  }
  const pct = members ? (onTargetCount / members) * 100 : 0;

  const dayLabel = `Day ${c.dayIndex + 1} of ${c.durationDays}`;
  const capLabel =
    c.goalType === 'dailyCap' && c.capMins != null
      ? `Target ${c.capMins}m/day`
      : `Quiet ${c.quietStart}–${c.quietEnd}`;

  return (
    <Card className="mb-5 rounded-3xl p-6">
      <View className="items-center">
        <MiniRing pct={pct} appColor={appColor} />
        <Text
          className="mt-2 text-sm font-semibold"
          style={{ color: colors.text.primary }}
        >
          On target today
        </Text>
        <Text className="text-[12px]" style={{ color: colors.text.secondary }}>
          {onTargetCount}/{members} members
        </Text>
        <Text className="mt-2 text-[11px]" style={{ color: colors.text.muted }}>
          {dayLabel} • {capLabel}
        </Text>
      </View>
    </Card>
  );
}

/* ---------- Members progress modal (clean, always selected) ---------- */
function MemberProgressModal({
  visible,
  members,
  goalType,
  capMins,
  appColor,
  onClose,
}: {
  visible: boolean;
  members: Member[];
  goalType: GoalType;
  capMins?: number;
  appColor: string;
  onClose: () => void;
}) {
  const H = Math.min(Dimensions.get('window').height * 0.9, 780);
  const [q, setQ] = React.useState('');
  const [mode, setMode] = React.useState<'day' | 'week'>('day');
  const [cursor, setCursor] = React.useState<Date>(startOfDay(new Date()));
  const [selected, setSelected] = React.useState<Member | null>(null);

  // default select "You" or first member on open
  React.useEffect(() => {
    if (visible) {
      setQ('');
      setMode('day');
      setCursor(startOfDay(new Date()));
      const you = members.find((m) => m.name.toLowerCase() === 'you');
      setSelected(you ?? members[0] ?? null);
    }
  }, [visible, members]);

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle
      ? members.filter((m) => m.name.toLowerCase().includes(needle))
      : members;
  }, [members, q]);

  // if current selected is filtered out, reselect to first filtered
  React.useEffect(() => {
    if (!selected) return;
    if (!filtered.some((m) => m.id === selected.id)) {
      setSelected(filtered[0] ?? null);
    }
  }, [filtered, selected]);

  const seedFor = (m: Member | null) =>
    m ? m.id.split('').reduce((s, c) => s + c.charCodeAt(0), 0) : 0;
  const usageDay = hourlyUsageForDay(cursor, seedFor(selected));
  const usageWeek = dailyUsageForWeek(cursor, seedFor(selected));
  const dayBars = usageDay.minutes.map((m, i) => ({
    value: m,
    label: i % 3 === 0 ? `${i}` : '',
    frontColor: appColor,
  }));
  const weekBars = usageWeek.map((m, i) => ({
    value: m,
    label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    frontColor: appColor,
  }));
  const totalDay = sum(usageDay.minutes);
  const totalOpens = sum(usageDay.opens);
  const totalWeek = sum(usageWeek);

  const capPct =
    goalType === 'dailyCap' && capMins
      ? Math.min(100, (totalDay / capMins) * 100)
      : undefined;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
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
                maxHeight: H,
              },
            ]}
          >
            <View
              className="mb-3 h-1.5 w-12 self-center rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
            />
            <View className="mb-3 flex-row items-center justify-between">
              <Text
                className="text-base font-semibold"
                style={{ color: colors.text.primary }}
              >
                Members’ progress
              </Text>
              <View className="flex-row items-center" style={{ gap: 8 }}>
                <BlurView
                  tint="dark"
                  intensity={18}
                  style={{ borderRadius: 10 }}
                >
                  <View
                    className="flex-row items-center"
                    style={{ paddingHorizontal: 8, paddingVertical: 6 }}
                  ></View>
                </BlurView>
                <Pressable
                  onPress={onClose}
                  className="rounded-xl px-3 py-2"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.10)',
                    borderWidth: 1,
                    borderColor: colors.cardBorder,
                  }}
                >
                  <Text style={{ color: colors.text.primary }}>Close</Text>
                </Pressable>
              </View>
            </View>

            {/* Member chips (always visible) */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
            >
              <View className="mb-3 flex-row" style={{ gap: 8 }}>
                {filtered.map((m) => {
                  const active = selected?.id === m.id;
                  return (
                    <Pressable
                      key={m.id}
                      onPress={() => setSelected(m)}
                      className="flex-row items-center rounded-full px-3 py-1.5"
                      style={{
                        backgroundColor: active
                          ? `${colors.primary.light}22`
                          : 'rgba(255,255,255,0.06)',
                        borderWidth: 1,
                        borderColor: active
                          ? colors.primary.light
                          : colors.cardBorder,
                        gap: 8,
                      }}
                    >
                      <Avatar initials={initials(m.name)} />
                      <Text
                        className="text-[12px]"
                        style={{
                          color: active
                            ? colors.primary.light
                            : colors.text.primary,
                        }}
                      >
                        {m.name}
                      </Text>
                    </Pressable>
                  );
                })}
                {!filtered.length && (
                  <View
                    className="rounded-full px-3 py-1.5"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      borderWidth: 1,
                      borderColor: colors.cardBorder,
                    }}
                  >
                    <Text
                      className="text-[12px]"
                      style={{ color: colors.text.secondary }}
                    >
                      No members
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Detail (always shows a member if available) */}
            <View
              className="rounded-2xl p-4"
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderWidth: 1,
                borderColor: colors.cardBorder,
              }}
            >
              {!selected ? (
                <Text
                  style={{ color: colors.text.secondary, textAlign: 'center' }}
                >
                  No members to show.
                </Text>
              ) : (
                <>
                  {/* Header row */}
                  <View className="mb-3 flex-row items-center justify-between">
                    <View className="flex-row items-center" style={{ gap: 10 }}>
                      <Avatar initials={initials(selected.name)} />
                      <Text
                        className="font-semibold"
                        style={{ color: colors.text.primary }}
                      >
                        {selected.name}
                      </Text>
                    </View>
                    {capPct !== undefined && (
                      <View style={{ alignItems: 'center' }}>
                        <MiniRing pct={capPct} size={56} appColor={appColor} />
                        <Text
                          style={{
                            color: colors.text.secondary,
                            fontSize: 10,
                            marginTop: 4,
                          }}
                        >
                          of daily cap
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Compact metrics */}
                  <View className="mb-3 flex-row" style={{ gap: 10 }}>
                    <MetricPill
                      icon="time-outline"
                      label="Today"
                      value={formatMins(totalDay)}
                    />
                    <MetricPill
                      icon="apps-outline"
                      label="Opens"
                      value={`${totalOpens}`}
                    />
                    <MetricPill
                      icon="alert-circle-outline"
                      label="Reminders"
                      value={`${selected.remindersToday}`}
                    />
                  </View>

                  {/* Mode + nav */}
                  <View className="mb-2 flex-row items-center justify-between">
                    <View className="flex-row items-center" style={{ gap: 8 }}>
                      <NavBtn
                        onPress={() =>
                          setCursor(addDays(cursor, mode === 'day' ? -1 : -7))
                        }
                        dir="back"
                      />
                      <Text
                        style={{
                          color: colors.text.primary,
                          fontWeight: '600',
                        }}
                      >
                        {mode === 'day'
                          ? isSameDay(cursor, startOfDay(new Date()))
                            ? 'Today'
                            : cursor.toLocaleDateString(undefined, {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })
                          : `Week of ${addDays(cursor, -((cursor.getDay() + 6) % 7)).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                      </Text>
                      <NavBtn
                        onPress={() =>
                          setCursor(addDays(cursor, mode === 'day' ? 1 : 7))
                        }
                        dir="forward"
                      />
                    </View>
                    <View className="flex-row items-center" style={{ gap: 8 }}>
                      {(['day', 'week'] as const).map((m) => {
                        const active = mode === m;
                        return (
                          <Pressable
                            key={m}
                            onPress={() => setMode(m)}
                            className="rounded-xl px-3 py-1.5"
                            style={{
                              backgroundColor: active
                                ? `${colors.primary.light}22`
                                : 'transparent',
                              borderWidth: 1,
                              borderColor: active
                                ? colors.primary.light
                                : colors.cardBorder,
                            }}
                          >
                            <Text
                              className="text-[12px]"
                              style={{
                                color: active
                                  ? colors.primary.light
                                  : colors.text.primary,
                              }}
                            >
                              {m === 'day' ? 'Day' : 'Week'}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  {/* Chart */}
                  <BarChart
                    data={mode === 'day' ? dayBars : weekBars}
                    height={170}
                    barWidth={mode === 'day' ? 9 : 22}
                    spacing={mode === 'day' ? 4 : 10}
                    initialSpacing={12}
                    endSpacing={12}
                    yAxisTextStyle={{ color: colors.text.muted, fontSize: 10 }}
                    xAxisLabelTextStyle={{
                      color: colors.text.muted,
                      fontSize: 10,
                    }}
                    yAxisColor={colors.cardBorder}
                    xAxisColor={colors.cardBorder}
                    yAxisThickness={1}
                    xAxisThickness={1}
                    noOfSections={3}
                    isAnimated
                    animationDuration={500}
                  />
                  <Text
                    className="mt-2 text-center text-[11px]"
                    style={{ color: colors.text.muted }}
                  >
                    Minutes (m) •{' '}
                    {mode === 'day'
                      ? `Total ${formatMins(totalDay)} · ${totalOpens} opens`
                      : `Total ${formatMins(totalWeek)}`}
                  </Text>
                </>
              )}
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

/* ---------- Screen ---------- */
export default function ChallengeDetail(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [c, update] = useChallenge();
  const app = getApp(c.appKey);

  const [progressOpen, setProgressOpen] = React.useState(false);
  const [logOpen, setLogOpen] = React.useState(false);

  const share = async () => {
    try {
      const { label } = formatRange(c.startDate, c.endDate);
      await Share.share({
        message: `Join “${c.title}” (${c.appLabel}). ${label}.`,
      });
    } catch {}
  };

  const { label: _rangeLabel, days } = formatRange(c.startDate, c.endDate);

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
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          <View className="px-6" style={{ paddingTop: insets.top + 12 }}>
            {/* Top bar */}
            <View className="mb-4 flex-row items-center justify-between">
              <Pressable
                className="rounded-xl px-2 py-1"
                onPress={() => router.back()}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.10)',
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                }}
              >
                <Ionicons
                  name="chevron-back"
                  size={18}
                  color={colors.text.primary}
                />
              </Pressable>
              <Pressable
                className="rounded-xl px-3 py-2"
                onPress={share}
                style={{
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                }}
              >
                <Text style={{ color: colors.text.primary }}>
                  Invite members
                </Text>
              </Pressable>
            </View>

            {/* Hero / header */}
            <Card className="mb-5 rounded-3xl p-0">
              <LinearGradient
                colors={[`${app.color}1A`, 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
              >
                <View className="p-5">
                  <View className="flex-row items-center" style={{ gap: 10 }}>
                    <View
                      className="size-10 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: `${app.color}26`,
                        borderWidth: 1,
                        borderColor: `${app.color}40`,
                      }}
                    >
                      <Ionicons
                        name={app.icon as any}
                        size={18}
                        color={app.color}
                      />
                    </View>
                    <Text
                      className="flex-1 text-lg font-semibold"
                      style={{ color: colors.text.primary }}
                    >
                      {c.title}
                    </Text>
                  </View>

                  <Text
                    className="mt-2 text-[13px]"
                    style={{ color: colors.text.secondary }}
                  >
                    {c.goalType === 'dailyCap' && c.capMins != null
                      ? `${c.appLabel} cap ${c.capMins}m/day`
                      : `Quiet window ${c.quietStart} – ${c.quietEnd} (Gentle)`}
                  </Text>

                  <View className="mt-2">
                    <FactsRow
                      start={c.startDate}
                      end={c.endDate}
                      days={days}
                      members={c.members}
                      isPrivate={c.visibility !== 'public'}
                    />
                  </View>
                </View>
              </LinearGradient>
            </Card>

            {/* Progress (one ring) */}
            <ProgressCard c={c} appColor={app.color} />

            {/* Members */}
            <Card className="mb-5 rounded-3xl p-5">
              <View className="mb-3 flex-row items-center justify-between">
                <Text
                  className="text-lg font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  Members
                </Text>
                <Pressable
                  className="rounded-lg px-3 py-1"
                  onPress={() => setProgressOpen(true)}
                  style={{ backgroundColor: 'rgba(255,255,255,0.10)' }}
                >
                  <Text
                    className="text-sm"
                    style={{ color: colors.primary.light }}
                  >
                    See progress
                  </Text>
                </Pressable>
              </View>

              <View className="mb-3 flex-row items-center justify-between">
                <AvatarStack names={c.membersList.map((m) => m.name)} />
                <Text
                  className="text-[12px]"
                  style={{ color: colors.text.secondary }}
                >
                  {c.members} members
                </Text>
              </View>

              {/* Optional tiny teaser (top member today) */}
              {(() => {
                if (!c.membersList.length) return null;
                const top = [...c.membersList].sort(
                  (a, b) => b.minutesToday - a.minutesToday
                )[0];
                const maxMins =
                  c.capMins ??
                  Math.max(...c.membersList.map((x) => x.minutesToday), 60);
                const pct = Math.min(100, (top.minutesToday / maxMins) * 100);
                return (
                  <View
                    className="rounded-xl p-3"
                    style={[glass.card, { borderRadius: 16 }]}
                  >
                    <View className="mb-1.5 flex-row items-center justify-between">
                      <View
                        className="flex-row items-center"
                        style={{ gap: 10 }}
                      >
                        <Avatar initials={initials(top.name)} />
                        <Text
                          className="font-medium"
                          style={{ color: colors.text.primary }}
                        >
                          {top.name}
                        </Text>
                      </View>
                      <Text
                        className="text-[12px]"
                        style={{ color: colors.text.secondary }}
                      >
                        {top.minutesToday}m · {top.remindersToday} reminders
                      </Text>
                    </View>
                    <LinearBar pct={pct} />
                  </View>
                );
              })()}
            </Card>

            {/* Activity (kept simple) */}
            <Card className="mb-8 rounded-3xl p-5">
              <View className="mb-3 flex-row items-center justify-between">
                <Text
                  className="text-lg font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  Activity
                </Text>
                <Pressable
                  onPress={() => setLogOpen(true)}
                  className="rounded-lg px-3 py-1"
                  style={{ backgroundColor: 'rgba(255,255,255,0.10)' }}
                >
                  <Text
                    className="text-sm"
                    style={{ color: colors.primary.light }}
                  >
                    See all
                  </Text>
                </Pressable>
              </View>
              {c.feed.slice(0, 4).map((e) => (
                <View
                  key={e.id}
                  className="mb-3 flex-row items-start"
                  style={{ gap: 10 }}
                >
                  <View
                    className="size-8 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      borderWidth: 1,
                      borderColor: colors.cardBorder,
                    }}
                  >
                    <Ionicons
                      name="chatbox-ellipses-outline"
                      size={16}
                      color={colors.text.secondary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View className="flex-row items-start justify-between">
                      <Text
                        className="font-medium"
                        style={{ color: colors.text.primary }}
                      >
                        {e.who}{' '}
                        <Text
                          style={{
                            color: colors.text.secondary,
                            fontWeight: '400',
                          }}
                        >
                          {e.text}
                        </Text>
                      </Text>
                      <Text
                        className="text-[11px]"
                        style={{ color: colors.text.muted, marginLeft: 10 }}
                      >
                        {e.when}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
              {!c.feed.length && (
                <Text style={{ color: colors.text.secondary }}>
                  No events yet.
                </Text>
              )}
            </Card>
          </View>
        </ScrollView>

        {/* Sticky actions */}
        {c.joined && (
          <BlurView
            tint="dark"
            intensity={24}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}
          >
            <View
              className="px-6 py-4"
              style={{
                borderTopWidth: 1,
                borderTopColor: colors.cardBorder,
                backgroundColor: 'rgba(13,20,36,0.55)',
              }}
            >
              <View className="flex-row" style={{ gap: 12 }}>
                <Pressable
                  className="flex-1 rounded-xl px-4 py-3"
                  onPress={share}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.10)',
                    borderWidth: 1,
                    borderColor: colors.cardBorder,
                  }}
                >
                  <Text
                    className="text-center"
                    style={{ color: colors.text.primary }}
                  >
                    Invite members
                  </Text>
                </Pressable>
                <Pressable
                  className="flex-1 rounded-xl px-4 py-3"
                  onPress={() => {
                    update({
                      joined: false,
                      members: Math.max(1, c.members - 1),
                    });
                    router.back();
                  }}
                  style={{ backgroundColor: colors.primary.light }}
                >
                  <Text className="text-center font-semibold text-white">
                    {c.isOwner ? 'End challenge' : 'Leave challenge'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </BlurView>
        )}
      </View>

      {/* Modals */}
      <MemberProgressModal
        visible={progressOpen}
        members={c.membersList}
        goalType={c.goalType}
        capMins={c.capMins}
        appColor={app.color}
        onClose={() => setProgressOpen(false)}
      />

      <Modal
        visible={logOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setLogOpen(false)}
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
                className="mb-3 text-center text-base font-semibold"
                style={{ color: colors.text.primary }}
              >
                Activity log
              </Text>
              <ScrollView style={{ maxHeight: 420 }}>
                {c.feed.map((e) => (
                  <View
                    key={e.id}
                    className="py-2"
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <View className="flex-row items-start justify-between">
                      <Text style={{ color: colors.text.primary }}>
                        {e.who} —{' '}
                        <Text style={{ color: colors.text.secondary }}>
                          {e.text}
                        </Text>
                      </Text>
                      <Text
                        className="text-[11px]"
                        style={{ color: colors.text.muted, marginLeft: 10 }}
                      >
                        {e.when}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
              <Pressable
                className="mt-4 rounded-xl px-4 py-3"
                style={{ backgroundColor: colors.primary.light }}
                onPress={() => setLogOpen(false)}
              >
                <Text className="text-center font-semibold text-white">
                  Close
                </Text>
              </Pressable>
            </View>
          </BlurView>
        </View>
      </Modal>
    </>
  );
}

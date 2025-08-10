// app/(tabs)/groups.tsx
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import * as React from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import colors from '@/components/ui/colors';

// ---------- Types ----------
type RuleType = 'daily_cap' | 'blackout_window' | 'during_focus';
type Strictness = 'soft' | 'medium' | 'hard';
type Privacy = 'public' | 'private';

type Group = {
  id: string;
  name: string;
  members: number;
  category: string;
  isJoined: boolean;
  currentProgress: number; // %
  targetMinutes: number; // per day
  weeklyGoalLabel: string; // e.g., "5h 30m"
  description: string;
  app: string; // TikTok / Instagram / YouTube ...
  rule: {
    type: RuleType;
    capMinutes?: number;
    window?: { start: string; end: string };
    schedule: 'everyday' | 'weekdays' | { days: number[] }; // 0=Sun..6=Sat
    strictness: Strictness;
    durationWeeks: number;
    notifyOnOverrides: boolean;
    privacy: Privacy;
  };
};

// ---------- Mock data ----------
const STARTER_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Morning Focus Squad',
    members: 24,
    category: 'Productivity',
    isJoined: true,
    currentProgress: 78,
    targetMinutes: 45,
    weeklyGoalLabel: '5h 30m',
    description: 'Start your day with focused work sessions',
    app: 'Instagram',
    rule: {
      type: 'during_focus',
      schedule: 'weekdays',
      strictness: 'soft',
      durationWeeks: 2,
      notifyOnOverrides: false,
      privacy: 'public',
    },
  },
  {
    id: 'g2',
    name: 'Digital Detox Warriors',
    members: 67,
    category: 'Wellness',
    isJoined: true,
    currentProgress: 92,
    targetMinutes: 30,
    weeklyGoalLabel: '3h 30m',
    description: 'Reduce screen time together',
    app: 'TikTok',
    rule: {
      type: 'daily_cap',
      capMinutes: 30,
      schedule: 'everyday',
      strictness: 'medium',
      durationWeeks: 2,
      notifyOnOverrides: true,
      privacy: 'public',
    },
  },
  {
    id: 'g3',
    name: 'Study Buddies',
    members: 156,
    category: 'Education',
    isJoined: false,
    currentProgress: 45,
    targetMinutes: 60,
    weeklyGoalLabel: '7h 00m',
    description: 'Learn and grow with focused study sessions',
    app: 'YouTube',
    rule: {
      type: 'blackout_window',
      window: { start: '21:00', end: '06:00' },
      schedule: 'weekdays',
      strictness: 'soft',
      durationWeeks: 3,
      notifyOnOverrides: false,
      privacy: 'public',
    },
  },
];

// ---------- Glass ----------
const glassStyles = {
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  elevated: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  interactive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
};

const blur = { subtle: 8, medium: 15 };

// ---------- Helpers ----------
const getAppColor = (app: string) =>
  colors.apps[app.toLowerCase() as keyof typeof colors.apps] ||
  colors.primary.light;

function AppIcon({ name, color }: { name: string; color: string }) {
  const lower = name.toLowerCase();
  if (lower === 'tiktok')
    return <FontAwesome6 name="tiktok" size={16} color={color} />;
  if (lower === 'instagram')
    return <Ionicons name="logo-instagram" size={16} color={color} />;
  if (lower === 'youtube')
    return <Ionicons name="logo-youtube" size={16} color={color} />;
  if (lower === 'whatsapp')
    return <Ionicons name="logo-whatsapp" size={16} color={color} />;
  if (lower === 'twitter' || lower === 'x')
    return <Ionicons name="logo-twitter" size={16} color={color} />;
  return <Ionicons name="apps-outline" size={16} color={color} />;
}

function RuleSummary({ group }: { group: Group }) {
  const { type, capMinutes, window, strictness } = group.rule;
  const app = group.app;
  if (type === 'daily_cap') {
    return (
      <Text className="text-xs text-text-secondary">
        Limit <Text className="font-semibold text-text-primary">{app}</Text> to{' '}
        <Text className="font-semibold text-text-primary">
          {capMinutes}m/day
        </Text>{' '}
        • <Text className="capitalize text-text-secondary">{strictness}</Text>
      </Text>
    );
  }
  if (type === 'blackout_window') {
    return (
      <Text className="text-xs text-text-secondary">
        Block <Text className="font-semibold text-text-primary">{app}</Text>{' '}
        from{' '}
        <Text className="font-semibold text-text-primary">{window?.start}</Text>
        –<Text className="font-semibold text-text-primary">{window?.end}</Text>{' '}
        • <Text className="capitalize text-text-secondary">{strictness}</Text>
      </Text>
    );
  }
  return (
    <Text className="text-xs text-text-secondary">
      Block <Text className="font-semibold text-text-primary">{app}</Text>{' '}
      during focus sessions •{' '}
      <Text className="capitalize text-text-secondary">{strictness}</Text>
    </Text>
  );
}

// ---------- UI: Header / Stats ----------
function HeaderSection() {
  return (
    <View className="mb-6">
      <Text className="mb-2 text-3xl font-bold text-text-primary">Groups</Text>
      <Text className="text-text-secondary">
        Join or create challenges to stay accountable together
      </Text>
    </View>
  );
}

function StatsSection({
  myGroups,
  allGroups,
}: {
  myGroups: Group[];
  allGroups: Group[];
}) {
  const joined = myGroups.length;
  const avg = joined
    ? Math.round(
        myGroups.reduce((sum, g) => sum + g.currentProgress, 0) / joined
      )
    : 0;
  const totalMembers = allGroups.reduce((sum, g) => sum + g.members, 0);

  return (
    <BlurView
      intensity={blur.medium}
      tint="dark"
      className="mb-6 overflow-hidden rounded-3xl"
      style={glassStyles.card}
    >
      <View className="p-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-text-primary">
              {joined}
            </Text>
            <Text className="text-sm text-text-secondary">Groups joined</Text>
          </View>
          <View className="mx-4 h-8 w-px bg-cardBorder" />
          <View className="flex-1">
            <Text className="text-2xl font-bold text-text-primary">{avg}%</Text>
            <Text className="text-sm text-text-secondary">Avg progress</Text>
          </View>
          <View className="mx-4 h-8 w-px bg-cardBorder" />
          <View className="flex-1">
            <Text className="text-2xl font-bold text-text-primary">
              {totalMembers}
            </Text>
            <Text className="text-sm text-text-secondary">Total members</Text>
          </View>
        </View>
      </View>
    </BlurView>
  );
}

// ---------- UI: Group Card ----------
function GroupCard({
  group,
  onPress,
  onJoinToggle,
}: {
  group: Group;
  onPress: () => void;
  onJoinToggle: (id: string) => void;
}) {
  const appColor = getAppColor(group.app);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open group ${group.name}`}
      hitSlop={8}
    >
      <BlurView
        intensity={blur.medium}
        tint="dark"
        className="mb-4 overflow-hidden rounded-3xl"
        style={glassStyles.card}
      >
        <View className="p-5">
          {/* Title row */}
          <View className="mb-3 flex-row items-center justify-between">
            <View className="mr-3 flex-1 flex-row items-center">
              <BlurView
                intensity={blur.subtle}
                tint="light"
                className="mr-3 size-12 items-center justify-center overflow-hidden rounded-full"
                style={{
                  backgroundColor: `${appColor}20`,
                  borderWidth: 1,
                  borderColor: `${appColor}40`,
                }}
              >
                <AppIcon name={group.app} color={appColor} />
              </BlurView>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-text-primary">
                  {group.name}
                </Text>
                <Text className="text-xs text-text-secondary">
                  {group.members} members • {group.category} •{' '}
                  {group.rule.privacy === 'public' ? 'Public' : 'Private'}
                </Text>
              </View>
            </View>

            {/* Join/Joined */}
            {group.isJoined ? (
              <View
                className="rounded-full px-3 py-2"
                style={{
                  backgroundColor: `${colors.success}20`,
                  borderWidth: 1,
                  borderColor: `${colors.success}40`,
                }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: colors.success }}
                >
                  Joined
                </Text>
              </View>
            ) : (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  onJoinToggle(group.id);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Join ${group.name}`}
                hitSlop={8}
              >
                <BlurView
                  intensity={blur.subtle}
                  tint="light"
                  className="rounded-full px-4 py-2"
                  style={glassStyles.interactive}
                >
                  <Text className="text-xs font-medium text-text-primary">
                    Join
                  </Text>
                </BlurView>
              </Pressable>
            )}
          </View>

          {/* Rule summary */}
          <RuleSummary group={group} />

          {/* Progress */}
          <View className="mt-3">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-sm text-text-secondary">
                Weekly progress
              </Text>
              <Text className="text-sm font-medium text-text-primary">
                {group.currentProgress}%
              </Text>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-card">
              <LinearGradient
                colors={[colors.primary.light, colors.primary.DEFAULT]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: '100%', width: `${group.currentProgress}%` }}
              />
            </View>
          </View>

          {/* Footer */}
          <View className="mt-3 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons
                name="time-outline"
                size={14}
                color={colors.text.muted}
              />
              <Text className="ml-1 text-xs text-text-muted">
                {group.targetMinutes}m daily goal
              </Text>
            </View>
            <Text className="text-xs font-medium text-text-secondary">
              {group.weeklyGoalLabel} weekly
            </Text>
          </View>
        </View>
      </BlurView>
    </Pressable>
  );
}

// ---------- UI: Create Challenge Button ----------
function CreateGroupButton({ onPress }: { onPress: () => void }) {
  return (
    <BlurView
      intensity={blur.medium}
      tint="dark"
      className="mb-6 overflow-hidden rounded-3xl"
      style={glassStyles.elevated}
    >
      <Pressable
        className="p-5"
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Create new challenge"
        hitSlop={8}
      >
        <View className="flex-row items-center">
          <BlurView
            intensity={blur.subtle}
            tint="light"
            className="mr-4 size-12 items-center justify-center overflow-hidden rounded-full"
            style={{
              backgroundColor: `${colors.primary.light}20`,
              borderWidth: 1,
              borderColor: `${colors.primary.light}40`,
            }}
          >
            <Ionicons name="add" size={24} color={colors.primary.light} />
          </BlurView>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-text-primary">
              Create New Challenge
            </Text>
            <Text className="text-sm text-text-secondary">
              Pick an app and a limit for your group
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.text.muted}
          />
        </View>
      </Pressable>
    </BlurView>
  );
}

// ---------- Modal: Create Challenge (multi-step) ----------
function CreateChallengeModal({
  visible,
  onClose,
  onCreate,
}: {
  visible: boolean;
  onClose: () => void;
  onCreate: (group: Group) => void;
}) {
  // Local form state
  const [app, setApp] = React.useState<
    'TikTok' | 'Instagram' | 'YouTube' | 'WhatsApp'
  >('TikTok');
  const [type, setType] = React.useState<RuleType>('daily_cap');
  const [cap, setCap] = React.useState<number>(30);
  const [start, setStart] = React.useState('21:00');
  const [end, setEnd] = React.useState('06:00');
  const [schedule, setSchedule] = React.useState<
    'everyday' | 'weekdays' | 'custom'
  >('weekdays');
  const [customDays, setCustomDays] = React.useState<number[]>([1, 2, 3, 4, 5]); // Mon..Fri
  const [strictness, setStrictness] = React.useState<Strictness>('medium');
  const [privacy, setPrivacy] = React.useState<Privacy>('public');
  const [durationWeeks, setDurationWeeks] = React.useState(2);
  const [notifyOnOverrides, setNotifyOnOverrides] = React.useState(false);

  const reset = () => {
    setApp('TikTok');
    setType('daily_cap');
    setCap(30);
    setStart('21:00');
    setEnd('06:00');
    setSchedule('weekdays');
    setCustomDays([1, 2, 3, 4, 5]);
    setStrictness('medium');
    setPrivacy('public');
    setDurationWeeks(2);
    setNotifyOnOverrides(false);
  };

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const RulePreview = () => (
    <View
      className="mt-3 rounded-xl p-3"
      style={{
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderColor: colors.cardBorder,
        borderWidth: 1,
      }}
    >
      <Text className="text-sm text-text-secondary">Rule preview</Text>
      <Text className="mt-1 text-text-primary">
        {type === 'daily_cap' && (
          <>
            Limit <Text className="font-semibold">{app}</Text> to{' '}
            <Text className="font-semibold">{cap}m/day</Text>
          </>
        )}
        {type === 'blackout_window' && (
          <>
            Block <Text className="font-semibold">{app}</Text> from{' '}
            <Text className="font-semibold">{start}</Text>–
            <Text className="font-semibold">{end}</Text>
          </>
        )}
        {type === 'during_focus' && (
          <>
            Block <Text className="font-semibold">{app}</Text> during focus
            sessions
          </>
        )}
      </Text>
      <Text className="text-sm text-text-secondary">
        {schedule === 'everyday'
          ? 'Every day'
          : schedule === 'weekdays'
            ? 'Weekdays'
            : `Custom (${customDays.map((d) => dayLabels[d]).join(' ')})`}{' '}
        • <Text className="capitalize">{strictness}</Text> •{' '}
        {privacy === 'public' ? 'Public' : 'Private'} • {durationWeeks}w
      </Text>
      {notifyOnOverrides ? (
        <Text className="mt-1 text-xs text-text-secondary">
          Group will be notified on overrides
        </Text>
      ) : null}
    </View>
  );

  const handleCreate = () => {
    const id = `g_${Math.random().toString(36).slice(2, 8)}`;
    const newGroup: Group = {
      id,
      name: `${app} ${type === 'daily_cap' ? `${cap}m` : type === 'blackout_window' ? 'Blackout' : 'Focus-only'} Challenge`,
      members: 1,
      category: 'Wellness',
      isJoined: true,
      currentProgress: 0,
      targetMinutes: type === 'daily_cap' ? cap : 30,
      weeklyGoalLabel: '—',
      description:
        type === 'daily_cap'
          ? `Stay under ${cap} minutes of ${app} each day`
          : type === 'blackout_window'
            ? `Avoid ${app} at night from ${start}–${end}`
            : `Block ${app} only while you’re in a focus session`,
      app,
      rule: {
        type,
        capMinutes: type === 'daily_cap' ? cap : undefined,
        window: type === 'blackout_window' ? { start, end } : undefined,
        schedule:
          schedule === 'everyday'
            ? 'everyday'
            : schedule === 'weekdays'
              ? 'weekdays'
              : { days: customDays },
        strictness,
        durationWeeks,
        notifyOnOverrides,
        privacy,
      },
    };
    onCreate(newGroup);
    reset();
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
      transparent
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="max-h-[82%] rounded-t-2xl bg-[#0B1220] px-4 pb-6 pt-3">
          <View className="mb-2 h-1.5 w-12 self-center rounded-full bg-white/20" />
          <Text className="mb-1 text-center text-base font-semibold text-text-primary">
            Create Challenge
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {/* App selection */}
            <Text className="mb-2 mt-3 text-sm text-text-secondary">
              Choose app
            </Text>
            <View className="flex-row flex-wrap gap-8">
              {(['TikTok', 'Instagram', 'YouTube', 'WhatsApp'] as const).map(
                (a) => {
                  const selected = app === a;
                  const color = getAppColor(a);
                  return (
                    <Pressable
                      key={a}
                      onPress={() => setApp(a)}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${a}`}
                    >
                      <View className="items-center">
                        <BlurView
                          intensity={blur.subtle}
                          tint="dark"
                          className="mb-1 size-12 items-center justify-center overflow-hidden rounded-xl"
                          style={{
                            backgroundColor: selected
                              ? `${color}33`
                              : colors.card,
                            borderWidth: 1,
                            borderColor: selected ? color : colors.cardBorder,
                          }}
                        >
                          <AppIcon
                            name={a}
                            color={selected ? color : colors.text.secondary}
                          />
                        </BlurView>
                        <Text
                          className="text-xs"
                          style={{
                            color: selected
                              ? colors.text.primary
                              : colors.text.secondary,
                          }}
                        >
                          {a}
                        </Text>
                      </View>
                    </Pressable>
                  );
                }
              )}
            </View>

            {/* Rule type */}
            <Text className="mb-2 mt-5 text-sm text-text-secondary">
              Rule type
            </Text>
            <Segmented
              value={type}
              items={[
                { key: 'daily_cap', label: 'Daily cap' },
                { key: 'blackout_window', label: 'Blackout' },
                { key: 'during_focus', label: 'During focus' },
              ]}
              onChange={(k) => setType(k as RuleType)}
            />

            {/* Type-specific inputs */}
            {type === 'daily_cap' && (
              <>
                <Text className="mb-2 mt-4 text-sm text-text-secondary">
                  Daily minutes
                </Text>
                <ChipRow<number>
                  options={[15, 30, 45, 60, 90]}
                  value={cap}
                  onChange={setCap}
                  renderLabel={(n) => `${n}m`}
                />
              </>
            )}

            {type === 'blackout_window' && (
              <>
                <Text className="mb-2 mt-4 text-sm text-text-secondary">
                  Window
                </Text>
                <View className="flex-row gap-8">
                  <TimePill
                    label={start}
                    onPress={() => setStart(nextTime(start))}
                  />
                  <Text className="self-center text-text-secondary">to</Text>
                  <TimePill label={end} onPress={() => setEnd(nextTime(end))} />
                </View>
              </>
            )}

            {type === 'during_focus' && (
              <InfoNote text="The app will be blocked only while a focus session is running." />
            )}

            {/* Schedule */}
            <Text className="mb-2 mt-5 text-sm text-text-secondary">
              Schedule
            </Text>
            <Segmented
              value={schedule}
              items={[
                { key: 'everyday', label: 'Every day' },
                { key: 'weekdays', label: 'Weekdays' },
                { key: 'custom', label: 'Custom' },
              ]}
              onChange={(k) => setSchedule(k as any)}
            />
            {schedule === 'custom' && (
              <View className="mt-3 flex-row justify-between">
                {dayLabels.map((d, i) => {
                  const selected = customDays.includes(i);
                  return (
                    <Pressable
                      key={i}
                      onPress={() =>
                        setCustomDays((prev) =>
                          prev.includes(i)
                            ? prev.filter((x) => x !== i)
                            : [...prev, i]
                        )
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`Toggle ${d}`}
                    >
                      <BlurView
                        intensity={blur.subtle}
                        tint="dark"
                        className="size-9 items-center justify-center overflow-hidden rounded-full"
                        style={{
                          backgroundColor: selected
                            ? 'rgba(255,255,255,0.14)'
                            : colors.card,
                          borderWidth: 1,
                          borderColor: selected
                            ? colors.primary.light
                            : colors.cardBorder,
                        }}
                      >
                        <Text
                          className="text-xs"
                          style={{
                            color: selected
                              ? colors.text.primary
                              : colors.text.secondary,
                          }}
                        >
                          {d}
                        </Text>
                      </BlurView>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* Strictness */}
            <Text className="mb-2 mt-5 text-sm text-text-secondary">
              Strictness
            </Text>
            <ChipRow<Strictness>
              options={['soft', 'medium', 'hard']}
              value={strictness}
              onChange={setStrictness}
              renderLabel={(s) => s[0].toUpperCase() + s.slice(1)}
            />
            <InfoNote
              text={
                strictness === 'soft'
                  ? 'Soft: reflection screen with a 1-minute peek.'
                  : strictness === 'medium'
                    ? 'Medium: reflection, delay, and 15-minute override with cooldown.'
                    : 'Hard: no overrides — the app stays blocked.'
              }
            />

            {/* Privacy & duration */}
            <Text className="mb-2 mt-5 text-sm text-text-secondary">
              Privacy
            </Text>
            <ChipRow<Privacy>
              options={['public', 'private']}
              value={privacy}
              onChange={setPrivacy}
              renderLabel={(p) => p[0].toUpperCase() + p.slice(1)}
            />

            <Text className="mb-2 mt-5 text-sm text-text-secondary">
              Duration
            </Text>
            <ChipRow<number>
              options={[1, 2, 3, 4]}
              value={durationWeeks}
              onChange={setDurationWeeks}
              renderLabel={(n) => `${n} wk`}
            />

            {/* Notifications */}
            <ToggleRow
              label="Notify group on overrides"
              value={notifyOnOverrides}
              onToggle={() => setNotifyOnOverrides((v) => !v)}
            />

            {/* Preview */}
            <RulePreview />
          </ScrollView>

          {/* Actions */}
          <View className="mt-2 flex-row gap-12">
            <Pressable
              className="flex-1 rounded-xl border px-4 py-3"
              style={{ borderColor: colors.cardBorder }}
              onPress={onClose}
            >
              <Text className="text-center text-text-primary">Cancel</Text>
            </Pressable>
            <Pressable
              className="flex-1 rounded-xl px-4 py-3"
              style={{ backgroundColor: colors.primary.light }}
              onPress={handleCreate}
            >
              <Text className="text-center font-semibold text-white">
                Create
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ---------- Bits used in modal ----------
function Segmented<T extends string>({
  value,
  items,
  onChange,
}: {
  value: T;
  items: { key: T; label: string }[];
  onChange: (k: T) => void;
}) {
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
          key={it.key}
          onPress={() => onChange(it.key)}
          className="flex-1 items-center rounded-lg py-2"
          accessibilityRole="button"
          accessibilityLabel={`Select ${it.label}`}
          hitSlop={8}
          style={{
            backgroundColor:
              value === it.key ? colors.primary.light : 'transparent',
          }}
        >
          <Text
            style={{
              color: value === it.key ? '#fff' : colors.text.secondary,
              fontWeight: '600',
            }}
          >
            {it.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function ChipRow<T>({
  options,
  value,
  onChange,
  renderLabel,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  renderLabel: (v: T) => string;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((opt) => {
        const selected = opt === value;
        return (
          <Pressable
            key={String(opt)}
            onPress={() => onChange(opt)}
            accessibilityRole="button"
            accessibilityLabel={`Select ${renderLabel(opt)}`}
            hitSlop={8}
          >
            <BlurView
              intensity={blur.subtle}
              tint="dark"
              className="rounded-full px-3 py-2"
              style={{
                backgroundColor: selected
                  ? 'rgba(255,255,255,0.14)'
                  : colors.card,
                borderWidth: 1,
                borderColor: selected
                  ? colors.primary.light
                  : colors.cardBorder,
              }}
            >
              <Text
                className="text-xs"
                style={{
                  color: selected ? colors.text.primary : colors.text.secondary,
                }}
              >
                {renderLabel(opt)}
              </Text>
            </BlurView>
          </Pressable>
        );
      })}
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      className="mt-5 flex-row items-center justify-between"
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
    >
      <Text className="text-text-primary">{label}</Text>
      <BlurView
        intensity={blur.subtle}
        tint="dark"
        className="h-6 w-12 overflow-hidden rounded-full"
        style={{
          backgroundColor: value ? `${colors.primary.light}26` : colors.card,
          borderWidth: 1,
          borderColor: value ? colors.primary.light : colors.cardBorder,
        }}
      >
        <View
          style={{
            width: '50%',
            height: '100%',
            borderRadius: 999,
            backgroundColor: value
              ? colors.primary.light
              : colors.text.secondary,
            transform: [{ translateX: value ? 24 : 0 }],
          }}
        />
      </BlurView>
    </Pressable>
  );
}

function TimePill({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Change time ${label}`}
    >
      <BlurView
        intensity={blur.subtle}
        tint="dark"
        className="rounded-xl px-3 py-2"
        style={{
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.cardBorder,
        }}
      >
        <Text style={{ color: colors.text.primary }}>{label}</Text>
      </BlurView>
    </Pressable>
  );
}
const nextTime = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10));
  const nh = (h + 1) % 24;
  return `${String(nh).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

function InfoNote({ text }: { text: string }) {
  return (
    <View
      className="mt-3 rounded-xl p-3"
      style={{
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderColor: colors.cardBorder,
        borderWidth: 1,
      }}
    >
      <Text className="text-xs text-text-secondary">{text}</Text>
    </View>
  );
}

// ---------- Main screen ----------
export default function GroupsScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [groups, setGroups] = React.useState<Group[]>(STARTER_GROUPS);
  const [createOpen, setCreateOpen] = React.useState(false);

  const myGroups = groups.filter((g) => g.isJoined);
  const discover = groups.filter((g) => !g.isJoined);

  const toggleJoin = (id: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              isJoined: !g.isJoined,
              members: g.isJoined ? g.members - 1 : g.members + 1,
            }
          : g
      )
    );
  };

  const handleCreate = (g: Group) => {
    // Newly created group is joined by creator and placed at top
    setGroups((prev) => [g, ...prev]);
  };

  const openGroup = (g: Group) => {
    Alert.alert(
      g.name,
      `${g.description}\n\nRule: ${
        g.rule.type === 'daily_cap'
          ? `Daily cap ${g.rule.capMinutes}m`
          : g.rule.type === 'blackout_window'
            ? `Blackout ${g.rule.window?.start}–${g.rule.window?.end}`
            : 'Block during focus'
      } • ${g.rule.privacy}`,
      [
        {
          text: g.isJoined ? 'Leave' : 'Join',
          onPress: () => toggleJoin(g.id),
        },
        { text: 'Close', style: 'cancel' },
      ]
    );
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
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6" style={{ paddingTop: insets.top + 20 }}>
            <HeaderSection />
            <StatsSection myGroups={myGroups} allGroups={groups} />
            <CreateGroupButton onPress={() => setCreateOpen(true)} />

            {/* My Groups */}
            <View className="mb-6">
              <Text className="mb-4 text-xl font-semibold text-text-primary">
                My Groups
              </Text>
              {myGroups.length === 0 ? (
                <EmptyRow text="You haven’t joined any groups yet." />
              ) : (
                <FlatList
                  scrollEnabled={false}
                  data={myGroups}
                  keyExtractor={(g) => g.id}
                  ItemSeparatorComponent={() => <View className="h-2" />}
                  renderItem={({ item }) => (
                    <GroupCard
                      group={item}
                      onPress={() => openGroup(item)}
                      onJoinToggle={toggleJoin}
                    />
                  )}
                />
              )}
            </View>

            {/* Discover */}
            <View className="mb-6">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-xl font-semibold text-text-primary">
                  Discover
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="See all suggested groups"
                  hitSlop={8}
                  onPress={() => {}}
                >
                  <Text
                    className="text-sm"
                    style={{ color: colors.primary.light }}
                  >
                    See All
                  </Text>
                </Pressable>
              </View>
              {discover.length === 0 ? (
                <EmptyRow text="No suggestions right now. Create your own challenge!" />
              ) : (
                <FlatList
                  scrollEnabled={false}
                  data={discover}
                  keyExtractor={(g) => g.id}
                  ItemSeparatorComponent={() => <View className="h-2" />}
                  renderItem={({ item }) => (
                    <GroupCard
                      group={item}
                      onPress={() => openGroup(item)}
                      onJoinToggle={toggleJoin}
                    />
                  )}
                />
              )}
            </View>
          </View>
        </Animated.ScrollView>
      </View>

      {/* Create modal */}
      <CreateChallengeModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
    </>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <BlurView
      intensity={blur.medium}
      tint="dark"
      className="overflow-hidden rounded-2xl"
      style={glassStyles.card}
    >
      <View className="p-5">
        <Text className="text-sm text-text-secondary">{text}</Text>
      </View>
    </BlurView>
  );
}

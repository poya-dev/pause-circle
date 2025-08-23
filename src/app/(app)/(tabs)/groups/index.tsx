// src/app/(app)/(tabs)/groups/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  SectionList,
  Share,
  TextInput,
  View as RNView,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { Pressable, SafeAreaView, Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';

/* -----------------------------
   Types & Mock (private only)
----------------------------- */
type Role = 'owner' | 'admin' | 'member';

type Challenge = {
  id: string;
  title: string;
  description: string;
  members: number;
  dailyTargetMinutes: number;
  weeklyTargetMinutes: number;
  weeklyProgressPct: number; // 0..100
  inviteCode: string; // e.g., '9XZ4KD'
  isMember: boolean;
  role: Role;
  // “Today” context
  remindersToday: number;
  minutesToday: number;
};

const MY_CHALLENGES: Challenge[] = [
  {
    id: '1',
    title: 'No TikTok after 9:00 PM',
    description: 'Quiet window at night. Keep evenings distraction-free.',
    members: 5,
    dailyTargetMinutes: 0,
    weeklyTargetMinutes: 330,
    weeklyProgressPct: 72,
    inviteCode: '9XZ4KD',
    isMember: true,
    role: 'owner',
    remindersToday: 2,
    minutesToday: 5,
  },
  {
    id: '2',
    title: 'Instagram under 60m/day',
    description: 'Cap Instagram to 1h daily and keep the streak alive.',
    members: 3,
    dailyTargetMinutes: 60,
    weeklyTargetMinutes: 420,
    weeklyProgressPct: 88,
    inviteCode: 'B7Q2TN',
    isMember: true,
    role: 'member',
    remindersToday: 1,
    minutesToday: 0,
  },
];

/* -----------------------------
   Helpers
----------------------------- */
const fmtMin = (m: number) => {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return h ? `${h}h ${mm}m` : `${mm}m`;
};
const progressColor = (p: number) =>
  p >= 80 ? colors.success : p >= 40 ? colors.primary.light : '#F59E0B';
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const formatTime = (d: Date) => {
  const h = d.getHours();
  const m = pad(d.getMinutes());
  const h12 = ((h + 11) % 12) + 1;
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h12}:${m} ${ampm}`;
};
// const stripTime = (d: Date) => {
//   const x = new Date(d);
//   x.setHours(0, 0, 0, 0);
//   return x;
// };
const randomCode = (len = 6) =>
  Array.from(
    { length: len },
    () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
  ).join('');

/* -----------------------------
   Mini ring progress
----------------------------- */
function MiniRing({ pct = 0, size = 56 }: { pct?: number; size?: number }) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, pct));
  const offset = c * (1 - clamped / 100);

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
          stroke={progressColor(clamped)}
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
          className="text-xs font-semibold"
          style={{ color: colors.text.primary }}
        >
          {Math.round(clamped)}%
        </Text>
      </View>
    </View>
  );
}

/* -----------------------------
   Reusable Glass Card
----------------------------- */
function GlassCard({
  children,
  style,
}: React.PropsWithChildren<{ style?: any }>) {
  return (
    <BlurView
      intensity={18}
      tint="dark"
      style={[
        { borderRadius: 20, overflow: 'hidden', marginBottom: 16 },
        style,
      ]}
    >
      <RNView
        style={{
          backgroundColor: 'rgba(13,20,36,0.35)',
          borderColor: 'rgba(255,255,255,0.06)',
          borderWidth: 1,
        }}
      >
        {children}
      </RNView>
    </BlurView>
  );
}

/* -----------------------------
   Join with Code Sheet
----------------------------- */
function JoinCodeSheet({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
}) {
  const [code, setCode] = React.useState('');
  React.useEffect(() => {
    if (visible) setCode('');
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      animationType="slide"
      transparent
      visible
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <View className="flex-1 justify-end bg-black/40">
        <BlurView
          tint="dark"
          intensity={28}
          style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View
              style={{
                padding: 20,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                backgroundColor: 'rgba(13,20,36,0.80)',
                borderTopColor: 'rgba(255,255,255,0.06)',
                borderTopWidth: 1,
              }}
            >
              <View
                className="mb-3 h-1.5 w-12 self-center rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
              />
              <Text
                className="mb-1 text-center text-base font-semibold"
                style={{ color: colors.text.primary }}
              >
                Join with code
              </Text>
              <Text
                className="mb-4 text-center text-xs"
                style={{ color: colors.text.secondary }}
              >
                Ask a friend for the invite code
              </Text>

              <View
                className="mb-3 flex-row items-center rounded-xl px-3 py-2"
                style={{
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                }}
              >
                <Text style={{ color: colors.text.secondary, marginRight: 8 }}>
                  #
                </Text>
                <TextInput
                  autoCapitalize="characters"
                  autoCorrect={false}
                  placeholder="9XZ4KD"
                  placeholderTextColor={colors.text.muted}
                  value={code}
                  onChangeText={setCode}
                  maxLength={8}
                  style={{
                    color: colors.text.primary,
                    flex: 1,
                    letterSpacing: 2,
                    fontWeight: '600',
                  }}
                />
              </View>

              <View className="flex-row" style={{ gap: 12 }}>
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
                    backgroundColor: colors.primary.light,
                    opacity: code.trim() ? 1 : 0.6,
                  }}
                  disabled={!code.trim()}
                  onPress={() => onSubmit(code.trim().toUpperCase())}
                >
                  <Text className="text-center font-semibold text-white">
                    Join
                  </Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </BlurView>
      </View>
    </Modal>
  );
}

/* -----------------------------
   CREATE PRIVATE CHALLENGE SHEET
----------------------------- */
type GoalType = 'window' | 'dailyCap';
const APPS = [
  { key: 'tiktok', label: 'TikTok', color: '#FF2D55', icon: 'logo-tiktok' },
  {
    key: 'instagram',
    label: 'Instagram',
    color: '#E4405F',
    icon: 'logo-instagram',
  },
  { key: 'youtube', label: 'YouTube', color: '#FF0000', icon: 'logo-youtube' },
] as const;

function CreatePrivateChallengeSheet({
  visible,
  onClose,
  onCreate,
}: {
  visible: boolean;
  onClose: () => void;
  onCreate: (c: Challenge) => void;
}) {
  // const today = React.useMemo(() => stripTime(new Date()), []);
  const [appKey, setAppKey] =
    React.useState<(typeof APPS)[number]['key']>('tiktok');
  const app = React.useMemo(
    () => APPS.find((a) => a.key === appKey)!,
    [appKey]
  );
  const [goal, setGoal] = React.useState<GoalType>('window');
  const [desc, setDesc] = React.useState('');
  const [capMins, setCapMins] = React.useState(60);

  // quiet window
  const [startTime, setStartTime] = React.useState(
    new Date(new Date().setHours(21, 0, 0, 0))
  );
  const [endTime, setEndTime] = React.useState(
    new Date(new Date().setHours(6, 0, 0, 0))
  );
  type PickerTarget = 'startTime' | 'endTime' | null;
  const [picker, setPicker] = React.useState<PickerTarget>(null);

  React.useEffect(() => {
    if (!visible) return;
    // reset to defaults on open
    setAppKey('tiktok');
    setGoal('window');
    setDesc('');
    setCapMins(60);
    setStartTime(new Date(new Date().setHours(21, 0, 0, 0)));
    setEndTime(new Date(new Date().setHours(6, 0, 0, 0)));
    setPicker(null);
  }, [visible]);

  const title =
    goal === 'window'
      ? `No ${app.label} after ${formatTime(startTime)}`
      : `${app.label} under ${capMins}m/day`;

  const create = () => {
    const daily = goal === 'dailyCap' ? capMins : 0;
    const weekly = daily * 7; // simple derived weekly target for the card
    const newItem: Challenge = {
      id: `${Date.now()}`,
      title,
      description:
        desc ||
        (goal === 'window'
          ? `Quiet window: ${formatTime(startTime)}–${formatTime(endTime)}`
          : `Daily cap ${capMins} minutes`),
      members: 1,
      dailyTargetMinutes: daily,
      weeklyTargetMinutes: weekly,
      weeklyProgressPct: 0,
      inviteCode: randomCode(),
      isMember: true,
      role: 'owner',
      remindersToday: 0,
      minutesToday: 0,
    };
    onCreate(newItem);
    onClose();
  };

  if (!visible) return null;

  const chip = (active: boolean, label: string, onPress: () => void) => (
    <Pressable
      onPress={onPress}
      className="rounded-xl px-3 py-2"
      style={{
        backgroundColor: active
          ? `${colors.primary.light}22`
          : 'rgba(255,255,255,0.10)',
        borderWidth: 1,
        borderColor: active ? colors.primary.light : colors.cardBorder,
      }}
    >
      <Text
        style={{ color: active ? colors.primary.light : colors.text.primary }}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <Modal
      animationType="slide"
      transparent
      visible
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <View className="flex-1 justify-end bg-black/40">
        <BlurView
          tint="dark"
          intensity={28}
          style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View
              style={{
                padding: 20,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                backgroundColor: 'rgba(13,20,36,0.85)',
                borderTopColor: 'rgba(255,255,255,0.06)',
                borderTopWidth: 1,
                maxHeight: 680,
              }}
            >
              <View
                className="mb-3 h-1.5 w-12 self-center rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
              />
              <Text
                className="mb-1 text-center text-base font-semibold"
                style={{ color: colors.text.primary }}
              >
                Create private challenge
              </Text>
              <Text
                className="mb-4 text-center text-xs"
                style={{ color: colors.text.secondary }}
              >
                Gentle reminders • Invite with code
              </Text>

              {/* App picker */}
              <Text
                className="mb-2 text-xs"
                style={{ color: colors.text.secondary }}
              >
                Choose app
              </Text>
              <RNView
                style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}
              >
                {APPS.map((a) => {
                  const active = a.key === appKey;
                  return (
                    <Pressable
                      key={a.key}
                      onPress={() => setAppKey(a.key)}
                      className="items-center rounded-xl px-3 py-2"
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
                      <View
                        className="mb-1 size-10 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: `${a.color}26`,
                          borderWidth: 1,
                          borderColor: `${a.color}40`,
                        }}
                      >
                        <Ionicons
                          name={a.icon as any}
                          size={18}
                          color={a.color}
                        />
                      </View>
                      <Text
                        className="text-xs"
                        style={{
                          color: active
                            ? colors.primary.light
                            : colors.text.primary,
                        }}
                      >
                        {a.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </RNView>

              {/* Goal */}
              <Text
                className="mb-2 text-xs"
                style={{ color: colors.text.secondary }}
              >
                Goal
              </Text>
              <View className="mb-3 flex-row" style={{ gap: 10 }}>
                {chip(goal === 'window', 'Quiet window (after time)', () =>
                  setGoal('window')
                )}
                {chip(goal === 'dailyCap', 'Daily cap (minutes)', () =>
                  setGoal('dailyCap')
                )}
              </View>

              {goal === 'window' ? (
                <>
                  <Text
                    className="mb-2 text-xs"
                    style={{ color: colors.text.secondary }}
                  >
                    Quiet window
                  </Text>
                  <View
                    className="mb-3 flex-row items-center"
                    style={{ gap: 10 }}
                  >
                    <Pressable
                      onPress={() => setPicker('startTime')}
                      className="rounded-xl px-3 py-2"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.10)',
                        borderWidth: 1,
                        borderColor: colors.cardBorder,
                      }}
                    >
                      <Text style={{ color: colors.text.primary }}>
                        Start: {formatTime(startTime)}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setPicker('endTime')}
                      className="rounded-xl px-3 py-2"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.10)',
                        borderWidth: 1,
                        borderColor: colors.cardBorder,
                      }}
                    >
                      <Text style={{ color: colors.text.primary }}>
                        End: {formatTime(endTime)}
                      </Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <>
                  <Text
                    className="mb-2 text-xs"
                    style={{ color: colors.text.secondary }}
                  >
                    Daily cap (minutes)
                  </Text>
                  <View
                    className="mb-3 flex-row items-center"
                    style={{ gap: 10 }}
                  >
                    <Pressable
                      onPress={() => setCapMins(Math.max(5, capMins - 5))}
                      className="rounded-xl px-3 py-2"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.10)',
                        borderWidth: 1,
                        borderColor: colors.cardBorder,
                      }}
                    >
                      <Ionicons
                        name="remove"
                        size={16}
                        color={colors.text.primary}
                      />
                    </Pressable>
                    <BlurView
                      tint="dark"
                      intensity={18}
                      style={{ borderRadius: 10 }}
                    >
                      <View
                        style={{
                          borderRadius: 10,
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          backgroundColor: 'rgba(13,20,36,0.35)',
                          borderWidth: 1,
                          borderColor: 'rgba(255,255,255,0.06)',
                        }}
                      >
                        <TextInput
                          keyboardType="numeric"
                          value={String(capMins)}
                          onChangeText={(t) =>
                            setCapMins(Number(t.replace(/\D/g, '')) || 0)
                          }
                          style={{
                            color: colors.text.primary,
                            minWidth: 48,
                            textAlign: 'center',
                          }}
                        />
                      </View>
                    </BlurView>
                    <Pressable
                      onPress={() => setCapMins(Math.min(600, capMins + 5))}
                      className="rounded-xl px-3 py-2"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.10)',
                        borderWidth: 1,
                        borderColor: colors.cardBorder,
                      }}
                    >
                      <Ionicons
                        name="add"
                        size={16}
                        color={colors.text.primary}
                      />
                    </Pressable>
                  </View>
                </>
              )}

              {/* Description */}
              <Text
                className="mb-2 text-xs"
                style={{ color: colors.text.secondary }}
              >
                Description (optional)
              </Text>
              <View
                className="mb-4 rounded-xl px-3 py-2"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                }}
              >
                <TextInput
                  placeholder="Add a short note for your friends…"
                  placeholderTextColor={colors.text.muted}
                  value={desc}
                  onChangeText={setDesc}
                  multiline
                  style={{ color: colors.text.primary, minHeight: 40 }}
                />
              </View>

              {/* Preview */}
              <View
                className="mb-4 rounded-2xl p-3"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                }}
              >
                <Text
                  className="text-xs"
                  style={{ color: colors.text.secondary }}
                >
                  Preview
                </Text>
                <Text
                  className="mt-1 font-medium"
                  style={{ color: colors.text.primary }}
                >
                  {title}
                </Text>
              </View>

              {/* Actions */}
              <View className="flex-row" style={{ gap: 12 }}>
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
                  onPress={create}
                >
                  <Text className="text-center font-semibold text-white">
                    Create
                  </Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </BlurView>
      </View>

      {/* iOS-style picker over sheet */}
      <DateTimePickerModal
        isVisible={picker !== null}
        mode="time"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        minuteInterval={5}
        date={picker === 'startTime' ? startTime : endTime}
        onConfirm={(d) => {
          if (picker === 'startTime') setStartTime(d);
          if (picker === 'endTime') setEndTime(d);
          // @ts-ignore
          setPicker(null);
        }}
        onCancel={() => setPicker(null)}
      />
    </Modal>
  );
}

/* -----------------------------
   Header Actions (Create / Join)
----------------------------- */
function HeaderActions({
  onCreate,
  onJoin,
}: {
  onCreate: () => void;
  onJoin: () => void;
}) {
  return (
    <View className="mb-4 flex-row gap-3">
      <Pressable
        onPress={onCreate}
        className="flex-1 rounded-2xl px-4 py-3"
        style={{
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.cardBorder,
        }}
      >
        <Text
          className="text-center font-semibold"
          style={{ color: colors.text.primary }}
        >
          Create Challenge
        </Text>
      </Pressable>
      <Pressable
        onPress={onJoin}
        className="flex-1 rounded-2xl px-4 py-3"
        style={{ backgroundColor: colors.primary.light }}
      >
        <Text className="text-center font-semibold" style={{ color: '#fff' }}>
          Join with Code
        </Text>
      </Pressable>
    </View>
  );
}

/* -----------------------------
   Challenge Card (private)
----------------------------- */
function ChallengeCard({
  c,
  onOpen,
  onLeave,
  onInvite,
}: {
  c: Challenge;
  onOpen: () => void;
  onLeave: () => void;
  onInvite: () => void;
}) {
  return (
    <GlassCard>
      <Pressable
        onPress={onOpen}
        accessibilityLabel={`${c.title}, ${c.members} members, ${c.weeklyProgressPct}% weekly progress`}
      >
        <View className="p-5">
          {/* Header */}
          <View className="mb-3 flex-row items-start justify-between">
            <View style={{ flex: 1 }}>
              <Text
                className="text-lg font-semibold"
                style={{ color: colors.text.primary }}
              >
                {c.title}
              </Text>
              <View className="mt-1 flex-row items-center" style={{ gap: 8 }}>
                <MiniPill>{c.members} members</MiniPill>
                {c.role === 'owner' ? (
                  <MiniPill accent>{'Owner'}</MiniPill>
                ) : null}
              </View>
            </View>

            {/* Ring + actions */}
            <View style={{ alignItems: 'flex-end' }}>
              <MiniRing pct={c.weeklyProgressPct} />
              <Text
                className="mt-1 text-[10px]"
                style={{ color: colors.text.secondary }}
              >
                Weekly progress
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text
            className="mb-3 text-sm"
            style={{ color: colors.text.secondary }}
          >
            {c.description}
          </Text>

          {/* Progress Bar */}
          <View
            className="mb-2 h-2 overflow-hidden rounded-full"
            style={{ backgroundColor: colors.card }}
          >
            <LinearGradient
              colors={[
                progressColor(c.weeklyProgressPct),
                progressColor(c.weeklyProgressPct),
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: `${Math.max(0, Math.min(100, c.weeklyProgressPct))}%`,
                height: '100%',
              }}
            />
          </View>
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-xs" style={{ color: colors.text.secondary }}>
              Target: {fmtMin(c.dailyTargetMinutes)} / day ·{' '}
              {fmtMin(c.weeklyTargetMinutes)} / week
            </Text>
            <Text className="text-xs" style={{ color: colors.text.secondary }}>
              Today: {c.remindersToday} reminders · {fmtMin(c.minutesToday)}
            </Text>
          </View>

          {/* Footer actions */}
          <View className="mt-2 flex-row items-center justify-between">
            <View className="flex-row items-center">
              {/* tiny avatars placeholder */}
              <View
                className="mr-2 size-6 overflow-hidden rounded-full border"
                style={{
                  borderColor: colors.card,
                  backgroundColor: colors.card,
                }}
              />
              <View
                className="mr-2 size-6 overflow-hidden rounded-full border"
                style={{
                  borderColor: colors.card,
                  backgroundColor: colors.card,
                }}
              />
              <View
                className="mr-2 size-6 overflow-hidden rounded-full border"
                style={{
                  borderColor: colors.card,
                  backgroundColor: colors.card,
                }}
              />
            </View>
            <View className="flex-row" style={{ gap: 8 }}>
              <Pressable
                onPress={onInvite}
                className="rounded-xl px-3 py-2"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.10)',
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: colors.text.primary }}
                >
                  Invite
                </Text>
              </Pressable>
              <Pressable
                onPress={onLeave}
                className="rounded-xl px-3 py-2"
                style={{
                  backgroundColor: 'rgba(255,77,79,0.14)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,77,79,0.4)',
                }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: '#FF4D4F' }}
                >
                  Leave
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Pressable>
    </GlassCard>
  );
}

function MiniPill({
  children,
  accent,
}: React.PropsWithChildren<{ accent?: boolean }>) {
  return (
    <View
      className="rounded-full px-2 py-1"
      style={{
        backgroundColor: accent
          ? `${colors.primary.light}22`
          : 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: accent ? colors.primary.light : colors.cardBorder,
      }}
    >
      <Text
        className="text-[10px]"
        style={{ color: accent ? colors.primary.light : colors.text.secondary }}
      >
        {children}
      </Text>
    </View>
  );
}

/* -----------------------------
   Stats
----------------------------- */
function StatsSection({ data }: { data: Challenge[] }) {
  const joinedCount = data.length;
  const avgProgress = joinedCount
    ? Math.round(
        data.reduce((s, g) => s + g.weeklyProgressPct, 0) / joinedCount
      )
    : 0;
  const totalMembers = data.reduce((s, g) => s + g.members, 0);
  return (
    <GlassCard>
      <View className="flex-row items-center justify-between p-4">
        <Stat label="Challenges" value={`${joinedCount}`} />
        <Divider />
        <Stat label="Avg Progress" value={`${avgProgress}%`} />
        <Divider />
        <Stat label="Total Members" value={`${totalMembers}`} />
      </View>
    </GlassCard>
  );
}

function Divider() {
  return (
    <View
      className="mx-3 h-8 w-px"
      style={{ backgroundColor: colors.cardBorder }}
    />
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="items-center">
      <Text
        className="text-xl font-bold"
        style={{ color: colors.text.primary }}
      >
        {value}
      </Text>
      <Text className="text-xs" style={{ color: colors.text.secondary }}>
        {label}
      </Text>
    </View>
  );
}

/* -----------------------------
   Screen
----------------------------- */
export default function ChallengesScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<Challenge[]>(MY_CHALLENGES);
  const [joinVisible, setJoinVisible] = React.useState(false);
  const [createVisible, setCreateVisible] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
  }, []);

  const handleOpen = (id: string) => {
    router.push(`/groups/${id}`);
  };

  const handleInvite = async (code: string, title: string) => {
    try {
      await Clipboard.setStringAsync(code);
      Haptics.selectionAsync();
      await Share.share({
        message: `Join my challenge "${title}" — code: ${code}`,
      });
    } catch {}
  };

  const handleLeave = async (id: string) => {
    Haptics.selectionAsync();
    setData((prev) => prev.filter((c) => c.id !== id));
  };

  const onJoinWithCode = (code: string) => {
    setJoinVisible(false);
    const joined: Challenge = {
      id: `${Date.now()}`,
      title: `Joined via ${code}`,
      description: 'Welcome! Challenge imported via invite code.',
      members: 2,
      dailyTargetMinutes: 45,
      weeklyTargetMinutes: 300,
      weeklyProgressPct: 0,
      inviteCode: code,
      isMember: true,
      role: 'member',
      remindersToday: 0,
      minutesToday: 0,
    };
    setData((prev) => [joined, ...prev]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const sections = [{ title: 'My Challenges', data }];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.base.DEFAULT }}>
      <LinearGradient
        colors={[colors.base.DEFAULT, colors.base[900], '#0D1424']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', inset: 0 }}
      />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
          paddingTop: insets.top + 12,
          paddingHorizontal: 16,
        }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            tintColor={colors.text.secondary}
          />
        }
        ListHeaderComponent={
          <>
            <Text
              className="mb-2 text-3xl font-bold"
              style={{ color: colors.text.primary }}
            >
              Challenges
            </Text>
            <Text style={{ color: colors.text.secondary }}>
              Create or join <Text className="font-semibold">private</Text>{' '}
              challenges with friends
            </Text>
            <View style={{ height: 12 }} />
            <HeaderActions
              onCreate={() => setCreateVisible(true)}
              onJoin={() => setJoinVisible(true)}
            />
            <StatsSection data={data} />
          </>
        }
        renderSectionHeader={({ section }) => (
          <Text
            className="py-2 text-xl font-semibold"
            style={{ color: colors.text.primary }}
          >
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <ChallengeCard
            c={item}
            onOpen={() => handleOpen(item.id)}
            onLeave={() => handleLeave(item.id)}
            onInvite={() => handleInvite(item.inviteCode, item.title)}
          />
        )}
      />

      {/* Sheets */}
      <JoinCodeSheet
        visible={joinVisible}
        onClose={() => setJoinVisible(false)}
        onSubmit={onJoinWithCode}
      />
      <CreatePrivateChallengeSheet
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onCreate={(c) => setData((prev) => [c, ...prev])}
      />
    </SafeAreaView>
  );
}

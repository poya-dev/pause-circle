// ProfileScreen.tsx (clean spacing + no bleed)
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import * as React from 'react';
import { Image, Modal, Switch, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import colors from '@/components/ui/colors';

/* ---------------- tokens ---------------- */
const PAGE_PAD = 24;
const SECTION_GAP = 16;
const CARD_PAD = 16;
const RADIUS = 22;

/* ---------------- primitives ---------------- */
function Card({
  children,
  style,
  padding = CARD_PAD,
}: {
  children: React.ReactNode;
  style?: any;
  padding?: number;
}) {
  return (
    <View
      style={[
        {
          position: 'relative',
          borderRadius: RADIUS,
          backgroundColor: 'rgba(13,20,36,0.35)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
          padding,
        },
        style,
      ]}
    >
      {/* soft glass sheen; cannot intercept or overflow */}
      <LinearGradient
        colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        style={{ position: 'absolute', inset: 0 }}
      />
      {children}
    </View>
  );
}

function Row({
  label,
  description,
  right,
  onPress,
}: {
  label: string;
  description?: string;
  right?: React.ReactElement;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text className="font-medium" style={{ color: colors.text.primary }}>
          {label}
        </Text>
        {description ? (
          <Text className="text-xs" style={{ color: colors.text.secondary }}>
            {description}
          </Text>
        ) : null}
      </View>
      {right}
    </Pressable>
  );
}

function Hairline() {
  return (
    <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <View
      style={{
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(13,20,36,0.35)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 14,
        minWidth: 96,
      }}
    >
      <Text className="text-xs" style={{ color: colors.text.secondary }}>
        {label}
      </Text>
      <Text className="text-lg font-semibold" style={{ color: accent }}>
        {value}
      </Text>
    </View>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(13,20,36,0.35)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 999,
      }}
    >
      <Text className="text-xs" style={{ color: colors.text.primary }}>
        {label}
      </Text>
    </View>
  );
}

/* --------- small edit modal (unchanged behaviour) --------- */
function EditProfileSheet({
  visible,
  name,
  email,
  onClose,
  onSave,
}: {
  visible: boolean;
  name: string;
  email: string;
  onClose: () => void;
  onSave: (name: string, email: string) => void;
}) {
  const [n, setN] = React.useState(name);
  const [e, setE] = React.useState(email);
  React.useEffect(() => {
    setN(name);
    setE(email);
  }, [name, email, visible]);

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View
          style={{
            backgroundColor: '#0B1220',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 16,
            borderTopWidth: 1,
            borderColor: 'rgba(255,255,255,0.06)',
          }}
        >
          <View className="mb-2 h-1.5 w-12 self-center rounded-full bg-white/20" />
          <Text
            className="mb-3 text-center text-base font-semibold"
            style={{ color: colors.text.primary }}
          >
            Edit profile
          </Text>

          <Text
            className="mb-1 text-xs"
            style={{ color: colors.text.secondary }}
          >
            Name
          </Text>
          <TextInput
            value={n}
            onChangeText={setN}
            placeholder="Your name"
            placeholderTextColor={colors.text.muted}
            style={{
              borderWidth: 1,
              borderColor: colors.cardBorder,
              color: colors.text.primary,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 12,
            }}
          />
          <Text
            className="mb-1 text-xs"
            style={{ color: colors.text.secondary }}
          >
            Email
          </Text>
          <TextInput
            value={e}
            onChangeText={setE}
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor={colors.text.muted}
            style={{
              borderWidth: 1,
              borderColor: colors.cardBorder,
              color: colors.text.primary,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          />

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            <Pressable
              style={{
                flex: 1,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                paddingVertical: 12,
              }}
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
              style={{
                flex: 1,
                borderRadius: 12,
                backgroundColor: colors.primary.light,
                paddingVertical: 12,
              }}
              onPress={() => onSave(n.trim(), e.trim())}
            >
              <Text className="text-center font-semibold text-white">Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ---------------- main ---------------- */
export default function ProfileScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();

  // mock state
  const [name, setName] = React.useState('Alex Johnson');
  const [email, setEmail] = React.useState('alex@example.com');
  const [streak] = React.useState(12);
  const [thisWeekMinutes] = React.useState(540);
  const [sessionsThisWeek] = React.useState(18);

  const [appLock, setAppLock] = React.useState(false);
  const [osConnect, setOsConnect] = React.useState<
    'connected' | 'not_connected'
  >('not_connected');
  const [editOpen, setEditOpen] = React.useState(false);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.base.DEFAULT }}>
        <LinearGradient
          colors={[colors.base.DEFAULT, colors.base[900], '#0D1424']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', inset: 0 }}
        />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: insets.top + 8,
            paddingBottom: 48 + insets.bottom,
            paddingHorizontal: PAGE_PAD,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* header */}
          <View
            style={{
              marginBottom: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View>
              <Text
                className="text-3xl font-bold"
                style={{ color: colors.text.primary }}
              >
                Profile
              </Text>
              <Text style={{ color: colors.text.secondary }}>
                Your account & progress
              </Text>
            </View>
            <Pressable
              style={{
                borderRadius: 12,
                padding: 8,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                backgroundColor: 'rgba(255,255,255,0.06)',
              }}
              onPress={() => console.log('Navigate to Settings')}
            >
              <Ionicons
                name="settings-outline"
                size={18}
                color={colors.text.secondary}
              />
            </Pressable>
          </View>

          {/* vertical stack with global gap — no per-card margins */}
          <View style={{ gap: SECTION_GAP }}>
            {/* identity */}
            <Card>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    overflow: 'hidden',
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.cardBorder,
                  }}
                >
                  <Image
                    source={{
                      uri: `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(
                        name || 'User'
                      )}&backgroundType=gradientLinear`,
                    }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    className="text-xl font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    {name}
                  </Text>
                  <Text
                    className="text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    {email}
                  </Text>
                </View>
                <Pressable
                  style={{
                    borderRadius: 12,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.cardBorder,
                  }}
                  onPress={() => setEditOpen(true)}
                >
                  <Text style={{ color: colors.text.primary }}>Edit</Text>
                </Pressable>
              </View>

              <View
                style={{
                  marginTop: 12,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Stat label="Streak" value={streak} accent={colors.success} />
                <Stat
                  label="This week"
                  value={`${Math.floor(thisWeekMinutes / 60)}h ${thisWeekMinutes % 60}m`}
                  accent={colors.primary.light}
                />
                <Stat
                  label="Sessions"
                  value={sessionsThisWeek}
                  accent={'#3FCF8E'}
                />
              </View>
            </Card>

            {/* achievements */}
            <Card>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  className="text-lg font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  Achievements
                </Text>
                <Pressable
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 10,
                    backgroundColor: 'rgba(255,255,255,0.10)',
                  }}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{ color: colors.primary.light }}
                  >
                    See all
                  </Text>
                </Pressable>
              </View>
              <View
                style={{
                  marginTop: 10,
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <Badge label="7-day streak" />
                <Badge label="1000m focus" />
                <Badge label="Night owl" />
                <Badge label="Distraction slayer" />
              </View>
            </Card>

            {/* account & privacy */}
            <Card>
              <Text
                className="mb-6 text-lg font-semibold"
                style={{ color: colors.text.primary }}
              >
                Account & privacy
              </Text>

              <Row
                label="App Lock"
                description="Require Face ID / biometrics to open the app"
                right={<Switch value={appLock} onValueChange={setAppLock} />}
              />
              <Hairline />
              <Row
                label="Connect to device report"
                description={
                  osConnect === 'connected'
                    ? 'Connected to Screen Time / Digital Wellbeing'
                    : 'Import OS-level usage for better accuracy'
                }
                right={
                  <Pressable
                    style={{
                      borderRadius: 12,
                      paddingVertical: 8,
                      paddingHorizontal: 14,
                      backgroundColor:
                        osConnect === 'connected'
                          ? 'rgba(46,212,138,0.16)'
                          : colors.card,
                      borderWidth: 1,
                      borderColor:
                        osConnect === 'connected'
                          ? 'rgba(46,212,138,0.45)'
                          : colors.cardBorder,
                    }}
                    onPress={() =>
                      setOsConnect((s) =>
                        s === 'connected' ? 'not_connected' : 'connected'
                      )
                    }
                  >
                    <Text
                      style={{
                        color:
                          osConnect === 'connected'
                            ? '#2ED48A'
                            : colors.text.primary,
                      }}
                    >
                      {osConnect === 'connected' ? 'Connected' : 'Connect'}
                    </Text>
                  </Pressable>
                }
              />
              <Hairline />
              <Row
                label="Manage settings"
                description="Notifications, quiet hours, limits"
                right={
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.text.muted}
                  />
                }
                onPress={() => console.log('Navigate to Settings')}
              />
            </Card>

            {/* data & support */}
            <Card>
              <Text
                className="mb-6 text-lg font-semibold"
                style={{ color: colors.text.primary }}
              >
                Data & support
              </Text>

              <Row
                label="Export data"
                description="Download your usage and focus history"
                right={
                  <Pressable
                    style={{
                      borderRadius: 12,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      backgroundColor: colors.card,
                      borderWidth: 1,
                      borderColor: colors.cardBorder,
                    }}
                    onPress={() => console.log('Export')}
                  >
                    <Text style={{ color: colors.text.primary }}>Export</Text>
                  </Pressable>
                }
              />
              <Hairline />
              <Row
                label="Help & feedback"
                description="Get help or send us your ideas"
                right={
                  <Ionicons
                    name="open-outline"
                    size={16}
                    color={colors.text.muted}
                  />
                }
                onPress={() => console.log('Help')}
              />
              <Hairline />
              <Row
                label="Sign out"
                right={
                  <Pressable
                    style={{
                      borderRadius: 12,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      backgroundColor: 'rgba(255,77,79,0.18)',
                      borderWidth: 1,
                      borderColor: 'rgba(255,77,79,0.40)',
                    }}
                    onPress={() => console.log('Sign out')}
                  >
                    <Text style={{ color: '#FF4D4F' }}>Sign out</Text>
                  </Pressable>
                }
              />
              <Text
                className="mt-6 text-xs"
                style={{ color: colors.text.muted }}
              >
                App v1.0.0 · Build 100
              </Text>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>

      <EditProfileSheet
        visible={editOpen}
        name={name}
        email={email}
        onClose={() => setEditOpen(false)}
        onSave={(n, e) => {
          setName(n || name);
          setEmail(e || email);
          setEditOpen(false);
        }}
      />
    </>
  );
}

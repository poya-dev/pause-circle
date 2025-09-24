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

/* ───────────────── tokens ───────────────── */
const PAGE_PAD = 20;
const SECTION_GAP = 16;
const CARD_PAD = 16;
const RADIUS = 22;

/* ───────────────── primitives ───────────────── */
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
  disabled,
}: {
  label: string;
  description?: string;
  right?: React.ReactElement;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text className="font-medium" style={{ color: colors.text.primary }}>
          {label}
        </Text>
        {description ? (
          <Text
            className="text-xs"
            style={{ color: colors.text.secondary, marginTop: 2 }}
          >
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

function TierBadge({ tier }: { tier: 'FREE' | 'PRO' }) {
  const isPro = tier === 'PRO';
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: isPro
          ? 'rgba(46,212,138,0.16)'
          : 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: isPro ? 'rgba(46,212,138,0.45)' : 'rgba(255,255,255,0.12)',
      }}
    >
      <Text
        style={{
          color: isPro ? '#2ED48A' : '#AEB7C5',
          fontSize: 12,
          fontWeight: '800',
        }}
      >
        {tier}
      </Text>
    </View>
  );
}

function LockChip() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
      }}
    >
      <Ionicons
        name="lock-closed-outline"
        size={14}
        color={colors.text.muted}
      />
      <Text
        style={{
          color: colors.text.secondary,
          fontSize: 12,
          fontWeight: '700',
        }}
      >
        Pro
      </Text>
    </View>
  );
}

function FeatureTag({ label }: { label: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: colors.cardBorder,
      }}
    >
      <Ionicons name="checkmark" size={12} color="#2ED48A" />
      <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
        {label}
      </Text>
    </View>
  );
}

/* ───────────────── paywall (full-height bottom sheet) ───────────────── */
function ProSheet({
  visible,
  onClose,
  onPurchase,
  onRestore,
}: {
  visible: boolean;
  onClose: () => void;
  onPurchase: (plan: 'monthly' | 'yearly') => void;
  onRestore: () => void;
}) {
  const [plan, setPlan] = React.useState<'monthly' | 'yearly'>('yearly');
  const accent = colors.primary.light;

  const PlanCard = ({
    kind,
    price,
    note,
    best,
  }: {
    kind: 'monthly' | 'yearly';
    price: string;
    note?: string;
    best?: boolean;
  }) => {
    const active = plan === kind;
    return (
      <Pressable
        onPress={() => setPlan(kind)}
        style={{
          flex: 1,
          borderRadius: 16,
          padding: 14,
          borderWidth: 1.2,
          borderColor: active ? accent : 'rgba(255,255,255,0.12)',
          backgroundColor: active
            ? 'rgba(38,209,226,0.16)'
            : 'rgba(255,255,255,0.04)',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '800' }}>
            {kind === 'yearly' ? 'Yearly' : 'Monthly'}
          </Text>
          {best ? (
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: accent,
              }}
            >
              <Text
                style={{ color: '#0B1220', fontSize: 11, fontWeight: '800' }}
              >
                BEST VALUE
              </Text>
            </View>
          ) : null}
        </View>
        <Text
          style={{
            color: '#fff',
            fontSize: 20,
            fontWeight: '800',
            marginTop: 8,
          }}
        >
          {price}
        </Text>
        {note ? (
          <Text style={{ color: '#AEB7C5', fontSize: 12, marginTop: 2 }}>
            {note}
          </Text>
        ) : null}
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
      >
        <View
          style={{
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            overflow: 'hidden',
            backgroundColor: '#0B1220',
            borderTopWidth: 1,
            borderColor: 'rgba(255,255,255,0.06)',
            maxHeight: 720,
          }}
        >
          {/* Hero */}
          <LinearGradient
            colors={[`${accent}33`, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 20, paddingBottom: 0 }}
          >
            <View style={{ alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: `${accent}26`,
                  borderWidth: 1,
                  borderColor: `${accent}44`,
                }}
              >
                <Ionicons name="sparkles-outline" size={28} color={accent} />
              </View>
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>
                Pause Pro
              </Text>
              <Text
                style={{
                  color: '#AEB7C5',
                  textAlign: 'center',
                  marginHorizontal: 10,
                }}
              >
                More control. More insight. Less distraction.
              </Text>
            </View>
          </LinearGradient>

          <ScrollView
            style={{ maxHeight: 560 }}
            contentContainerStyle={{ padding: 20, gap: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Plans */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <PlanCard
                kind="yearly"
                price="$39.99 / year"
                note="7-day free trial • Save 33%"
                best
              />
              <PlanCard kind="monthly" price="$4.99 / month" />
            </View>

            {/* Benefits */}
            <Card padding={14}>
              <Text
                className="font-semibold"
                style={{ color: colors.text.primary, marginBottom: 8 }}
              >
                What you get
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {[
                  'Unlimited private groups',
                  'Member progress insights',
                  'Custom ranges & CSV export',
                  'OS Screen Time sync',
                  'Priority support',
                ].map((f) => (
                  <FeatureTag key={f} label={f} />
                ))}
              </View>
            </Card>

            {/* Social proof */}
            <Card padding={14}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 6,
                }}
              >
                <Ionicons name="star" size={16} color="#FFC86C" />
                <Text style={{ color: '#FFC86C', fontWeight: '700' }}>
                  Loved by focused people
                </Text>
              </View>
              <Text style={{ color: colors.text.secondary }}>
                “The group insights finally helped our team stick to limits.”
              </Text>
            </Card>

            {/* CTA */}
            <Pressable
              onPress={() => onPurchase(plan)}
              style={{
                marginTop: 4,
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
                backgroundColor: accent,
              }}
            >
              <Text style={{ color: '#0B1220', fontWeight: '800' }}>
                Start Free Trial
              </Text>
            </Pressable>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Pressable onPress={onRestore}>
                <Text style={{ color: '#AEB7C5' }}>Restore purchases</Text>
              </Pressable>
              <Pressable onPress={onClose}>
                <Text style={{ color: '#AEB7C5' }}>Maybe later</Text>
              </Pressable>
            </View>

            <Text style={{ color: '#6C7A93', fontSize: 11, marginTop: 6 }}>
              Trial converts automatically unless cancelled. By continuing you
              agree to our Terms & Privacy Policy.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ───────────────── small edit sheet ───────────────── */
function EditSheet({
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

/* ───────────────── screen ───────────────── */
export default function ProfileScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();

  // mock user + premium state
  const [name, setName] = React.useState('Alex Johnson');
  const [email, setEmail] = React.useState('alex@example.com');
  const [isPro, setIsPro] = React.useState(false);

  const [appLock, setAppLock] = React.useState(false);
  const [osConnect, setOsConnect] = React.useState<
    'connected' | 'not_connected'
  >('not_connected');

  const [editOpen, setEditOpen] = React.useState(false);
  const [paywallOpen, setPaywallOpen] = React.useState(false);

  const openPaywall = () => setPaywallOpen(true);

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
            gap: SECTION_GAP,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Identity */}
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
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <Text
                    className="text-xl font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    {name}
                  </Text>
                  <TierBadge tier={isPro ? 'PRO' : 'FREE'} />
                </View>
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
          </Card>

          {/* Upsell (only on Free) */}
          {!isPro && (
            <Card padding={14}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    className="font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    Go Pro for more control
                  </Text>
                  <Text
                    className="text-xs"
                    style={{ color: colors.text.secondary, marginTop: 6 }}
                  >
                    Unlimited private groups, member insights, custom ranges &
                    exports, and OS-level sync.
                  </Text>

                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 8,
                      marginTop: 10,
                    }}
                  >
                    <FeatureTag label="Unlimited groups" />
                    <FeatureTag label="Member insights" />
                    <FeatureTag label="OS sync" />
                  </View>
                </View>

                <Pressable
                  onPress={openPaywall}
                  style={{
                    borderRadius: 12,
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    backgroundColor: colors.primary.light,
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '800' }}>
                    Upgrade
                  </Text>
                </Pressable>
              </View>
            </Card>
          )}

          {/* Account & privacy */}
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

            {isPro ? (
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
            ) : (
              <Row
                label="Connect to device report"
                description="Pro required"
                right={<LockChip />}
                onPress={openPaywall}
              />
            )}
          </Card>

          {/* Data & support */}
          <Card>
            <Text
              className="mb-6 text-lg font-semibold"
              style={{ color: colors.text.primary }}
            >
              Data & support
            </Text>

            {isPro ? (
              <Row
                label="Export data"
                description="Download your usage and focus history (CSV)"
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
            ) : (
              <Row
                label="Export data"
                description="Pro required"
                right={<LockChip />}
                onPress={openPaywall}
              />
            )}

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
            <Text className="mt-6 text-xs" style={{ color: colors.text.muted }}>
              App v1.0.0 · Build 100
            </Text>
          </Card>
        </ScrollView>
      </SafeAreaView>

      {/* Sheets */}
      <EditSheet
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

      <ProSheet
        visible={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onPurchase={(plan) => {
          // mock purchase success
          setIsPro(true);
          setPaywallOpen(false);
        }}
        onRestore={() => console.log('restore')}
      />
    </>
  );
}

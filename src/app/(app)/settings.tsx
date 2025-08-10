import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { Pressable as RNPressable } from 'react-native';

import { Pressable, ScrollView, Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';

const Card = ({ children, className, style }: any) => (
  <BlurView tint="dark" intensity={28} style={{ borderRadius: 24 }}>
    <View
      className={className}
      style={[
        {
          backgroundColor: 'rgba(13,20,36,0.35)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.06)',
          borderRadius: 24,
        },
        style,
      ]}
    >
      {children}
    </View>
  </BlurView>
);

const Row = ({
  label,
  description,
  right,
}: {
  label: string;
  description?: string;
  right?: React.ReactElement;
}) => (
  <View
    className="py-3"
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <View style={{ flex: 1, paddingRight: 12 }}>
      <Text className="font-medium" style={{ color: colors.text.primary }}>
        {label}
      </Text>
      {!!description && (
        <Text className="text-xs" style={{ color: colors.text.secondary }}>
          {description}
        </Text>
      )}
    </View>
    {right}
  </View>
);

const Divider = () => (
  <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
);

export default function SettingsScreen() {
  const params = useLocalSearchParams<{ section?: string }>();

  React.useEffect(() => {
    // in real app: scroll to params.section
  }, [params.section]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.base.DEFAULT }}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerLeft: () => (
            <RNPressable
              onPress={() => router.back()}
              style={{ paddingHorizontal: 16 }}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={colors.text.primary}
              />
            </RNPressable>
          ),
        }}
      />

      <LinearGradient
        colors={[colors.base.DEFAULT, colors.base[900], '#0D1424']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', inset: 0 }}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: 80,
          paddingHorizontal: 16,
          paddingBottom: 96,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          className="mb-3 text-3xl font-bold"
          style={{ color: colors.text.primary }}
        >
          Settings
        </Text>

        {/* Notifications */}
        <Card className="mt-4 rounded-3xl p-5">
          <Text
            className="mb-3 text-lg font-semibold"
            style={{ color: colors.text.primary }}
          >
            Notifications & feedback
          </Text>
          <Row label="Session start/finish" right={<Toggle />} />
          <Divider />
          <Row label="Daily goal reminder" right={<Toggle />} />
          <Divider />
          <Row label="Weekly recap" right={<Toggle />} />
          <Divider />
          <Row label="Nudges" description="Light" right={<Chevron />} />
        </Card>

        {/* Quiet Hours full */}
        <Card className="mt-4 rounded-3xl p-5">
          <Text
            className="mb-3 text-lg font-semibold"
            style={{ color: colors.text.primary }}
          >
            Quiet hours
          </Text>
          <Row label="Enabled" right={<Toggle />} />
          <Divider />
          <Row
            label="Schedule"
            description="Weekdays 22:00–06:00"
            right={<Chevron />}
          />
          <Divider />
          <Row label="Weekend variant" description="Off" right={<Chevron />} />
        </Card>

        {/* Limits & Blocking */}
        <Card className="mt-4 rounded-3xl p-5" nativeID="limits">
          <Text
            className="mb-3 text-lg font-semibold"
            style={{ color: colors.text.primary }}
          >
            App limits & blocking
          </Text>
          <Row
            label="Active rules"
            description="Instagram • 30m / day"
            right={<Chevron />}
          />
          <Divider />
          <Row
            label="Blocked apps (soft block)"
            description="Reflection overlay + snooze"
            right={<Chevron />}
          />
          <Divider />
          <Row
            label="Allow during Focus"
            description="Slack, Notion"
            right={<Chevron />}
          />
        </Card>

        {/* Connections */}
        <Card className="mt-4 rounded-3xl p-5">
          <Text
            className="mb-3 text-lg font-semibold"
            style={{ color: colors.text.primary }}
          >
            Connections
          </Text>
          <Row
            label="iOS Screen Time / Android Digital Wellbeing"
            description="Action needed"
            right={<ConnectBtn />}
          />
          <Divider />
          <Row
            label="Calendar"
            description="Connected"
            right={<ConnectedChip />}
          />
        </Card>

        {/* Privacy & Security */}
        <Card className="mt-4 rounded-3xl p-5">
          <Text
            className="mb-3 text-lg font-semibold"
            style={{ color: colors.text.primary }}
          >
            Privacy & security
          </Text>
          <Row label="App Lock (Face ID / PIN)" right={<Chevron />} />
          <Divider />
          <Row label="Export data" right={<CTA label="Export" />} />
          <Divider />
          <Row
            label="Delete account & data"
            right={<CTA label="Delete" danger />}
          />
        </Card>

        {/* Support */}
        <Card className="mt-4 rounded-3xl p-5">
          <Text
            className="mb-3 text-lg font-semibold"
            style={{ color: colors.text.primary }}
          >
            Support & about
          </Text>
          <Row label="Help center" right={<Chevron />} />
          <Divider />
          <Row label="Contact support" right={<Chevron />} />
          <Divider />
          <Row label="Version" description="1.0.0 (100)" />
        </Card>
      </ScrollView>
    </View>
  );
}

function Toggle() {
  const [on, setOn] = React.useState(true);
  return (
    <Pressable onPress={() => setOn((v) => !v)}>
      <Ionicons
        name={on ? 'checkmark-circle' : 'ellipse-outline'}
        size={20}
        color={on ? colors.primary.light : colors.text.secondary}
      />
    </Pressable>
  );
}
function Chevron() {
  return (
    <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
  );
}
function ConnectBtn() {
  return (
    <Pressable
      className="rounded-xl px-3 py-2"
      style={{
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.cardBorder,
      }}
      onPress={() => console.log('connect')}
    >
      <Text style={{ color: colors.text.primary }}>Connect</Text>
    </Pressable>
  );
}
function ConnectedChip() {
  return (
    <View
      className="rounded-full px-3 py-1"
      style={{
        backgroundColor: 'rgba(63,207,142,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(63,207,142,0.4)',
      }}
    >
      <Text className="text-xs" style={{ color: '#3FCF8E' }}>
        Connected
      </Text>
    </View>
  );
}
function CTA({ label, danger }: { label: string; danger?: boolean }) {
  return (
    <Pressable
      className="rounded-xl px-3 py-2"
      style={{
        backgroundColor: danger ? 'rgba(255, 77, 79, 0.18)' : colors.card,
        borderWidth: 1,
        borderColor: danger ? 'rgba(255, 77, 79, 0.4)' : colors.cardBorder,
      }}
      onPress={() => console.log(label)}
    >
      <Text style={{ color: danger ? '#FF4D4F' : colors.text.primary }}>
        {label}
      </Text>
    </Pressable>
  );
}

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Rect } from 'react-native-svg';

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import colors from '@/components/ui/colors';

/* --- tiny brand mark --- */
function BrandMark() {
  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={52} height={52}>
        <Circle cx={26} cy={26} r={26} fill="rgba(255,255,255,0.06)" />
        <Rect x={18} y={14} width={6} height={24} rx={3} fill="#A8B3CF" />
        <Rect x={28} y={14} width={6} height={24} rx={3} fill="#A8B3CF" />
      </Svg>
      <Text
        className="mt-2 text-xl font-semibold"
        style={{ color: colors.text.primary }}
      >
        Pause
      </Text>
    </View>
  );
}

function SocialButton({
  icon, // 'logo-apple' | 'logo-google'
  label,
  onPress,
}: {
  icon: 'logo-apple' | 'logo-google';
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={{ borderRadius: 14 }}>
      <View
        style={{
          height: 48,
          borderRadius: 12,
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.12)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Keep label perfectly centered */}
        <Text
          style={{
            color: '#fff',
            fontWeight: '600',
            fontSize: 14,
            // letterSpacing: 0.2,
          }}
        >
          {label}
        </Text>

        {/* Icon pinned left – does not affect label centering */}
        <View
          style={{
            position: 'absolute',
            left: 14,
            width: 20,
            height: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={icon} size={18} color="#fff" />
        </View>
      </View>
    </Pressable>
  );
}

function GlassInput({
  icon,
  ...rest
}: React.ComponentProps<typeof TextInput> & { icon: any }) {
  return (
    <View
      className="rounded-xl"
      style={{
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.10)',
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Ionicons name={icon} size={15} color={colors.text.muted} />
      <TextInput
        placeholderTextColor={colors.text.muted}
        style={{
          color: colors.text.primary,
          paddingVertical: 4,
          marginLeft: 8,
          flex: 1,
        }}
        {...rest}
      />
    </View>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 16 }}
    >
      <View
        style={{
          flex: 1,
          height: 1,
          backgroundColor: 'rgba(255,255,255,0.10)',
        }}
      />
      <Text
        style={{ color: colors.text.muted, marginHorizontal: 10, fontSize: 12 }}
      >
        {label}
      </Text>
      <View
        style={{
          flex: 1,
          height: 1,
          backgroundColor: 'rgba(255,255,255,0.10)',
        }}
      />
    </View>
  );
}

export default function AuthLanding(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [hide, setHide] = React.useState(true);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.base.DEFAULT }}>
      <LinearGradient
        colors={[colors.base.DEFAULT, colors.base[900], '#0D1424']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', inset: 0 }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: insets.top + 24,
            paddingBottom: 32,
            paddingHorizontal: 22,
          }}
        >
          {/* Top logo */}
          <BrandMark />

          {/* Socials */}
          <View style={{ marginTop: 22, gap: 10 }}>
            <SocialButton
              icon="logo-apple"
              label="Continue with Apple"
              onPress={() => {}}
            />

            <SocialButton
              icon="logo-google"
              label="Continue with Google"
              onPress={() => {}}
            />
          </View>

          <Divider label="Or sign in with email" />

          {/* Email sign-in (compact) */}
          <View style={{ gap: 12 }}>
            <GlassInput
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
            />
            <View style={{ position: 'relative' }}>
              <GlassInput
                icon="lock-closed-outline"
                value={pw}
                onChangeText={setPw}
                placeholder="Password"
                secureTextEntry={hide}
                textContentType="password"
              />
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  right: 12,
                  top: 0,
                  bottom: 0,
                  justifyContent: 'center',
                }}
                onPress={() => setHide((s) => !s)}
              >
                <Ionicons
                  name={hide ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color={colors.text.muted}
                />
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Pressable onPress={() => {}}>
                <Text style={{ color: colors.primary.light }}>
                  Forgot password?
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => {
                router.push('/(app)/(tabs)/home');
              }}
              className="rounded-xl"
              style={{
                backgroundColor: colors.primary.light,
                paddingVertical: 14,
              }}
            >
              <Text className="text-center font-semibold text-white">
                Login
              </Text>
            </Pressable>

            <Text
              style={{
                textAlign: 'center',
                color: colors.text.secondary,
                marginTop: 12,
              }}
            >
              Don’t have an account?{' '}
              <Text
                style={{ color: colors.primary.light }}
                onPress={() => router.push('/(auth)/sign-up-email')}
              >
                Sign up
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

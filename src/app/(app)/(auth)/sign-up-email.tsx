import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import colors from '@/components/ui/colors';

function BrandMarkSm() {
  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={36} height={36}>
        <Circle cx={18} cy={18} r={18} fill="rgba(255,255,255,0.06)" />
        <Rect x={12} y={9} width={4} height={18} rx={2} fill="#A8B3CF" />
        <Rect x={20} y={9} width={4} height={18} rx={2} fill="#A8B3CF" />
      </Svg>
    </View>
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

export default function Signup(): React.ReactElement {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [pw2, setPw2] = React.useState('');
  const [hide1, setHide1] = React.useState(true);
  const [hide2, setHide2] = React.useState(true);

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
            paddingHorizontal: 22,
            paddingTop: 12,
            paddingBottom: 28,
          }}
        >
          <View className="mb-10">
            <BrandMarkSm />
          </View>
          <View style={{ gap: 12, marginTop: 16 }}>
            <GlassInput
              icon="person-outline"
              value={name}
              onChangeText={setName}
              placeholder="Name"
              autoCapitalize="words"
            />
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
                secureTextEntry={hide1}
                textContentType="newPassword"
              />
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  right: 12,
                  top: 0,
                  bottom: 0,
                  justifyContent: 'center',
                }}
                onPress={() => setHide1((s) => !s)}
              >
                <Ionicons
                  name={hide1 ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color={colors.text.muted}
                />
              </TouchableOpacity>
            </View>

            <View style={{ position: 'relative' }}>
              <GlassInput
                icon="lock-closed-outline"
                value={pw2}
                onChangeText={setPw2}
                placeholder="Confirm password"
                secureTextEntry={hide2}
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
                onPress={() => setHide2((s) => !s)}
              >
                <Ionicons
                  name={hide2 ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color={colors.text.muted}
                />
              </TouchableOpacity>
            </View>

            <Pressable
              className="rounded-xl"
              style={{
                backgroundColor: colors.primary.light,
                paddingVertical: 14,
                marginTop: 6,
              }}
              onPress={() => {}}
            >
              <Text className="text-center font-semibold text-white">
                Create account
              </Text>
            </Pressable>

            <Text
              style={{
                textAlign: 'center',
                color: colors.text.secondary,
                marginTop: 10,
              }}
            >
              Already have an account?{' '}
              <Text style={{ color: colors.primary.light }} onPress={() => {}}>
                Sign in
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Alert } from 'react-native';
import * as z from 'zod';

import { Button, SafeAreaView, Text, View } from '@/components/ui';
import { FormInput } from '@/components/ui/form-input';
import { supabase } from '@/lib/supabase';

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(1, 'Please enter your name'),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupScreen() {
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            display_name: data.displayName,
          },
        },
      });

      if (error) throw error;

      router.replace('/home');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="mt-16 items-center">
          <View className="mb-10 size-[160px] items-center justify-center rounded-3xl bg-blue-50">
            <Ionicons name="person-add-outline" size={80} color="#2563EB" />
          </View>
          <Text className="mb-3 text-center text-[32px] font-bold text-neutral-900">
            Create Account
          </Text>
          <Text className="mb-8 text-center text-xl leading-relaxed text-neutral-600">
            Join Unscroll to start your digital wellbeing journey
          </Text>
        </View>

        {/* Form */}
        <View className="space-y-6">
          <FormInput
            control={control}
            name="displayName"
            placeholder="Enter your name"
          />
          {errors.displayName && (
            <Text className="text-red-500">{errors.displayName.message}</Text>
          )}

          <FormInput
            control={control}
            name="email"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && (
            <Text className="text-red-500">{errors.email.message}</Text>
          )}

          <FormInput
            control={control}
            name="password"
            placeholder="Enter your password"
            secureTextEntry
          />
          {errors.password && (
            <Text className="text-red-500">{errors.password.message}</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View className="mt-auto space-y-5 pb-8">
          <Button
            onPress={handleSubmit(onSubmit)}
            className="h-[52px] rounded-xl bg-blue-600"
            variant="default"
            size="lg"
            loading={isSubmitting}
          >
            <Text className="text-lg font-medium text-white">Sign Up</Text>
          </Button>

          <Link href="/login" asChild>
            <Button
              className="h-[52px] rounded-xl border-2 border-neutral-200"
              variant="ghost"
              size="lg"
            >
              <Text className="text-lg font-medium text-neutral-900">
                Already have an account?
              </Text>
            </Button>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

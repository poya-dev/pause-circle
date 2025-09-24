import { Stack } from 'expo-router';
import * as React from 'react';

export default function BlockLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}

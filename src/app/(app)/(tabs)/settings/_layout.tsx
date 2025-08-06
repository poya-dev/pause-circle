import { Stack } from 'expo-router';
import * as React from 'react';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Settings',
          headerShown: true,
        }}
      />
    </Stack>
  );
}

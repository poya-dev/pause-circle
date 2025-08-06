import { Stack } from 'expo-router';
import * as React from 'react';

export default function ChallengesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Challenges',
          headerTitleStyle: {
            fontFamily: 'Inter',
            fontSize: 24,
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name="[id]/index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create-challenge"
        options={{
          title: 'Create Challenge',
          presentation: 'modal',
          headerTitleStyle: {
            fontFamily: 'Inter',
            fontSize: 20,
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name="join-challenge"
        options={{
          title: 'Join Challenge',
          presentation: 'modal',
          headerTitleStyle: {
            fontFamily: 'Inter',
            fontSize: 20,
            fontWeight: 'bold',
          },
        }}
      />
    </Stack>
  );
}

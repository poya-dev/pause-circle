import { Stack } from 'expo-router';
import * as React from 'react';

export default function ProfileLayout(): React.ReactElement {
  return <Stack screenOptions={{ headerShown: false }} />;
}

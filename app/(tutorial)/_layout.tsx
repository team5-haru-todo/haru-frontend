import { Stack } from 'expo-router';

export default function TutorialLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
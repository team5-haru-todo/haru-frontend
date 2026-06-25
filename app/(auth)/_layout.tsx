import { Stack } from 'expo-router';
import { TermsProvider } from '../../src/context/TermsContext';

export default function AuthLayout() {
  return (
    <TermsProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </TermsProvider>
  );
}
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Redirect } from 'expo-router';
import { getMe } from '@/src/api/user';
import { useUserStore } from '@/src/store/userStore';

export default function Index() {
  const [checking, setChecking] = useState(true);
  const [destination, setDestination] = useState<string | null>(null);
  const fetchUser = useUserStore((state) => state.fetchUser);

  useEffect(() => {
    (async () => {
      try {
        // 웹은 SecureStore 미지원이라 자동 로그인 대상에서 제외, 항상 로그인 화면부터 시작
        const token = Platform.OS === 'web' ? null : await SecureStore.getItemAsync('authToken');

        if (!token) {
          setDestination('/(auth)/login');
          return;
        }

        const me = await getMe();
        await fetchUser();
        setDestination(me.hasSeenOnboarding ? '/(tabs)' : '/(tutorial)');
      } catch {
        // 401이면 client.ts 인터셉터가 이미 토큰 삭제 + 로그인 이동 처리함.
        // 여기서는 화면 전환 대상만 로그인으로 맞춰둠(안전망)
        setDestination('/(auth)/login');
      } finally {
        setChecking(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking || !destination) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href={destination as any} />;
}
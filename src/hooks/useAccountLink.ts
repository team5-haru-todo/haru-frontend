import { useState } from 'react';
import { Platform, Alert } from 'react-native';
import { login as kakaoLogin } from '@react-native-seoul/kakao-login';
import * as AppleAuthentication from 'expo-apple-authentication';

import { linkKakao, linkApple } from '@/src/api/auth';
import type { UserResponse } from '@/src/api/user';

// 게스트(또는 이미 로그인된) 유저의 현재 계정에 카카오/Apple 계정을 연동한다.
// 새 계정을 만들지 않고 기존 계정에 로그인 수단만 추가되므로,
// 지금까지의 기록(할일/스트릭/설정 등)이 그대로 유지된다.
//
// 사용 예시 (퍼블 담당자가 UI에 연결할 때):
//   const { linkingProvider, isKakaoLinked, isAppleLinked, handleLinkKakao, handleLinkApple } =
//     useAccountLink(user, refetchUser);
//
//   <TouchableOpacity onPress={handleLinkKakao} disabled={isKakaoLinked || linkingProvider !== null}>
//     <Text>{isKakaoLinked ? '카카오 계정 연동됨' : '카카오 계정 연동하기'}</Text>
//   </TouchableOpacity>

export function useAccountLink(user: UserResponse | null, onLinked: () => void | Promise<void>) {
  const [linkingProvider, setLinkingProvider] = useState<'kakao' | 'apple' | null>(null);

  const connectedProvidersUpper = (user?.connectedProviders ?? []).map((p) => p.toUpperCase());
  const isKakaoLinked = connectedProvidersUpper.includes('KAKAO');
  const isAppleLinked = connectedProvidersUpper.includes('APPLE');

  const handleLinkKakao = async () => {
    if (linkingProvider || isKakaoLinked) return;
    setLinkingProvider('kakao');
    try {
      const kakaoToken = await kakaoLogin();
      await linkKakao({ accessToken: kakaoToken.accessToken });
      await onLinked();
      Alert.alert('연동 완료', '카카오 계정이 연동되었어요.');
    } catch (error) {
      console.error('카카오 계정 연동 실패:', error);
      Alert.alert('연동 실패', '카카오 계정 연동에 실패했어요. 다시 시도해 주세요.');
    } finally {
      setLinkingProvider(null);
    }
  };

  const handleLinkApple = async () => {
    if (linkingProvider || isAppleLinked) return;
    setLinkingProvider('apple');
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        throw new Error('Apple identityToken을 받지 못했습니다.');
      }
      await linkApple({ identityToken: credential.identityToken });
      await onLinked();
      Alert.alert('연동 완료', 'Apple 계정이 연동되었어요.');
    } catch (error: any) {
      if (error?.code === 'ERR_REQUEST_CANCELED') {
        // 사용자가 직접 취소한 경우 - 에러 처리 불필요
      } else {
        console.error('Apple 계정 연동 실패:', error);
        Alert.alert('연동 실패', 'Apple 계정 연동에 실패했어요. 다시 시도해 주세요.');
      }
    } finally {
      setLinkingProvider(null);
    }
  };

  return {
    linkingProvider,
    isKakaoLinked,
    isAppleLinked,
    isAppleAvailable: Platform.OS === 'ios',
    handleLinkKakao,
    handleLinkApple,
  };
}

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { apiClient } from './client';

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    nickname: string;
    status: string;
    connectedProviders: string[];
  };
}

export interface KakaoLoginRequest {
  accessToken: string;
  termsVersion: string;
  agreedAt: string;
}

export interface AppleLoginRequest {
  identityToken: string;
  termsVersion: string;
  agreedAt: string;
}

export interface LinkKakaoRequest {
  accessToken: string;
}

export interface LinkAppleRequest {
  identityToken: string;
}

export async function loginAsGuest(): Promise<LoginResponse> {
  const response = await apiClient.post('/api/auth/guest');
  return response.data.data;
}

export async function loginWithKakao(request: KakaoLoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post('/api/auth/kakao', request);
  return response.data.data;
}

export async function loginWithApple(request: AppleLoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post('/api/auth/apple', request);
  return response.data.data;
}

// 게스트(또는 이미 로그인된 유저)의 계정에 카카오 계정을 연동한다.
// 새 계정을 만들지 않고 기존 계정에 로그인 수단만 추가되므로, 지금까지의 기록이 그대로 유지된다.
export async function linkKakao(request: LinkKakaoRequest): Promise<LoginResponse> {
  const response = await apiClient.post('/api/auth/link/kakao', request);
  return response.data.data;
}

// 게스트(또는 이미 로그인된 유저)의 계정에 Apple 계정을 연동한다.
export async function linkApple(request: LinkAppleRequest): Promise<LoginResponse> {
  const response = await apiClient.post('/api/auth/link/apple', request);
  return response.data.data;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/api/auth/logout');
  } finally {
    // 서버 요청 성공/실패와 무관하게 로컬 토큰은 항상 제거
    if (Platform.OS !== 'web') {
      await SecureStore.deleteItemAsync('authToken');
    }
    router.replace('/(auth)/login');
  }
}

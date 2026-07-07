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
    hasSeenOnboarding: boolean;
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

export async function linkKakao(request: KakaoLoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post('/api/auth/kakao/link', request);
  return response.data.data;
}

export async function linkApple(request: AppleLoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post('/api/auth/apple/link', request);
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

export async function completeOnboarding(): Promise<void> {
  await apiClient.post('/api/users/me/onboarding');
}
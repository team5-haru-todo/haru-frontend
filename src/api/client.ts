import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { router } from 'expo-router';

const BASE_URL = 'https://hurricane-duct-unselfish.ngrok-free.dev';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null; // 웹에서는 SecureStore 미지원
  }
  return SecureStore.getItemAsync('authToken');
}

// 요청 보내기 전 — 토큰 자동으로 헤더에 끼워넣기
apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 받은 후 — 401(로그인 안 됨)이면 토큰 지우고 로그인 화면으로
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync('authToken');
      }
      router.replace('/(auth)/login');
    }
    return Promise.reject(error);
  }
);
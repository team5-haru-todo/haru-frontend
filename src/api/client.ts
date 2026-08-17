import axios from 'axios';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://hurricane-duct-unselfish.ngrok-free.dev';

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

async function getRefreshToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }
  return SecureStore.getItemAsync('refreshToken');
}

async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  await SecureStore.setItemAsync('authToken', accessToken);
  await SecureStore.setItemAsync('refreshToken', refreshToken);
}

async function clearTokensAndRedirectToLogin(): Promise<void> {
  if (Platform.OS !== 'web') {
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('refreshToken');
  }
  router.replace('/(auth)/login');
}

// 요청 보내기 전 — 토큰 자동으로 헤더에 끼워넣기
apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 동시에 여러 요청이 401을 받아도 재발급(/reissue)은 한 번만 실행되도록,
// 진행 중인 재발급 Promise를 공유한다. (안 그러면 로테이션 특성상 서로의 토큰을 무효화시킴)
let refreshingPromise: Promise<string> | null = null;

async function reissueTokens(): Promise<string> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  // apiClient가 아닌 axios를 직접 써서, 이 요청엔 요청 인터셉터(Authorization 헤더 부착)가
  // 끼어들지 않게 한다. reissue는 만료된 access token과 무관하게 동작해야 하기 때문.
  const response = await axios.post(`${BASE_URL}/api/auth/reissue`, { refreshToken });
  const { accessToken, refreshToken: newRefreshToken } = response.data.data;

  await saveTokens(accessToken, newRefreshToken);
  return accessToken;
}

// 응답 받은 후 — 401이면 자동으로 재발급 시도 후 원래 요청 재시도. 재발급도 실패하면 로그인 화면으로.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // reissue 요청 자체가 401이면 (Refresh Token도 이미 만료/폐기된 상태) —
    // 더 시도할 게 없으니 바로 로그인 화면으로 보낸다.
    if (originalRequest.url?.includes('/api/auth/reissue')) {
      await clearTokensAndRedirectToLogin();
      return Promise.reject(error);
    }

    // 이미 한 번 재시도한 요청이 또 401이면(재발급된 토큰으로도 실패) — 무한루프 방지, 로그인 화면으로.
    if (originalRequest._retry) {
      await clearTokensAndRedirectToLogin();
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    try {
      if (!refreshingPromise) {
        refreshingPromise = reissueTokens().finally(() => {
          refreshingPromise = null;
        });
      }
      const newAccessToken = await refreshingPromise;

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (reissueError) {
      // Refresh Token이 없거나 만료됨 — 진짜 재로그인 필요.
      // (네트워크 오류로 reissue 자체가 실패한 경우도 여기로 오는데, 이 경우는 추후
      //  재시도 정책을 더 정교하게 다듬을 수 있음. 지금은 일단 로그인 화면으로 보냄.)
      await clearTokensAndRedirectToLogin();
      return Promise.reject(error);
    }
  }
);

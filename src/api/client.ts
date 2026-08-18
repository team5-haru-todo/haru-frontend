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

const REISSUE_MAX_RETRIES = 2;
const REISSUE_RETRY_DELAY_MS = 1000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 네트워크 오류(응답 자체를 못 받음)인지, 서버가 명확히 거부한 것(401 등 응답 받음)인지 구분한다.
// 전자는 통신 문제일 뿐이라 재시도 가치가 있고, 후자는 재시도해도 결과가 같으므로 바로 실패 처리한다.
function isNetworkError(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response;
}

async function reissueTokens(): Promise<string> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= REISSUE_MAX_RETRIES; attempt++) {
    try {
      // apiClient가 아닌 axios를 직접 써서, 이 요청엔 요청 인터셉터(Authorization 헤더 부착)가
      // 끼어들지 않게 한다. reissue는 만료된 access token과 무관하게 동작해야 하기 때문.
      const response = await axios.post(`${BASE_URL}/api/auth/reissue`, { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;

      await saveTokens(accessToken, newRefreshToken);
      return accessToken;
    } catch (error) {
      lastError = error;

      // 서버가 명확히 거부한 경우(예: 401 AUTH_006/AUTH_007) — 재시도해도 결과 안 바뀜, 바로 중단.
      if (!isNetworkError(error)) {
        throw error;
      }

      // 네트워크 오류인데 아직 재시도 기회가 남았으면 잠깐 쉬었다가 다시 시도.
      if (attempt < REISSUE_MAX_RETRIES) {
        await delay(REISSUE_RETRY_DELAY_MS);
      }
    }
  }

  throw lastError;
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
      if (isNetworkError(reissueError)) {
        // 재시도까지 다 했는데도 네트워크 오류 — 인증정보 자체는 멀쩡하므로
        // 로그아웃시키지 않는다. 원래 요청만 실패로 처리해 오프라인 상태를 알린다.
        return Promise.reject(error);
      }
      // Refresh Token이 없거나 만료됨 — 진짜 재로그인 필요.
      await clearTokensAndRedirectToLogin();
      return Promise.reject(error);
    }
  }
);

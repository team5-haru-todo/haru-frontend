import { apiClient } from './client';

export interface UserResponse {
  id: string;
  nickname: string;
  status: string;
  connectedProviders: string[];
  termsVersion: string | null;
  termsAgreedAt: string | null;
  createdAt: string;
  hasSeenOnboarding: boolean;
}

export interface UserSettingsResponse {
  pushEnabled: boolean;
  timezone: string;
  // 메인 화면 알림 설정 팝업을 이 계정이 이미 봤는지 여부(pushEnabled와 별개).
  notificationPromptSeen: boolean;
  // 메모장 첫 진입 튜토리얼을 이 계정에 더 이상 띄우지 않아도 되는지 여부.
  // 완료·건너뛰기 모두 true로 기록한다.
  memoTutorialSeen: boolean;
}

export interface UpdateUserSettingsRequest {
  pushEnabled?: boolean;
  notificationPromptSeen?: boolean;
  memoTutorialSeen?: boolean;
}

export interface WithdrawRequest {
  reasons: string[];
  etcReason?: string;
}

export async function getMe(): Promise<UserResponse> {
  const response = await apiClient.get('/api/users/me');
  return response.data.data;
}

export async function getMySettings(): Promise<UserSettingsResponse> {
  const response = await apiClient.get('/api/users/me/settings');
  return response.data.data;
}

export async function updateMySettings(
  request: UpdateUserSettingsRequest
): Promise<UserSettingsResponse> {
  const response = await apiClient.patch('/api/users/me/settings', request);
  return response.data.data;
}

export async function withdraw(request: WithdrawRequest): Promise<void> {
  await apiClient.post('/api/users/me/withdraw', request);
}
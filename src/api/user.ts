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
  // 캘린더 첫 진입 튜토리얼 완료·건너뛰기 여부.
  calendarTutorialSeen: boolean;
  // 계정별 메인 튜토리얼 시청 버전. 0 = 아직 안 봄. "신규 가입자인지"가 아니라
  // "이 버전의 튜토리얼을 아직 안 봤는지"가 판단 기준이다(백엔드 UserSettingsResponse와 동일).
  mainTutorialVersion: number;
  mainCompletedTutorialVersion: number;
}

export interface UpdateUserSettingsRequest {
  pushEnabled?: boolean;
  notificationPromptSeen?: boolean;
  memoTutorialSeen?: boolean;
  calendarTutorialSeen?: boolean;
  mainTutorialVersion?: number;
  mainCompletedTutorialVersion?: number;
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

import { apiClient } from './client';

export interface UserResponse {
  id: string;
  nickname: string;
  status: string;
  connectedProviders: string[];
  termsVersion: string | null;
  termsAgreedAt: string | null;
  createdAt: string;
}

export interface UserSettingsResponse {
  pushEnabled: boolean;
  timezone: string;
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

export async function updateMySettings(pushEnabled: boolean): Promise<UserSettingsResponse> {
  const response = await apiClient.patch('/api/users/me/settings', { pushEnabled });
  return response.data.data;
}

export async function withdraw(request: WithdrawRequest): Promise<void> {
  await apiClient.post('/api/users/me/withdraw', request);
}
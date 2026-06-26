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

export async function loginAsGuest(): Promise<LoginResponse> {
  const response = await apiClient.post('/api/auth/guest');
  return response.data.data;
}
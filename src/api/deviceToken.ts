import { Platform } from 'react-native';

import { apiClient } from './client';

type DevicePlatform = 'IOS' | 'ANDROID';

function getDevicePlatform(): DevicePlatform {
  if (Platform.OS === 'ios') return 'IOS';
  if (Platform.OS === 'android') return 'ANDROID';

  throw new Error('푸시 알림은 iOS와 Android에서만 지원합니다.');
}

export async function registerDeviceToken(token: string): Promise<void> {
  await apiClient.post('/api/v1/devices/token', {
    token,
    platform: getDevicePlatform(),
  });
}

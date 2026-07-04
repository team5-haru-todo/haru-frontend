import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { registerDeviceToken } from '@/src/api/deviceToken';
import { updateMySettings } from '@/src/api/user';

export async function registerForPushNotifications(): Promise<boolean> {
  if (Platform.OS === 'web') {
    throw new Error('푸시 알림은 모바일 앱에서만 지원합니다.');
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: '기본 알림',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const currentPermission = await Notifications.getPermissionsAsync();
  const permission = currentPermission.granted
    ? currentPermission
    : await Notifications.requestPermissionsAsync();

  if (!permission.granted) return false;

  const {
    getMessaging,
    getToken,
    isDeviceRegisteredForRemoteMessages,
    registerDeviceForRemoteMessages,
  } = await import('@react-native-firebase/messaging');

  const messaging = getMessaging();

  if (Platform.OS === 'ios' && !isDeviceRegisteredForRemoteMessages(messaging)) {
    await registerDeviceForRemoteMessages(messaging);
  }

  const token = await getToken(messaging);

  await registerDeviceToken(token);
  await updateMySettings(true);

  return true;
}

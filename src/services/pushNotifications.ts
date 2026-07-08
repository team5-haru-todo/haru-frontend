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
  // 이 함수의 성공 = 메인 팝업(허용)이든 마이페이지(토글 ON)든, 계정이 알림 설정에 대한
  // 결정을 명시적으로 마쳤다는 뜻이므로 notificationPromptSeen도 함께 true로 고정한다.
  await updateMySettings({ pushEnabled: true, notificationPromptSeen: true });

  return true;
}

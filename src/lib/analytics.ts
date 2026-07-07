import analytics from '@react-native-firebase/analytics';
import { Platform } from 'react-native';

/**
 * Firebase Analytics 이벤트 기록.
 * 웹은 @react-native-firebase가 지원하지 않으므로 조용히 무시한다.
 */
export function logEvent(name: string, params?: Record<string, any>) {
  if (Platform.OS === 'web') return;
  analytics().logEvent(name, params).catch(() => {
    // 이벤트 기록 실패는 사용자 경험에 영향을 주면 안 되므로 조용히 무시
  });
}

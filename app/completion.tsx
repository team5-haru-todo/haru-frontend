import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { HomeIndicatorSpacer } from '@/src/components/common/HomeIndicatorSpacer';
import { StatusBarSpacer } from '@/src/components/common/StatusBarSpacer';
import { CompletionCelebration } from '@/src/components/main/CompletionCelebration';
import { DUMMY_COMPLETED_DAYS, DUMMY_TODAY_DAY_INDEX } from '@/src/constants/mainDummy';

export default function CompletionScreen() {
  // TODO: API 연결 전 더미 흐름 — taskContent/streakCount는 route params로 전달받는다.
  const { taskContent, streakCount } = useLocalSearchParams<{
    taskContent?: string;
    streakCount?: string;
  }>();

  const handleShare = () => {
    // TODO: 카카오톡 공유 SDK 연동 후 실제 구현
  };

  const handleConfirm = () => {
    // TODO: API 연결 전 더미 흐름 — completed 여부와 taskContent를 route params로 (tabs)에 전달한다.
    // router.replace로 (tabs)가 remount되면 MainScreen의 taskContent local state가 초기화되므로
    // taskContent를 params로 함께 실어 복구할 수 있게 한다. 전역 store 도입 전 임시 조치.
    router.replace({
      pathname: '/(tabs)',
      params: { completed: '1', taskContent: taskContent ?? '' },
    });
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#E6F4FF']} style={styles.gradient}>
      <StatusBarSpacer />
      <View style={styles.successNavBar} />
      <CompletionCelebration
        taskContent={taskContent ?? ''}
        streakCount={Number(streakCount ?? 0)}
        todayDayIndex={DUMMY_TODAY_DAY_INDEX}
        completedDays={DUMMY_COMPLETED_DAYS}
        onShare={handleShare}
        onConfirm={handleConfirm}
      />
      <HomeIndicatorSpacer />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  successNavBar: {
    height: 56,
    width: '100%',
  },
});

import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Share, StyleSheet, View } from 'react-native';

import { getWeeklyStreak } from '@/src/api/record';
import type { WeeklyStreakResponse } from '@/src/api/record';
import { HomeIndicatorSpacer } from '@/src/components/common/HomeIndicatorSpacer';
import { StatusBarSpacer } from '@/src/components/common/StatusBarSpacer';
import { CompletionCelebration } from '@/src/components/main/CompletionCelebration';
import { DUMMY_COMPLETED_DAYS, DUMMY_TODAY_DAY_INDEX } from '@/src/constants/mainDummy';
import { logEvent } from '@/src/lib/analytics';

export default function CompletionScreen() {
  // TODO: API 연결 전 더미 흐름 — taskContent/streakCount는 route params로 전달받는다.
  const { taskContent, streakCount } = useLocalSearchParams<{
    taskContent?: string;
    streakCount?: string;
  }>();

  const [weeklyStreak, setWeeklyStreak] = useState<WeeklyStreakResponse | null>(null);

  useEffect(() => {
    getWeeklyStreak()
      .then(setWeeklyStreak)
      .catch((error) => {
        console.error('주간 스트릭 조회 실패:', error);
      });
  }, []);

  const todayDayIndex = weeklyStreak?.todayDayIndex ?? DUMMY_TODAY_DAY_INDEX;
  const completedDays =
    weeklyStreak?.days.map((day) => day.completed) ?? DUMMY_COMPLETED_DAYS;

  const handleShare = async () => {
    // route param은 같은 key가 중복되면 string[]로 내려올 수 있어 방어적으로 정규화한다.
    const normalizeParam = (value: string | string[] | undefined): string =>
      Array.isArray(value) ? (value[0] ?? '') : (value ?? '');

    const content = normalizeParam(taskContent).trim() || '오늘의 한 개';
    const streak = Number(normalizeParam(streakCount));
    const streakLine = streak > 0 ? `🔥 ${streak}일째 이어가는 중\n\n` : '';
    const message = `오늘의 한 개 완료!\n"${content}"\n${streakLine}하루한개에서 나의 작은 성취를 기록했어요.`;

    try {
  logEvent('share_clicked', { streak });
  // 공유 취소는 정상 흐름(에러 아님) — Share.share()가 별도 분기 없이 resolve한다.
  await Share.share({ message });
} catch (error) {
  console.error('공유 실패:', error);
  Alert.alert('공유하기 실패', '잠시 후 다시 시도해주세요.');
}
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
        todayDayIndex={todayDayIndex}
        completedDays={completedDays}
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

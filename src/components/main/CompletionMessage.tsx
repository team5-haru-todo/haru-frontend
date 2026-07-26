import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/src/constants/colors';
import { typography } from '@/src/constants/typography';
import { spacing, radius } from '@/src/constants/layout';
import { useTutorialStore } from '@/src/store/tutorialStore';
import { mainTutorialStepConfigs } from './tutorial/mainTutorialConfigs';
import { TutorialTargetFrame } from '@/src/components/tutorial/TutorialTargetFrame';
import { WeeklyStrip } from './WeeklyStrip';

type Props = {
  taskContent: string;
  streakCount: number;
  todayDayIndex: number;
  completedDays: boolean[];
  // 오늘 누적 완료 개수(서버 기준). "오늘 N개 완료!" 표시에만 사용.
  completedCount: number;
  onExtra: () => void;
};

export function CompletionMessage({
  taskContent,
  todayDayIndex,
  completedDays,
  completedCount,
  onExtra,
}: Props) {
  const activeTourId = useTutorialStore((s) => s.activeTourId);
  const extraButtonStepCfg = mainTutorialStepConfigs["main-completed-extra-button"];

  return (
    <View style={styles.container}>
      <View style={styles.greetingGroup}>
        <Image
          source={require('../../../assets/images/Check.png')}
          style={styles.checkIcon}
          resizeMode="contain"
        />

        <Text style={styles.completedLabel}>오늘 {completedCount}개 완료!</Text>

        <Text style={styles.taskTitle}>{taskContent}</Text>
      </View>

      {/* Figma 기준 TextGroup_Greeting→WeekStrip 간격 40 = container.gap(16) + marginTop(24) */}
      <View style={styles.weekStripWrapper}>
        <WeeklyStrip todayDayIndex={todayDayIndex} completedDays={completedDays} />
      </View>

      {/* TODO: 추가 완료 화면 라우팅 연결 */}
      {/* 흰 frame(사방 TARGET_FRAME_INSET)은 TutorialTargetFrame이 절대위치 배경으로 그린다.
          여기 style에는 marginTop만 남긴다(버튼 200×54 자체 크기/위치는 그대로 유지). */}
      <TutorialTargetFrame
        stepConfig={extraButtonStepCfg}
        active={activeTourId === "main-completed"}
        style={styles.extraButtonTutorialFrame}
      >
        <TouchableOpacity style={styles.extraButton} onPress={onExtra} activeOpacity={0.8}>
          <Image
            source={require('../../../assets/images/Todolist_ic.png')}
            style={styles.listIcon}
            resizeMode="contain"
          />
          <Text style={styles.extraText}>한개 더하기</Text>
        </TouchableOpacity>
      </TutorialTargetFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  // 카드 아님 — EmptyState/TodayTaskCard와 달리 배경/그림자 없이 메인 화면 배경 위에
  // 체크 아이콘/문구/스트립/버튼이 개별 배치되는 완료 메시지 레이아웃이다.
  container: {
    alignItems: 'center',
    gap: spacing.lg,
    width: '100%',
    // ScrollView(index.tsx)가 이 컴포넌트 전체를 세로 중앙 정렬하는데, 이 paddingTop만
    // 위쪽에 추가로 더해져서 헤더→체크 간격이 버튼→탭바 간격보다 훨씬 넓어 보였다.
    // 대응하는 paddingBottom이 없어 위/아래가 비대칭이라 제거해 자동 중앙 정렬에 맡긴다.
  },
  // Figma TextGroup_Greeting 294x182 hug — 투두 문장 길이가 가변적이라 height 대신 minHeight로 잘림 방지
  greetingGroup: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    width: '100%',
    minHeight: 182,
  },
  weekStripWrapper: {
    width: '100%',
    marginTop: 24,
  },
  checkIcon: {
    width: 48,
    height: 48,
  },
  completedLabel: {
    ...typography.b2BodyBold,
    color: colors.primary.default,
    textAlign: 'center',
  },
  taskTitle: {
    ...typography.h1Display,
    color: colors.text.primary,
    textAlign: 'center',
  },
  // wrapper 배치값만 담는다(marginTop). 프레임의 시각적 padding/모서리는 TutorialTargetFrame 내부 고정값 사용.
  // Figma 기준 WeeklyStrip~버튼 간격 36 = container.gap(16) + marginTop(20). container.gap은 다른 형제 간격 유지 위해 그대로 둠
  extraButtonTutorialFrame: {
    marginTop: 20,
  },
  extraButton: {
    width: 200,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary.default,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
  },
  listIcon: {
    width: 20,
    height: 20,
    tintColor: colors.surface.default,
  },
  extraText: {
    ...typography.b2BodyBold,
    color: colors.surface.default,
  },
});

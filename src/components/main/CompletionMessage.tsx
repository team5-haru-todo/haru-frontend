import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/src/constants/colors';
import { typography } from '@/src/constants/typography';
import { spacing, radius } from '@/src/constants/layout';
import { WeeklyStrip } from './WeeklyStrip';

type Props = {
  taskContent: string;
  streakCount: number;
  todayDayIndex: number;
  completedDays: boolean[];
  onExtra: () => void;
};

export function CompletionMessage({
  taskContent,
  todayDayIndex,
  completedDays,
  onExtra,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.greetingGroup}>
        <Image
          source={require('../../../assets/images/Check.png')}
          style={styles.checkIcon}
          resizeMode="contain"
        />

        <Text style={styles.completedLabel}>오늘 한개 완료!</Text>

        <Text style={styles.taskTitle}>{taskContent}</Text>
      </View>

      {/* Figma 기준 TextGroup_Greeting→WeekStrip 간격 40 = container.gap(16) + marginTop(24) */}
      <View style={styles.weekStripWrapper}>
        <WeeklyStrip todayDayIndex={todayDayIndex} completedDays={completedDays} />
      </View>

      {/* TODO: 추가 완료 화면 라우팅 연결 */}
      <TouchableOpacity style={styles.extraButton} onPress={onExtra} activeOpacity={0.8}>
        <Image
          source={require('../../../assets/images/list.png')}
          style={styles.listIcon}
          resizeMode="contain"
        />
        <Text style={styles.extraText}>하루 한개 더하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.lg,
    width: '100%',
    paddingTop: spacing.xxxl,
    // 배경색은 Figma에서 확인 불가 상태라 추가하지 않음(2단계 "보류" 항목)
    borderRadius: radius.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
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
    width: 58,
    height: 58,
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
  extraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary.default,
    height: 54,
    borderRadius: radius.pill,
    width: 200,
    paddingHorizontal: spacing.xl,
    // Figma 기준 WeeklyStrip~버튼 간격 36 = container.gap(16) + marginTop(20). container.gap은 다른 형제 간격 유지 위해 그대로 둠
    marginTop: 20,
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

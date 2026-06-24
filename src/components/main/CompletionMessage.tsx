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
      <Image
        source={require('../../../assets/images/Check.png')}
        style={styles.checkIcon}
        resizeMode="contain"
      />

      <Text style={styles.completedLabel}>오늘 한개 완료!</Text>

      <Text style={styles.taskTitle}>{taskContent}</Text>

      <WeeklyStrip todayDayIndex={todayDayIndex} completedDays={completedDays} />

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
    width: '100%',
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

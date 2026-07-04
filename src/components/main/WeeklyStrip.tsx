import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '@/src/constants/colors';
import { typography } from '@/src/constants/typography';
import { spacing } from '@/src/constants/layout';

type Props = {
  todayDayIndex: number;
  completedDays: boolean[];
  // TODO: SCR-003_4(완료 후 메인 화면) WeeklyStrip 박스 스펙 확정 전까지 'default' 유지, SCR-003_3(완료 직후 화면)에만 'celebration' 적용
  variant?: 'default' | 'celebration';
};

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

export function WeeklyStrip({ todayDayIndex, completedDays, variant = 'default' }: Props) {
  const isCelebration = variant === 'celebration';
  return (
    <View style={[styles.card, isCelebration && styles.cardCelebration]}>
      <View style={[styles.row, isCelebration && styles.rowCelebration]}>
        {DAY_LABELS.map((label, i) => {
          const isCompleted = completedDays[i] ?? false;
          const isToday = i === todayDayIndex;
          return (
            <View key={label} style={styles.dayCol}>
              <Image
                source={
                  isCompleted
                    ? require('../../../assets/images/Check.png')
                    : require('../../../assets/images/Check_off.png')
                }
                style={styles.dayIcon}
                resizeMode="contain"
              />
              <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.default,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.button.disabled,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    width: '100%',
  },
  // SCR-003_3 완료 직후 화면 Figma 기준: height 106, border 없음, paddingVertical 26, shadow 0px 8px 24px #269BFF21
  cardCelebration: {
    height: 106,
    borderWidth: 0,
    paddingVertical: 26,
    shadowColor: '#269BFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 24,
    elevation: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // 요일 컬럼이 모두 flex:1이라 justifyContent:'space-between'만으로는 여유 공간이 없어 사실상 no-op이었음.
  // gap 추가로 컬럼 사이 최소 8px을 보장(Figma gap:8). justifyContent는 기존 구조 유지 위해 그대로 둠.
  rowCelebration: {
    gap: spacing.sm,
  },
  dayCol: {
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  dayIcon: {
    width: 32,
    height: 32,
  },
  dayLabel: {
    ...typography.c1Caption,
    color: colors.text.placeholder,
  },
  dayLabelToday: {
    color: colors.primary.default,
  },
});

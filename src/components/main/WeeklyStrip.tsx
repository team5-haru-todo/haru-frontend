import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '@/src/constants/colors';
import { typography } from '@/src/constants/typography';
import { spacing, radius } from '@/src/constants/layout';

type Props = {
  todayDayIndex: number;
  completedDays: boolean[];
};

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

export function WeeklyStrip({ todayDayIndex, completedDays }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
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
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.button.disabled,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

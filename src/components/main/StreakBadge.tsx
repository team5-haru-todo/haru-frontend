import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '@/src/constants/colors';
import { typography } from '@/src/constants/typography';
import { spacing, radius } from '@/src/constants/layout';

type Props = {
  count: number;
};

export function StreakBadge({ count }: Props) {
  return (
    <View style={styles.badge}>
      <Image
        source={require('../../../assets/images/Check.png')}
        style={styles.checkIcon}
        resizeMode="contain"
      />
      <Text style={styles.text}>
        <Text style={styles.count}>{count}일</Text>
        <Text style={styles.label}> 연속 달성</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.button.disabled,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.sm,
    paddingRight: spacing.md,
    borderRadius: radius.pill,
  },
  checkIcon: {
    width: 24,
    height: 24,
  },
  text: {
    ...typography.b4BodySm,
  },
  count: {
    color: colors.primary.default,
  },
  label: {
    color: colors.text.primary,
  },
});

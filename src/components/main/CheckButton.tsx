import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '@/src/constants/colors';
import { typography } from '@/src/constants/typography';
import { spacing, radius } from '@/src/constants/layout';

type Props = {
  onPress: () => void;
};

export function CheckButton({ onPress }: Props) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.text}>완료했어요</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary.default,
    height: 54,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    width: '100%',
  },
  text: {
    ...typography.b2BodyBold,
    color: colors.surface.default,
  },
});

import type { ReactNode } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/src/constants/colors';
import { typography } from '@/src/constants/typography';
import { spacing, radius } from '@/src/constants/layout';

type Props = {
  content: string;
  isEditing: boolean;
  onPressEdit: () => void;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  footer?: ReactNode;
};

export function TodayTaskCard({ content, isEditing, onPressEdit, onChangeText, onBlur, footer }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>오늘의 한개</Text>

      {isEditing ? (
        // TODO: 백엔드 task/record 수정 API 확정 후 실제 저장 로직 연결
        <View style={styles.editBox}>
          <TextInput
            style={styles.input}
            value={content}
            onChangeText={onChangeText}
            onBlur={onBlur}
            onSubmitEditing={onBlur}
            autoFocus
            multiline={false}
            textAlign="center"
            returnKeyType="done"
          />
        </View>
      ) : (
        <View style={styles.displayBox}>
          <TouchableOpacity onPress={onPressEdit} activeOpacity={0.7}>
            <Text style={styles.content}>{content}</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>텍스트를 누르면 수정할 수 있어요</Text>
        </View>
      )}

      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.default,
    borderRadius: radius.card,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl + spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 24,
    elevation: 6,
    width: '100%',
    height: 350,
  },
  label: {
    ...typography.b2BodyBold,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  displayBox: {
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  editBox: {
    backgroundColor: colors.surface.sunken,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    width: '100%',
  },
  content: {
    ...typography.t1Title1,
    color: colors.text.primary,
    textAlign: 'center',
  },
  input: {
    ...typography.b3BodyRegular,
    color: colors.text.primary,
    textAlign: 'center',
    width: '100%',
    padding: 0,
  },
  hint: {
    ...typography.c2CaptionXSm,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.placeholder,
    textAlign: 'center',
  },
});

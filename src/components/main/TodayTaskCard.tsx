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
      <View style={styles.labelBlock}>
        <Text style={styles.label}>오늘의 한개</Text>
      </View>

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

      {/* Figma 기준 InputField_Today→버튼 간격 32 = card.gap 하나로 충족, 별도 margin 불필요 */}
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.default,
    borderRadius: radius.card,
    paddingHorizontal: spacing.xxl,
    // Figma 기준 카드 상단/하단 42(대칭)라 paddingVertical 하나로 처리 가능
    paddingVertical: 42,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 24,
    elevation: 6,
    // Figma 기준 카드 342 vs header 350 — width:'100%'+marginHorizontal은 오버플로우를 유발하므로
    // alignSelf:'stretch'(부모 폭에 맞춰 늘어남)로 부모 폭을 채운 뒤 marginHorizontal로 좌우 4px씩 줄인다.
    alignSelf: 'stretch',
    marginHorizontal: 4,
    height: 350,
  },
  // Figma "오늘의 한개" 영역 44 hug — 텍스트 lineHeight를 억지로 키우지 않고 wrapper 높이로 확보
  labelBlock: {
    width: '100%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.b2BodyBold,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  // Figma InputField_Today 104 hug — 투두 텍스트 길이가 가변적이라 height 대신 minHeight로 잘림 방지
  displayBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    minHeight: 104,
  },
  // Figma InputField(editing) 48 hug — paddingVertical(12×2=24) + TextInput lineHeight(24) = 48로 자연스럽게 hug됨, 별도 height 불필요
  editBox: {
    backgroundColor: colors.surface.sunken,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    width: '100%',
    justifyContent: 'center',
  },
  content: {
    ...typography.t1Title1,
    color: colors.text.primary,
    textAlign: 'center',
  },
  input: {
    // lineHeight를 명시하면 iOS에서 캐럿(커서)은 fontSize(16) 기준으로 그려지는데
    // 실제 글자는 lineHeight(24) 기준 줄 안에서 배치돼 서로 어긋나 텍스트가 커서보다
    // 아래로 처져 보인다 — lineHeight는 빼고 폰트의 자연스러운 줄 높이를 쓰게 하고,
    // 기존과 동일한 세로 공간을 유지하도록 height만 명시한다.
    fontFamily: typography.b3BodyRegular.fontFamily,
    fontSize: typography.b3BodyRegular.fontSize,
    letterSpacing: typography.b3BodyRegular.letterSpacing,
    color: colors.text.primary,
    textAlign: 'center',
    width: '100%',
    height: 24,
    padding: 0,
  },
  hint: {
    ...typography.c2CaptionXSm,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.placeholder,
    textAlign: 'center',
  },
});

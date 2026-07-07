import { colors } from "@/src/constants/colors";
import {
  EMPTY_STATE_MESSAGES,
  type EmptyStateMessageLine,
} from "@/src/constants/emptyStateMessages";
import { radius, spacing } from "@/src/constants/layout";
import { typography } from "@/src/constants/typography";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ChooseFromMemoLink } from "./ChooseFromMemoLink";

type Props = {
  onSubmit: (text: string) => void;
  onChooseFromMemo: () => void;
};

function renderMessageLine(line: EmptyStateMessageLine) {
  if (!line.quoted) {
    return line.prefix;
  }
  return (
    <>
      {line.prefix}
      {"'"}
      <Text style={styles.accent}>{line.quoted}</Text>
      {"'"}
      {line.suffix}
    </>
  );
}

export function EmptyState({ onSubmit, onChooseFromMemo }: Props) {
  const [inputText, setInputText] = useState("");
  // 화면 진입(mount) 시 1회만 랜덤 선택 — 타이핑 등 리렌더로는 다시 뽑히지 않는다.
  const [message] = useState(
    () => EMPTY_STATE_MESSAGES[Math.floor(Math.random() * EMPTY_STATE_MESSAGES.length)]
  );
  const hasText = inputText.trim().length > 0;

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <Text style={styles.greeting}>
          {renderMessageLine(message.line1)}
          {"\n"}
          {renderMessageLine(message.line2)}
        </Text>

        <View style={styles.inputActionGroup}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="오늘 할 일을 적어보세요"
              placeholderTextColor={colors.text.placeholder}
              returnKeyType="done"
              onSubmitEditing={() => hasText && onSubmit(inputText.trim())}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              hasText ? styles.buttonActive : styles.buttonDisabled,
            ]}
            onPress={() => hasText && onSubmit(inputText.trim())}
            activeOpacity={hasText ? 0.8 : 1}
          >
            <Text
              style={[
                styles.buttonText,
                hasText ? styles.buttonTextActive : styles.buttonTextDisabled,
              ]}
            >
              도전하기
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ChooseFromMemoLink onPress={onChooseFromMemo} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
    gap: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface.default,
    borderRadius: radius.card,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl + spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xxxl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 24,
    elevation: 6,
    // Figma 기준 카드 342 vs header 350 — width:'100%'+marginHorizontal은 오버플로우를 유발하므로
    // alignSelf:'stretch'(부모 폭에 맞춰 늘어남)로 부모 폭을 채운 뒤 marginHorizontal로 좌우 4px씩 줄인다.
    alignSelf: "stretch",
    marginHorizontal: 4,
    // 랜덤 문구 중 2줄이 넘어가는 긴 문구가 있어 height 고정 대신 minHeight로 바꿔,
    // 기존 문구 기준 크기(350)는 그대로 유지하면서 긴 문구는 카드가 자연스럽게 늘어나게 한다.
    minHeight: 350,
  },
  greeting: {
    ...typography.t1Title1,
    color: colors.text.primary,
    textAlign: "center",
    paddingVertical: spacing.sm,
  },
  accent: {
    color: colors.primary.default,
  },
  inputActionGroup: {
    alignItems: "center",
    gap: 50,
    width: "100%",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface.sunken,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    width: "100%",
    minHeight: 48,
  },
  input: {
    ...typography.b3BodyRegular,
    color: colors.text.primary,
    flex: 1,
    padding: 0,
  },
  button: {
    height: 54,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    width: 200,
  },
  buttonActive: {
    backgroundColor: colors.primary.light,
  },
  buttonDisabled: {
    backgroundColor: colors.button.disabled,
  },
  buttonText: {
    ...typography.b2BodyBold,
  },
  buttonTextActive: {
    color: colors.primary.default,
  },
  buttonTextDisabled: {
    color: colors.text.tertiary,
  },
});

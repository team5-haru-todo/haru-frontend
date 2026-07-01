import { colors } from "@/src/constants/colors";
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

type Props = {
  onSubmit: (text: string) => void;
};

export function EmptyState({ onSubmit }: Props) {
  const [inputText, setInputText] = useState("");
  const hasText = inputText.trim().length > 0;

  return (
    <View style={styles.card}>
      <Text style={styles.greeting}>
        딱 하나만 해도 괜찮아요,{"\n"}오늘의 {"'"}
        <Text style={styles.accent}>한개</Text>
        {"'"}를 적어볼까요?
      </Text>

      <View style={styles.inputRow}>
        {!hasText && <View style={styles.cursor} />}
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
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.default,
    borderRadius: radius.card,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl + spacing.sm,
    alignItems: "center",
    gap: spacing.xxxl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 24,
    elevation: 6,
    width: "100%",
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
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface.sunken,
    borderRadius: radius.button,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    width: "100%",
    minHeight: 48,
  },
  cursor: {
    width: 2,
    height: 24,
    backgroundColor: colors.text.placeholder,
    marginRight: spacing.xs,
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
    minWidth: 200,
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

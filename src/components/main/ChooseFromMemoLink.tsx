import { colors } from "@/src/constants/colors";
import { spacing } from "@/src/constants/layout";
import { typography } from "@/src/constants/typography";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

type Props = {
  onPress: () => void;
};

// Figma Link_ChooseFromMemo — empty/진행중 화면이 공유하는 "메모장에서 고르기" 링크.
// 아이콘은 Ic_memo 24x24 에셋이 없어 임시로 list.png 재사용 — TODO: 실제 에셋 교체
export function ChooseFromMemoLink({ onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.chooseFromMemoLink}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={require("../../../assets/images/list.png")}
        style={styles.chooseFromMemoIcon}
        resizeMode="contain"
      />
      <Text style={styles.chooseFromMemoLabel}>메모장에서 고르기</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chooseFromMemoLink: {
    width: 154,
    height: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  chooseFromMemoIcon: {
    width: 24,
    height: 24,
    tintColor: colors.primary.default,
  },
  chooseFromMemoLabel: {
    ...typography.b2BodyMedium,
    color: colors.primary.default,
  },
});

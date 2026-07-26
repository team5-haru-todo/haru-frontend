import { colors } from "@/src/constants/colors";
import { spacing } from "@/src/constants/layout";
import { typography } from "@/src/constants/typography";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { mainTutorialStepConfigs } from "./tutorial/mainTutorialConfigs";
import { useTutorialStore } from "@/src/store/tutorialStore";
import { TutorialTargetFrame } from "@/src/components/tutorial/TutorialTargetFrame";

type Props = {
  onPress: () => void;
};

// Figma Link_ChooseFromMemo — empty/진행중 화면이 공유하는 "메모장에서 고르기" 링크.
// 아이콘은 Todolist_ic.png를 링크 텍스트와 동일한 primary 색으로 tint해 사용한다.
export function ChooseFromMemoLink({ onPress }: Props) {
  const activeTourId = useTutorialStore((s) => s.activeTourId);
  const chooseMemoStepCfg = mainTutorialStepConfigs["main-empty-choose-memo"];

  return (
    // 흰 frame(사방 TARGET_FRAME_INSET)은 TutorialTargetFrame이 절대위치 배경으로 그린다.
    // 여기 style은 부모가 이 wrapper를 stretch시키지 않도록 alignSelf:center만 지정한다
    // (콘텐츠 크기 그대로 hug — width:100%/flex:1 금지).
    <TutorialTargetFrame
      stepConfig={chooseMemoStepCfg}
      active={activeTourId === "main-empty"}
      style={styles.chooseMemoTutorialFrame}
    >
      <TouchableOpacity
        style={styles.chooseFromMemoLink}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Image
          source={require("../../../assets/images/Todolist_ic.png")}
          style={styles.chooseFromMemoIcon}
          resizeMode="contain"
        />
        <Text style={styles.chooseFromMemoLabel}>메모장에서 고르기</Text>
      </TouchableOpacity>
    </TutorialTargetFrame>
  );
}

const styles = StyleSheet.create({
  chooseMemoTutorialFrame: {
    alignSelf: "center",
  },
  chooseFromMemoLink: {
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

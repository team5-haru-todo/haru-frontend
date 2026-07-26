import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { spacing } from "@/src/constants/layout";
import { ChooseFromMemoLink } from "./ChooseFromMemoLink";

type Props = {
  children: ReactNode;
  onChoosePress: () => void;
  // ⚠️ [임시 계측 — SCR-003 카드 하향 이동 진단용. 확인 후 제거] cardStage의 y/height 측정.
  onStageLayout?: (y: number, h: number) => void;
};

// selected(TodayTaskCard) 화면의 카드 배치 규칙.
// 카드 + "메모장에서 고르기" 링크를 일반 세로 흐름으로 묶어(cardStage gap) 함께 중앙 정렬한다.
// (이전에는 memoLinkSlot이 position:'absolute'라 중앙정렬 계산에서 링크(24)+간격(20)이 빠져,
//  같은 카드를 일반 흐름으로 배치하는 EmptyState보다 카드가 약 22px 아래로 보였다 — 그 비대칭을 제거.)
export function MainCardWithMemoLinkLayout({ children, onChoosePress, onStageLayout }: Props) {
  return (
    <View
      style={styles.cardStage}
      onLayout={
        onStageLayout
          ? (e) =>
              onStageLayout(
                Math.round(e.nativeEvent.layout.y * 10) / 10,
                Math.round(e.nativeEvent.layout.height * 10) / 10,
              )
          : undefined
      } /* ⚠️ [임시 계측] */
    >
      <View style={styles.cardAnchor}>{children}</View>

      <View style={styles.memoLinkSlot}>
        <ChooseFromMemoLink onPress={onChoosePress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardStage: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    // 카드 ↔ 링크 간격 20(기존 memoLinkSlot marginTop과 동일).
    gap: spacing.xl,
  },
  cardAnchor: {
    width: "100%",
  },
  memoLinkSlot: {
    alignItems: "center",
  },
});

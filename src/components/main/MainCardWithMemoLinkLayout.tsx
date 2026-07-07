import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { spacing } from "@/src/constants/layout";
import { ChooseFromMemoLink } from "./ChooseFromMemoLink";

type Props = {
  children: ReactNode;
  onChoosePress: () => void;
};

// empty(EmptyState)/selected(TodayTaskCard) 화면이 공유하는 카드 배치 규칙.
// cardAnchor는 position:'relative'라서 자신의 높이를 절대 위치 자식(memoLinkSlot)을 제외한
// 일반 흐름 자식(카드)만으로 결정한다. 그 덕분에 cardStage의 justifyContent:'center'는
// 오직 카드 높이만 기준으로 중앙 정렬되고, 버튼(gap+ChooseFromMemoLink)은 그 계산에 관여하지
// 않은 채 카드 바로 아래 spacing.xl 간격으로만 시각적으로 붙는다.
export function MainCardWithMemoLinkLayout({ children, onChoosePress }: Props) {
  return (
    <View style={styles.cardStage}>
      <View style={styles.cardAnchor}>
        {children}
        <View style={styles.memoLinkSlot}>
          <ChooseFromMemoLink onPress={onChoosePress} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardStage: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  cardAnchor: {
    position: "relative",
    width: "100%",
  },
  memoLinkSlot: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: spacing.xl,
    alignItems: "center",
  },
});

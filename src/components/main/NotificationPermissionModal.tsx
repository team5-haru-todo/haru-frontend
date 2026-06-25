import { colors } from "@/src/constants/colors";
import { radius, spacing } from "@/src/constants/layout";
import { typography } from "@/src/constants/typography";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  onSkip: () => void;
  onAgree: () => void;
};

export function NotificationPermissionModal({
  visible,
  onSkip,
  onAgree,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header: X 닫기 버튼 */}
          <View style={styles.header}>
            <TouchableOpacity
              style={[styles.closeButton, { outlineStyle: "none" } as any]}
              onPress={onSkip}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Image
                source={require("../../../assets/images/close.png")}
                style={styles.closeIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* 제목 + 본문 */}
          <View style={styles.textGroup}>
            <Text style={styles.title}>알림 설정</Text>
            <Text style={styles.body}>
              {"오늘의 할 일을 잊지 않도록\n딱 맞는 시간에 알려드릴게요!"}
            </Text>
          </View>

          {/* 알림 예시 카드 */}
          <View style={styles.previewCard}>
            <View style={styles.appIcon} />
            <View style={styles.previewText}>
              <View style={styles.previewHeader}>
                <Text style={styles.appName}>하루한개</Text>
                <Text style={styles.timestamp}>2분 전</Text>
              </View>
              <Text style={styles.previewBody} numberOfLines={2}>
                {
                  "오늘의 하루한개 '영단어 외우기' 가벼운 마음으로 지금 시작해 볼까요? 🌱"
                }
              </Text>
            </View>
          </View>

          {/* 하단 버튼 */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.btnSkip}
              onPress={onSkip}
              activeOpacity={0.8}
            >
              <Text style={styles.btnSkipText}>다음에 할게요</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnAgree}
              onPress={onAgree}
              activeOpacity={0.8}
            >
              <Text style={styles.btnAgreeText}>동의하고 알림 받기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.surface.default,
    borderRadius: radius.card,
    padding: spacing.xxl,
    gap: 28,
    width: 350,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    alignItems: "flex-end",
    width: "100%",
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    width: 16,
    height: 16,
    tintColor: colors.text.primary,
  },
  textGroup: {
    alignItems: "center",
    gap: spacing.sm,
    width: "100%",
  },
  title: {
    ...typography.t1Title1,
    color: colors.text.primary,
    textAlign: "center",
  },
  body: {
    ...typography.b3BodyRegular,
    color: colors.text.primary,
    textAlign: "center",
  },
  previewCard: {
    backgroundColor: colors.surface.sunken,
    borderRadius: radius.button,
    padding: spacing.md,
    gap: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  appIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#a7a7a7",
    borderRadius: 8,
    flexShrink: 0,
  },
  previewText: {
    flex: 1,
    gap: 2,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  appName: {
    ...typography.b4BodySm,
    color: colors.text.primary,
  },
  timestamp: {
    ...typography.c1Caption,
    color: colors.text.tertiary,
    opacity: 0.5,
  },
  previewBody: {
    ...typography.b4BodySm,
    color: colors.text.secondary,
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
  },
  btnSkip: {
    flex: 1,
    height: 54,
    borderRadius: 12,
    backgroundColor: colors.surface.default,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSkipText: {
    ...typography.b2BodyBold,
    color: colors.text.tertiary,
  },
  btnAgree: {
    flex: 1,
    height: 54,
    borderRadius: 12,
    backgroundColor: colors.primary.default,
    alignItems: "center",
    justifyContent: "center",
  },
  btnAgreeText: {
    ...typography.b2BodyBold,
    color: colors.surface.default,
  },
});

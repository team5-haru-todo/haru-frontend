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

const NOTIFICATION_ICON = require("../../../assets/images/Icon/Ic_Notification.png");

type Props = {
  visible: boolean;
  onSkip: () => void;
  onAgree: () => void | Promise<void>;
  agreeing?: boolean;
};

export function NotificationPermissionModal({
  visible,
  onSkip,
  onAgree,
  agreeing = false,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onSkip}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.intro}>
            <Image
              source={NOTIFICATION_ICON}
              style={styles.notificationIcon}
              resizeMode="contain"
            />
            <View style={styles.textGroup}>
              <Text style={styles.title}>잠깐, 알림을 켜볼까요?</Text>
              <Text style={styles.body}>
                오늘의 한 개를 잊지 않도록 알려드릴게요
              </Text>
            </View>
          </View>

          <View style={styles.previewCard}>
            <View style={styles.appIconPlaceholder} />
            <View style={styles.previewText}>
              <View style={styles.previewHeader}>
                <Text style={styles.appName}>하루한개</Text>
                <Text style={styles.timestamp}>2분 전</Text>
              </View>
              <Text style={styles.previewBody} numberOfLines={2}>
                ‘영어단어 외우기’ 오늘의 한 개, 시작해볼까요?✨
              </Text>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.btnSkip}
              onPress={onSkip}
              activeOpacity={0.8}
            >
              <Text style={styles.btnSkipText}>나중에</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnAgree}
              onPress={onAgree}
              disabled={agreeing}
              activeOpacity={0.8}
            >
              <Text style={styles.btnAgreeText}>
                {agreeing ? "설정 중..." : "알림 받기"}
              </Text>
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
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surface.default,
    borderRadius: radius.card,
    paddingTop: 30,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: 30,
    width: "100%",
    maxWidth: 342,
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  intro: {
    alignItems: "center",
    gap: spacing.xl,
  },
  notificationIcon: {
    width: 24,
    height: 24,
  },
  textGroup: {
    alignItems: "center",
    gap: spacing.sm,
    width: "100%",
  },
  title: {
    ...typography.b1Subtitle,
    color: colors.text.primary,
    textAlign: "center",
  },
  body: {
    ...typography.b4BodySm,
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
  appIconPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: colors.surface.default,
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

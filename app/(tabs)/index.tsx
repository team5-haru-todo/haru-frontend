import { StatusBarSpacer } from "@/src/components/common/StatusBarSpacer";
import { CheckButton } from "@/src/components/main/CheckButton";
import { CompletionMessage } from "@/src/components/main/CompletionMessage";
import { EmptyState } from "@/src/components/main/EmptyState";
import MemoPreviewSheet from "@/src/components/main/MemoPreviewSheet";
import { NotificationPermissionModal } from "@/src/components/main/NotificationPermissionModal";
import { StreakBadge } from "@/src/components/main/StreakBadge";
import { TodayTaskCard } from "@/src/components/main/TodayTaskCard";
import { colors } from "@/src/constants/colors";
import { layout, spacing } from "@/src/constants/layout";
import {
  DUMMY_COMPLETED_DAYS,
  DUMMY_STREAK,
  DUMMY_TODAY_DAY_INDEX,
} from "@/src/constants/mainDummy";
import { typography } from "@/src/constants/typography";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type MainState = "empty" | "selected" | "editing" | "completed";

export default function MainScreen() {
  // TODO: 백엔드 user 도메인에서 신규 사용자 여부 확인 후 초기값 교체
  const [showNotificationModal, setShowNotificationModal] = useState(true);
  const [showMemoPreview, setShowMemoPreview] = useState(false);
  const [mainState, setMainState] = useState<MainState>("empty");
  const [taskContent, setTaskContent] = useState("");
  const [editingText, setEditingText] = useState("");
  // TODO: API 연결 전 더미 흐름 — completion.tsx에서 확인 버튼을 누르면 completed/taskContent 파라미터를 넘겨받는다.
  // router.replace로 이 화면이 remount될 경우 taskContent local state가 초기화되므로,
  // completed와 함께 넘어온 taskContent param으로 복구한다. 전역 store 도입 전 임시 조치.
  const { completed, taskContent: taskContentParam } = useLocalSearchParams<{
    completed?: string;
    taskContent?: string;
  }>();

  useEffect(() => {
    if (completed) {
      setMainState("completed");
      if (taskContentParam) {
        setTaskContent(taskContentParam);
      }
      router.setParams({ completed: undefined, taskContent: undefined });
    }
  }, [completed, taskContentParam]);

  const today = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const handleSubmitTask = (text: string) => {
    setTaskContent(text);
    setMainState("selected");
  };

  const handlePressEdit = () => {
    setEditingText(taskContent);
    setMainState("editing");
  };

  const handleComplete = () => {
    // TODO: 백엔드 record 도메인 완료 처리 API 확정 후 연결
    const finalContent =
      mainState === "editing" && editingText.trim()
        ? editingText.trim()
        : taskContent;
    if (finalContent !== taskContent) {
      setTaskContent(finalContent);
    }
    // TODO: API 연결 전 더미 흐름 — taskContent/streakCount를 route params로 완료 화면에 전달한다.
    router.push({
      pathname: "/completion",
      params: { taskContent: finalContent, streakCount: String(DUMMY_STREAK) },
    });
  };

  const handleBlurEdit = () => {
    // TODO: 백엔드 task/record 수정 API 확정 후 실제 저장 로직 연결
    if (editingText.trim()) {
      setTaskContent(editingText.trim());
    }
    setMainState("selected");
  };

  const handleExtra = () => {
    setShowMemoPreview(true);
  };

  const handleSkipNotification = () => {
    setShowNotificationModal(false);
  };

  const handleAgreeNotification = () => {
    // TODO: 알림 권한 요청 (expo-notifications requestPermissionsAsync)
    // TODO: 기기 토큰 등록 API 연결 (notification 도메인 POST /device-tokens)
    // TODO: 사용자 알림 설정 저장 (user 도메인 PATCH /users/settings)
    setShowNotificationModal(false);
  };

  return (
    <LinearGradient colors={["#FFFFFF", "#E6F4FF"]} style={styles.gradient}>
      <View style={styles.safeArea}>
        <StatusBarSpacer />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.dateLabel}>{today}</Text>
              <StreakBadge count={DUMMY_STREAK} />
            </View>

            <ScrollView
              style={styles.scrollFlex}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {mainState === "empty" && (
                <EmptyState onSubmit={handleSubmitTask} />
              )}

              {mainState === "selected" && (
                <TodayTaskCard
                  content={taskContent}
                  isEditing={false}
                  onPressEdit={handlePressEdit}
                  footer={<CheckButton onPress={handleComplete} />}
                />
              )}

              {mainState === "editing" && (
                <TodayTaskCard
                  content={editingText}
                  isEditing={true}
                  onPressEdit={handlePressEdit}
                  onChangeText={setEditingText}
                  onBlur={handleBlurEdit}
                  footer={<CheckButton onPress={handleComplete} />}
                />
              )}

              {mainState === "completed" && (
                <CompletionMessage
                  taskContent={taskContent}
                  streakCount={DUMMY_STREAK}
                  todayDayIndex={DUMMY_TODAY_DAY_INDEX}
                  completedDays={DUMMY_COMPLETED_DAYS}
                  onExtra={handleExtra}
                />
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
      <NotificationPermissionModal
        visible={showNotificationModal}
        onSkip={handleSkipNotification}
        onAgree={handleAgreeNotification}
      />
      <MemoPreviewSheet
        visible={showMemoPreview}
        onClose={() => setShowMemoPreview(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  dateLabel: {
    ...typography.t2Title2,
    color: colors.text.primary,
  },
  scrollFlex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: layout.tabBarHeight,
  },
});

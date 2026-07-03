import { createTodayTask, getToday, getWeeklyStreak } from "@/src/api/record";
import type { TodayResponse, WeeklyStreakResponse } from "@/src/api/record";
import { updateTask } from "@/src/api/task";
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
  // API 연결 3단계 — UI 표시용이 아니라 중복 제출 방지용 내부 가드
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  // API 연결 4단계 — 오늘의 한 개 수정(PATCH /api/tasks/{id})에 필요한 taskId 보관
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
  // API 연결 4단계 — UI 표시용이 아니라 중복 저장 방지용 내부 가드
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  // TODO: API 연결 1단계 — GET /api/streak/week만 연결. 실패 시 더미값으로 폴백해 화면이 죽지 않게 한다.
  const [weeklyStreak, setWeeklyStreak] = useState<WeeklyStreakResponse | null>(null);

  useEffect(() => {
    getWeeklyStreak()
      .then(setWeeklyStreak)
      .catch((error) => {
        console.error("주간 스트릭 조회 실패:", error);
      });
  }, []);

  const streakCount = weeklyStreak?.currentStreak ?? DUMMY_STREAK;
  const todayDayIndex = weeklyStreak?.todayDayIndex ?? DUMMY_TODAY_DAY_INDEX;
  const completedDays =
    weeklyStreak?.days.map((day) => day.completed) ?? DUMMY_COMPLETED_DAYS;
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

  // TODO: 완료 API 연결 후에는 completed param 가드를 재검토하고, 서버 상태를 기준으로 refetch하도록 변경
  useEffect(() => {
    if (completed) return; // 완료 화면에서 돌아온 직후엔 서버 재조회로 덮어쓰지 않음
    getToday()
      .then((data: TodayResponse) => {
        setCurrentTaskId(data.currentTask?.id ?? null);
        if (data.currentTask === null) {
          setMainState("empty");
          return;
        }
        setTaskContent(data.currentTask.content);
        setMainState(data.fireEarned || data.firstCompletedAt ? "completed" : "selected");
      })
      .catch((error) => {
        console.error("오늘의 한 개 조회 실패:", error);
      });
  }, [completed]);

  const today = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const handleSubmitTask = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isSubmittingTask) return;
    setIsSubmittingTask(true);
    try {
      const data = await createTodayTask(trimmed);
      if (data.currentTask) {
        setTaskContent(data.currentTask.content);
        setCurrentTaskId(data.currentTask.id);
      }
      setMainState("selected");
    } catch (error) {
      console.error("오늘의 한 개 생성 실패:", error);
    } finally {
      setIsSubmittingTask(false);
    }
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
      params: { taskContent: finalContent, streakCount: String(streakCount) },
    });
  };

  const handleBlurEdit = async () => {
    if (isSavingEdit) return;
    const trimmed = editingText.trim();

    if (!trimmed) {
      // 빈 값이면 서버 호출 없이 기존 내용 유지
      setMainState("selected");
      return;
    }

    if (trimmed === taskContent) {
      // 실제 변경 없음 — 서버 호출 불필요
      setMainState("selected");
      return;
    }

    if (currentTaskId === null) {
      // 저장할 taskId가 없어 서버 반영이 불가능한 상태 — 화면엔 반영하지 않고 editing 유지
      console.error("오늘의 한 개 수정 실패: currentTaskId 없음");
      return;
    }

    setIsSavingEdit(true);
    try {
      const data = await updateTask(currentTaskId, trimmed);
      setTaskContent(data.content);
      setMainState("selected");
    } catch (error) {
      console.error("오늘의 한 개 수정 실패:", error);
      // mainState를 바꾸지 않아 editing 상태 유지 — 사용자가 재시도 가능
    } finally {
      setIsSavingEdit(false);
    }
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
              <StreakBadge count={streakCount} />
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
                  streakCount={streakCount}
                  todayDayIndex={todayDayIndex}
                  completedDays={completedDays}
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

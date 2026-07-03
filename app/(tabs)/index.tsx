import {
  completeAdditional,
  completeToday,
  createTodayTask,
  getToday,
  getWeeklyStreak,
  setTodayTask,
} from "@/src/api/record";
import type { TodayResponse, WeeklyStreakResponse } from "@/src/api/record";
import { updateTask } from "@/src/api/task";
import type { TaskResponse } from "@/src/api/task";
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
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type MainState = "empty" | "selected" | "editing" | "completed";
type MemoPreviewMode = "selectTodayTask" | "additionalComplete";

export default function MainScreen() {
  // TODO: 백엔드 user 도메인에서 신규 사용자 여부 확인 후 초기값 교체
  const [showNotificationModal, setShowNotificationModal] = useState(true);
  const [showMemoPreview, setShowMemoPreview] = useState(false);
  // API 연결 6단계 — MemoPreviewSheet가 열린 목적(오늘의 한 개 선택 vs 추가 완료)을 구분
  const [memoPreviewMode, setMemoPreviewMode] = useState<MemoPreviewMode>("selectTodayTask");
  // API 연결 6단계 — UI 표시용이 아니라 중복 선택 방지용 내부 가드
  const [isSelectingMemoTask, setIsSelectingMemoTask] = useState(false);
  const [mainState, setMainState] = useState<MainState>("empty");
  const [taskContent, setTaskContent] = useState("");
  const [editingText, setEditingText] = useState("");
  // API 연결 3단계 — UI 표시용이 아니라 중복 제출 방지용 내부 가드
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  // API 연결 4단계 — 오늘의 한 개 수정(PATCH /api/tasks/{id})에 필요한 taskId 보관
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
  // API 연결 4단계 — UI 표시용이 아니라 중복 저장 방지용 내부 가드
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  // API 연결 5단계 — state는 비동기 반영이라 blur/완료가 거의 동시에 들어오면 중복 통과할 수 있어,
  // saveEditingTaskIfNeeded 내부에서 동기적으로 체크하는 락으로 별도 사용.
  // boolean이 아니라 진행 중인 Promise 자체를 담아서, 나중에 들어온 호출자도 같은 저장 결과를 기다리게 한다
  // (예: onBlur가 먼저 저장을 시작하고 곧바로 완료 버튼 onPress가 들어와도, 완료 쪽이 그 저장을 이어받아 대기).
  const savingEditPromiseRef = useRef<Promise<string | null> | null>(null);
  // API 연결 5단계 — UI 표시용이 아니라 중복 완료 요청 방지용 내부 가드
  const [isCompletingTask, setIsCompletingTask] = useState(false);
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

  // API 연결 5단계 — 완료 API가 연결되어 서버 상태를 신뢰할 수 있으므로,
  // completed param 유무와 무관하게 항상 서버 상태를 재조회한다.
  // (completed 복귀 시 위 effect의 즉시 반영과 겹쳐 getToday가 한 번 더 불릴 수 있으나,
  //  결과가 항상 서버 진짜 상태와 일치하므로 허용한다)
  useEffect(() => {
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

  // editing 상태의 변경 사항을 저장한다.
  // - editing이 아니면 손댈 것 없이 현재 taskContent를 그대로 반환
  // - 빈 값/변경 없음이면 서버 호출 없이 현재 상태 그대로 반환
  // - currentTaskId 없음/저장 실패면 null 반환 — 호출부는 이후 진행(완료 등)을 중단해야 함
  // - 이미 저장이 진행 중이면 새로 시작하지 않고 그 Promise를 그대로 이어받아 기다린다.
  //   (onBlur가 먼저 저장을 시작한 직후 완료 버튼 onPress가 들어와도, updateTask는 한 번만 나가고
  //    handleComplete는 같은 저장의 실제 결과를 받아 completeToday로 이어갈 수 있다)
  const saveEditingTaskIfNeeded = (): Promise<string | null> => {
    if (mainState !== "editing") return Promise.resolve(taskContent);
    if (savingEditPromiseRef.current) return savingEditPromiseRef.current;

    const trimmed = editingText.trim();

    if (!trimmed) {
      setMainState("selected");
      return Promise.resolve(taskContent);
    }
    if (trimmed === taskContent) {
      setMainState("selected");
      return Promise.resolve(taskContent);
    }
    if (currentTaskId === null) {
      console.error("오늘의 한 개 수정 실패: currentTaskId 없음");
      return Promise.resolve(null);
    }

    const savePromise = (async () => {
      setIsSavingEdit(true);
      try {
        const data = await updateTask(currentTaskId, trimmed);
        setTaskContent(data.content);
        setMainState("selected");
        return data.content;
      } catch (error) {
        console.error("오늘의 한 개 수정 실패:", error);
        return null;
      } finally {
        setIsSavingEdit(false);
        savingEditPromiseRef.current = null;
      }
    })();

    savingEditPromiseRef.current = savePromise;
    return savePromise;
  };

  const handleComplete = async () => {
    if (isSavingEdit || isCompletingTask) return;

    const finalContent = await saveEditingTaskIfNeeded();
    if (finalContent === null) {
      // 수정 내용 저장 실패 — 완료로 진행하지 않고 현재 상태 유지
      return;
    }

    setIsCompletingTask(true);
    try {
      const data = await completeToday();
      router.push({
        pathname: "/completion",
        params: {
          taskContent: data.completion.content,
          streakCount: String(data.streak.currentStreak),
        },
      });
    } catch (error) {
      console.error("오늘의 한 개 완료 처리 실패:", error);
    } finally {
      setIsCompletingTask(false);
    }
  };

  const handleBlurEdit = async () => {
    if (isSavingEdit) return;
    await saveEditingTaskIfNeeded();
  };

  // Empty 상태의 Link_ChooseFromMemo — 오늘의 한 개를 메모장에서 고르는 흐름
  const handleOpenMemoPreviewForSelect = () => {
    setMemoPreviewMode("selectTodayTask");
    setShowMemoPreview(true);
  };

  // Completed 상태의 "하루 한개 더하기" — 추가 완료 흐름 (CompletionMessage는 무수정)
  const handleExtra = () => {
    setMemoPreviewMode("additionalComplete");
    setShowMemoPreview(true);
  };

  const handleSelectMemoTask = async (memo: TaskResponse) => {
    if (isSelectingMemoTask) return;
    setIsSelectingMemoTask(true);
    try {
      if (memoPreviewMode === "selectTodayTask") {
        const data = await setTodayTask(memo.id);
        if (data.currentTask) {
          setTaskContent(data.currentTask.content);
          setCurrentTaskId(data.currentTask.id);
        }
        setMainState("selected");
      } else {
        await completeAdditional(memo.id);
        // 추가 완료는 streak/currentTask/mainState에 영향 없음(백엔드 확인됨) — 상태 변경 불필요
      }
      setShowMemoPreview(false);
    } catch (error) {
      console.error(
        memoPreviewMode === "selectTodayTask" ? "오늘의 한 개 설정 실패:" : "추가 완료 실패:",
        error
      );
      // 실패 시 시트 유지 — 재시도 가능
    } finally {
      setIsSelectingMemoTask(false);
    }
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
                <EmptyState
                  onSubmit={handleSubmitTask}
                  onChooseFromMemo={handleOpenMemoPreviewForSelect}
                />
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
        onSelect={handleSelectMemoTask}
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

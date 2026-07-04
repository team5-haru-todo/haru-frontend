import {
  completeAdditional,
  completeToday,
  createTodayTask,
  getToday,
  getWeeklyStreak,
  setTodayTask,
} from "@/src/api/record";
import type { WeeklyStreakResponse } from "@/src/api/record";
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
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { registerForPushNotifications } from "@/src/services/pushNotifications";

type MainState = "empty" | "selected" | "editing" | "completed";

export default function MainScreen() {
  // TODO: 백엔드 user 도메인에서 신규 사용자 여부 확인 후 초기값 교체
  const [showNotificationModal, setShowNotificationModal] = useState(true);
  const [showMemoPreview, setShowMemoPreview] = useState(false);
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
  // API 연결 8단계 — handleComplete가 completeToday/completeAdditional 중 무엇을 호출할지 판단하는 기준.
  // mainState의 "completed"는 이제 currentTask 개별 완료 여부를 뜻하므로, 이 값을 별도로 들고 있어야 한다.
  const [hasFirstCompletionToday, setHasFirstCompletionToday] = useState(false);
  // TODO: API 연결 1단계 — GET /api/streak/week만 연결. 실패 시 더미값으로 폴백해 화면이 죽지 않게 한다.
  const [weeklyStreak, setWeeklyStreak] = useState<WeeklyStreakResponse | null>(null);
  // develop 병합 — 푸시 알림 등록 진행 중 여부(NotificationPermissionModal의 agreeing 표시용)
  const [registeringPush, setRegisteringPush] = useState(false);

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

  // API 연결 8단계 — mainState는 이제 "오늘 daily record에 첫 완료가 있었는가"가 아니라
  // "지금 화면에 보여줄 task(currentTask 또는 그 자리의 완료 snapshot)가 완료됐는가"를 기준으로 판단한다.
  // (completed 복귀 시 아래 focus effect와 겹쳐 getToday가 한 번 더 불릴 수 있으나,
  //  결과가 항상 서버 진짜 상태와 일치하므로 허용한다)
  const syncTodayState = useCallback(async () => {
    try {
      const data = await getToday();
      const hasFirstCompletion = data.completedTasks.some((c) => c.completionType === "FIRST");
      setHasFirstCompletionToday(hasFirstCompletion || data.fireEarned || data.firstCompletedAt !== null);

      if (data.currentTask !== null) {
        const currentTaskCompleted = data.completedTasks.some(
          (c) => c.taskId === data.currentTask!.id
        );
        setCurrentTaskId(data.currentTask.id);
        setTaskContent(data.currentTask.content);
        setMainState(currentTaskCompleted ? "completed" : "selected");
        return;
      }

      // currentTask가 없어도(예: GENERAL task 완료 후 soft delete), 오늘 완료 기록이 있으면
      // completedAt이 가장 최근인 completion snapshot으로 completed 화면을 보여준다.
      // FIRST 고정 시 추가 완료한 GENERAL task가 soft delete되어 currentTask가 null이 되는 경우에도
      // 방금 완료한 task가 아니라 첫 완료 task로 되돌아가 버리는 문제가 있었다.
      let latestCompletion: (typeof data.completedTasks)[number] | null = null;
      for (const completion of data.completedTasks) {
        if (
          latestCompletion === null ||
          new Date(completion.completedAt) > new Date(latestCompletion.completedAt)
        ) {
          latestCompletion = completion;
        }
      }

      if (latestCompletion !== null) {
        setCurrentTaskId(null);
        setTaskContent(latestCompletion.content);
        setMainState("completed");
        return;
      }

      setCurrentTaskId(null);
      setTaskContent("");
      setMainState("empty");
    } catch (error) {
      console.error("오늘의 한 개 조회 실패:", error);
    }
  }, []);

  useEffect(() => {
    syncTodayState();
  }, [completed, syncTodayState]);

  // API 연결 7단계 — 메모장 전체 화면 등 다른 라우트에서 오늘의 한 개를 바꾸고
  // 돌아왔을 때도 최신 서버 상태로 갱신되도록, 탭이 다시 focus될 때마다 재조회한다.
  useFocusEffect(
    useCallback(() => {
      syncTodayState();
    }, [syncTodayState])
  );

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
      if (!hasFirstCompletionToday) {
        const data = await completeToday();
        router.push({
          pathname: "/completion",
          params: {
            taskContent: data.completion.content,
            streakCount: String(data.streak.currentStreak),
          },
        });
        return;
      }

      if (currentTaskId === null) {
        console.error("추가 완료 실패: currentTaskId 없음");
        return;
      }

      const data = await completeAdditional(currentTaskId);
      router.push({
        pathname: "/completion",
        params: {
          taskContent: data.completion.content,
          // 추가 완료는 스트릭에 영향 없음(백엔드 확인됨) — 서버 응답에 streak가 없으므로 로컬 값 유지
          streakCount: String(streakCount),
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
    setShowMemoPreview(true);
  };

  // Completed 상태의 "하루 한개 더하기" — 메모장에서 고른 task를 새 오늘의 한 개로 설정하는 흐름.
  // 완료 기록(completeAdditional)은 여기서 만들지 않고, selected로 전환된 뒤 handleComplete에서만 만든다.
  const handleExtra = () => {
    setShowMemoPreview(true);
  };

  const handleSelectMemoTask = async (memo: TaskResponse) => {
    if (isSelectingMemoTask) return;
    setIsSelectingMemoTask(true);
    try {
      const data = await setTodayTask(memo.id);
      if (data.currentTask) {
        setTaskContent(data.currentTask.content);
        setCurrentTaskId(data.currentTask.id);
      }
      setMainState("selected");
      setShowMemoPreview(false);
    } catch (error) {
      console.error("오늘의 한 개 설정 실패:", error);
      // 실패 시 시트 유지 — 재시도 가능
    } finally {
      setIsSelectingMemoTask(false);
    }
  };

  const handleSkipNotification = () => {
    setShowNotificationModal(false);
  };

  const handleAgreeNotification = async () => {
    setRegisteringPush(true);

    try {
      const registered = await registerForPushNotifications();

      if (!registered) {
        Alert.alert(
          '알림 권한이 필요해요',
          '설정 앱에서 하루한개의 알림 권한을 허용해 주세요.',
        );
        return;
      }

      setShowNotificationModal(false);
    } catch (error) {
      console.error('푸시 알림 등록 실패:', error);
      Alert.alert(
        '알림을 설정하지 못했어요',
        '원격 알림은 Expo Go가 아닌 Development Build에서 설정할 수 있어요.',
      );
    } finally {
      setRegisteringPush(false);
    }
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
        agreeing={registeringPush}
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
    paddingBottom: layout.tabBarHeight,
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

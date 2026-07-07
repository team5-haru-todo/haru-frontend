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
import { updateMySettings } from "@/src/api/user";
import { StatusBarSpacer } from "@/src/components/common/StatusBarSpacer";
import { CheckButton } from "@/src/components/main/CheckButton";
import { CompletionMessage } from "@/src/components/main/CompletionMessage";
import { EmptyState } from "@/src/components/main/EmptyState";
import { MainCardWithMemoLinkLayout } from "@/src/components/main/MainCardWithMemoLinkLayout";
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
import * as SecureStore from "expo-secure-store";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { registerForPushNotifications } from "@/src/services/pushNotifications";

type MainState = "empty" | "selected" | "editing" | "completed";

// 알림 설정 팝업을 이 기기에서 이미 본 적 있는지 여부 — 백엔드 user_settings 필드 추가는 추후 논의,
// 우선은 SecureStore(이미 client.ts의 authToken 저장에 쓰는 것과 동일한 로컬 저장소)로 최초 1회만 관리한다.
// 앱 삭제/재설치·저장소 초기화 시 다시 뜨는 것은 로컬 저장 방식의 한계로 허용한다.
const NOTIFICATION_PROMPT_SEEN_KEY = "notificationPromptSeen";

async function getNotificationPromptSeen(): Promise<boolean> {
  if (Platform.OS === "web") return false; // SecureStore 웹 미지원 — client.ts와 동일한 처리
  try {
    const value = await SecureStore.getItemAsync(NOTIFICATION_PROMPT_SEEN_KEY);
    return value === "true";
  } catch (error) {
    console.error("알림 팝업 노출 여부 조회 실패:", error);
    return false;
  }
}

async function markNotificationPromptSeen(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await SecureStore.setItemAsync(NOTIFICATION_PROMPT_SEEN_KEY, "true");
  } catch (error) {
    console.error("알림 팝업 노출 여부 저장 실패:", error);
  }
}

// "오늘의 한 개"는 백엔드가 Asia/Seoul 날짜(record_date) 기준으로 스코핑하므로,
// 자정이 지났는지 판단할 때도 기기 로컬 날짜가 아니라 KST 기준 날짜로 비교한다.
function getKstDateKey(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

export default function MainScreen() {
  // 최초 1회만 노출 — 초기값은 false로 두고, 마운트 시 SecureStore 조회 결과에 따라 연다(아래 useEffect).
  const [showNotificationModal, setShowNotificationModal] = useState(false);
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
  // 자정 휘발 판단용 — 마지막으로 syncTodayState가 성공했을 때의 KST 날짜와,
  // AppState 리스너가 이전/다음 상태 전환(background|inactive → active)을 판단하기 위한 직전 상태.
  const lastSyncedDateRef = useRef<string | null>(null);
  const previousAppStateRef = useRef(AppState.currentState);
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

  // 이 기기에서 알림 설정 팝업을 이미 본 적 있는지 확인 — 없을 때만(최초 1회) 연다.
  useEffect(() => {
    getNotificationPromptSeen().then((seen) => {
      if (!seen) {
        setShowNotificationModal(true);
      }
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
      lastSyncedDateRef.current = getKstDateKey();
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

  // 앱이 background/inactive였다가 active로 복귀했을 때, 그 사이 자정이 지나 KST 날짜가 바뀌었으면
  // "오늘의 한 개"가 서버 기준으로 휘발된 상태를 반영하기 위해 다시 조회한다.
  // 매 foreground 복귀마다 무조건 호출하지 않고, 날짜가 실제로 바뀐 경우에만 재조회한다.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      const cameFromBackground = /inactive|background/.test(previousAppStateRef.current);
      if (cameFromBackground && nextAppState === "active") {
        const currentDateKey = getKstDateKey();
        if (lastSyncedDateRef.current !== null && lastSyncedDateRef.current !== currentDateKey) {
          syncTodayState();
        }
      }
      previousAppStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [syncTodayState]);

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

  // Link_ChooseFromMemo — empty/selected 공통으로 오늘의 한 개를 메모장에서 고르는 흐름
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

  const handleSkipNotification = async () => {
    // 거절/닫기 — registerForPushNotifications는 호출하지 않는다.
    // 계정 생성 시 기본값이 pushEnabled=true라서, 서버에 false 저장이 "성공"해야만
    // 최초 1회 기록을 남기고 팝업을 닫는다. 실패하면 재시도할 수 있도록 팝업을 유지한다.
    try {
      await updateMySettings(false);
    } catch (error) {
      console.error('푸시 알림 설정(OFF) 저장 실패:', error);
      Alert.alert('알림 설정 저장에 실패했습니다.', '다시 시도해주세요.');
      return;
    }
    setShowNotificationModal(false);
    await markNotificationPromptSeen();
  };

  const handleAgreeNotification = async () => {
    setRegisteringPush(true);
    try {
      let registered = false;

      try {
        registered = await registerForPushNotifications();

        if (!registered) {
          Alert.alert(
            '알림 권한이 필요해요',
            '마이페이지에서 언제든 다시 설정할 수 있어요.',
          );
        }
      } catch (error) {
        console.error('푸시 알림 등록 실패:', error);
        Alert.alert(
          '알림을 설정하지 못했어요',
          '마이페이지에서 언제든 다시 설정할 수 있어요.',
        );
      }

      if (!registered) {
        // 권한 거부/등록 실패면 registerForPushNotifications 내부에서 pushEnabled=true를 저장하지
        // 않으므로, 계정 생성 시 기본값(true)이 그대로 남지 않도록 여기서 false로 맞춘다.
        // 이 저장이 성공해야만 최초 1회 기록을 남기고 팝업을 닫는다.
        try {
          await updateMySettings(false);
        } catch (updateError) {
          console.error('푸시 알림 설정(OFF) 저장 실패:', updateError);
          Alert.alert('알림 설정 저장에 실패했습니다.', '다시 시도해주세요.');
          return;
        }
      }

      // 성공(registered===true)한 경우는 이미 registerForPushNotifications가 true로 저장했다.
      setShowNotificationModal(false);
      await markNotificationPromptSeen();
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
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
                  <MainCardWithMemoLinkLayout onChoosePress={handleOpenMemoPreviewForSelect}>
                    <TodayTaskCard
                      content={taskContent}
                      isEditing={false}
                      onPressEdit={handlePressEdit}
                      footer={<CheckButton onPress={handleComplete} />}
                    />
                  </MainCardWithMemoLinkLayout>
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
          </TouchableWithoutFeedback>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
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
    // 카드 그림자(shadowRadius 24)가 ScrollView 프레임 경계에서 잘리지 않도록,
    // 좌우 여백을 container가 아니라 ScrollView 내부(contentContainerStyle)에 둬서
    // 클리핑 경계 자체를 화면 전체 폭까지 넓힌다.
    paddingHorizontal: spacing.xl,
    // 중앙 정렬 기준은 실제 탭바 safe area 포함 높이가 아니라 디자인 기준 tabBarHeight를 사용한다.
    // Android 탭바 자체의 safe area 처리는 app/(tabs)/_layout.tsx에서 별도로 한다.
    paddingBottom: layout.tabBarHeight,
  },
});

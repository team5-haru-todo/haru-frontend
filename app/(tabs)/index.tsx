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
import { getMySettings, updateMySettings } from "@/src/api/user";
import type { UserSettingsResponse } from "@/src/api/user";
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
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  InteractionManager, // ⚠️ [임시 계측] (튜토리얼 자동 시작 대기에도 재사용)
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  useWindowDimensions, // ⚠️ [임시 계측]
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // ⚠️ [임시 계측]
import { useCopilot } from "react-native-copilot";
import { registerForPushNotifications } from "@/src/services/pushNotifications";
import { useTutorialStore } from "@/src/store/tutorialStore";
import { useUserStore } from "@/src/store/userStore";
import type { TutorialTourId } from "@/src/components/tutorial/tutorialTypes";
import {
  MAIN_TUTORIAL_VERSION,
  MAIN_COMPLETED_TUTORIAL_VERSION,
} from "@/src/components/main/tutorial/mainTutorialConfigs";

type MainState = "empty" | "selected" | "editing" | "completed";

// "오늘의 한 개"는 백엔드가 Asia/Seoul 날짜(record_date) 기준으로 스코핑하므로,
// 자정이 지났는지 판단할 때도 기기 로컬 날짜가 아니라 KST 기준 날짜로 비교한다.
function getKstDateKey(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

// 완료 직후, 완료 축하 화면(SCR-003_3)의 개수별 문구에 쓸 "오늘 누적 완료 개수"를 서버 기준으로 가져온다.
// 로컬 completedCount+1 대신 getToday()를 재조회하는 이유: 프론트 값이 오래됐거나 다른 기기/중복 요청
// 상황에서도 서버 진짜 값을 표시하기 위함(이 프로젝트의 "서버 응답이 진실 소스" 정책과 일치).
// 조회 실패 시 undefined를 반환해 param을 생략하면, completion 화면이 방어적으로 1로 fallback한다.
async function fetchTodayCompletedCountParam(): Promise<string | undefined> {
  try {
    const today = await getToday();
    return String(today.completedTasks.length);
  } catch (error) {
    console.error("완료 개수 조회 실패:", error);
    return undefined;
  }
}

// ⚠️ [임시 계측 — SCR-003 카드 하향 이동 원인 판별용. 확인 후 전량 제거 예정, 커밋 금지]
const DBG_LAYOUT = __DEV__;
function dbg(tag: string, data: Record<string, unknown>) {
  if (!DBG_LAYOUT) return;
  console.log(`[SCR003-DBG] ${tag} ::`, JSON.stringify(data));
}
const r1 = (n: number) => Math.round(n * 10) / 10;

export default function MainScreen() {
  // 최초 1회만 노출 — 초기값은 false로 두고, 마운트 시 서버 조회 결과에 따라 연다(아래 useEffect).
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
  // 계정별 설정(알림/튜토리얼 버전 등) — null이면 아직 조회 전. 튜토리얼 자동 시작 조건이
  // 이 값에 의존하므로, 조회 실패 시 null로 남겨 "버전 0으로 간주해 강제로 띄우기"를 막는다.
  const [settings, setSettings] = useState<UserSettingsResponse | null>(null);
  // "오늘의 한 개" 초기 동기화(syncTodayState)가 최소 1회 완료됐는지 — 이게 true가 되기 전에는
  // mainState가 아직 서버 진짜 상태를 반영하지 않았을 수 있어(기본값 "empty") 튜토리얼을 자동
  // 시작하지 않는다.
  const [mainDataLoaded, setMainDataLoaded] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  // 메인 completed 화면의 "오늘 N개 완료!" 표시용 오늘 누적 완료 개수(서버 진실 소스).
  // null = 아직 미확정(0/잘못된 값 렌더 방지). completion 복귀 시 route param으로 즉시 세우고,
  // 이후 syncTodayState의 getToday().completedTasks.length로 확정한다.
  const [completedCount, setCompletedCount] = useState<number | null>(null);

  // ⚠️ [임시 계측] ScrollView 참조 + onScroll 스로틀용 직전 offset 보관
  const dbgScrollRef = useRef<ScrollView>(null);
  const dbgLastOffsetRef = useRef<number | null>(null);
  // ⚠️ [임시 계측] env 로그의 safe-area inset 기록용(실제 레이아웃 수정에는 사용하지 않음).
  const insets = useSafeAreaInsets();

  // ⚠️ [임시 계측] 상위 레이아웃 원인 판별용 — 절대좌표 measureInWindow / 화면 / 키보드
  const dbgHeaderRef = useRef<View>(null);
  const dbgMainContentRef = useRef<View>(null);
  const dbgViewportHRef = useRef<number | null>(null);
  const dbgWin = useWindowDimensions();

  useEffect(() => {
    getWeeklyStreak()
      .then(setWeeklyStreak)
      .catch((error) => {
        console.error("주간 스트릭 조회 실패:", error);
      });
  }, []);

  // ⚠️ [임시 계측] 실제 커밋된 state 변화만 기록(setter 직후 stale 값 오해 방지).
  // 전환 시점의 "직전 onScroll offset"도 함께 남겨, 정지 상태 offset 잔류 여부를 추정한다.
  useEffect(() => {
    dbg("state", {
      mainState,
      currentTaskId,
      showMemoPreview,
      hasFirstCompletionToday,
      lastOffsetY: dbgLastOffsetRef.current,
    });
  }, [mainState, currentTaskId, showMemoPreview, hasFirstCompletionToday]);

  // ⚠️ [임시 계측] selected/completed 진입 후 레이아웃 안정 시점(InteractionManager+rAF)에
  // 상위 요소 절대 화면 좌표(measureInWindow) + 화면/인셋/tabBar 값을 1회 기록.
  useEffect(() => {
    if (mainState !== "selected" && mainState !== "completed") return;
    const task = InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        const measure = (name: string, node: any) =>
          node?.measureInWindow?.((x: number, y: number, w: number, h: number) =>
            dbg("win", { name, mainState, x: r1(x), y: r1(y), w: r1(w), h: r1(h) })
          );
        measure("header", dbgHeaderRef.current);
        measure("scrollView", dbgScrollRef.current?.getNativeScrollRef?.());
        measure("mainContent", dbgMainContentRef.current);
        dbg("env", {
          mainState,
          winW: r1(dbgWin.width),
          winH: r1(dbgWin.height),
          insetTop: r1(insets.top),
          insetBottom: r1(insets.bottom),
          tabBarHeight: layout.tabBarHeight,
          lastViewportH: dbgViewportHRef.current,
        });
      });
    });
    return () => task.cancel();
  }, [mainState, dbgWin.width, dbgWin.height, insets.top, insets.bottom]);

  // ⚠️ [임시 계측] 키보드 show/hide와 viewport 높이 변화 상관 확인. isKeyboardVisible은
  // 튜토리얼 자동 시작 조건(키보드가 떠 있으면 시작 안 함)에도 재사용한다.
  useEffect(() => {
    const onShow = (e: any) => {
      setIsKeyboardVisible(true);
      dbg("kbShow", {
        mainState,
        showMemoPreview,
        kbH: r1(e?.endCoordinates?.height ?? 0),
        lastViewportH: dbgViewportHRef.current,
      });
    };
    const onHide = () => {
      setIsKeyboardVisible(false);
      dbg("kbHide", {
        mainState,
        showMemoPreview,
        lastViewportH: dbgViewportHRef.current,
      });
    };
    const s1 = Keyboard.addListener("keyboardDidShow", onShow);
    const s2 = Keyboard.addListener("keyboardDidHide", onHide);
    return () => {
      s1.remove();
      s2.remove();
    };
  }, [mainState, showMemoPreview]);

  // 계정 설정을 조회한다 — 알림 팝업 노출 여부(notificationPromptSeen)와 튜토리얼 버전
  // (mainTutorialVersion/mainCompletedTutorialVersion) 판단에 모두 이 하나의 조회 결과를
  // 쓴다(별도 settings API/조회를 중복으로 만들지 않는다). 알림 팝업이 필요하면 여기서
  // setShowNotificationModal(true)로 먼저 열고, 튜토리얼 자동 시작 effect는 이 모달이
  // 완전히 닫힐 때까지(showNotificationModal===false) 대기하므로 순서가 자연히 보장된다.
  // 조회 실패 시 settings는 null로 남아 알림 팝업도 튜토리얼도 열지 않는다(버전 0으로
  // 추정해 강제로 띄우지 않는다).
  useEffect(() => {
    getMySettings()
      .then((data) => {
        setSettings(data);
        if (!data.notificationPromptSeen) {
          setShowNotificationModal(true);
        }
      })
      .catch((error) => {
        console.error("설정 조회 실패:", error);
      });
  }, []);

  const streakCount = weeklyStreak?.currentStreak ?? DUMMY_STREAK;
  const todayDayIndex = weeklyStreak?.todayDayIndex ?? DUMMY_TODAY_DAY_INDEX;
  const completedDays =
    weeklyStreak?.days.map((day) => day.completed) ?? DUMMY_COMPLETED_DAYS;
  // TODO: API 연결 전 더미 흐름 — completion.tsx에서 확인 버튼을 누르면 completed/taskContent 파라미터를 넘겨받는다.
  // router.replace로 이 화면이 remount될 경우 taskContent local state가 초기화되므로,
  // completed와 함께 넘어온 taskContent param으로 복구한다. 전역 store 도입 전 임시 조치.
  const {
    completed,
    taskContent: taskContentParam,
    completedCount: completedCountParam,
  } = useLocalSearchParams<{
    completed?: string;
    taskContent?: string;
    completedCount?: string | string[];
  }>();

  // completion 화면이 넘겨준 완료 개수 — 양의 정수만 허용(그 외 null). 서버 재조회 전 즉시 표시용.
  const rawCompletedCountParam = Array.isArray(completedCountParam)
    ? completedCountParam[0]
    : completedCountParam;
  const parsedCompletedCountParam = Number(rawCompletedCountParam);
  const initialCompletedCount =
    Number.isInteger(parsedCompletedCountParam) && parsedCompletedCountParam >= 1
      ? parsedCompletedCountParam
      : null;

  useEffect(() => {
    if (completed) {
      setMainState("completed");
      if (taskContentParam) {
        setTaskContent(taskContentParam);
      }
      // route param으로 온 정확한 개수를 즉시 세워 "0개"/잘못된 값 플래시를 막는다.
      if (initialCompletedCount !== null) {
        setCompletedCount(initialCompletedCount);
      }
      router.setParams({
        completed: undefined,
        taskContent: undefined,
        completedCount: undefined,
      });
    }
  }, [completed, taskContentParam, initialCompletedCount]);

  // API 연결 8단계 — mainState는 이제 "오늘 daily record에 첫 완료가 있었는가"가 아니라
  // "지금 화면에 보여줄 task(currentTask 또는 그 자리의 완료 snapshot)가 완료됐는가"를 기준으로 판단한다.
  // (completed 복귀 시 아래 focus effect와 겹쳐 getToday가 한 번 더 불릴 수 있으나,
  //  결과가 항상 서버 진짜 상태와 일치하므로 허용한다)
  const syncTodayState = useCallback(async () => {
    dbg("sync:start", {}); // ⚠️ [임시 계측]
    try {
      const data = await getToday();
      dbg("sync:data", {
        hasCurrentTask: data.currentTask !== null,
        completedCount: data.completedTasks.length,
      }); // ⚠️ [임시 계측]
      lastSyncedDateRef.current = getKstDateKey();
      // 서버 응답이 완료 개수의 최종 진실 소스 — 매 동기화마다 확정한다(empty면 0이지만
      // 그 경우 아래에서 mainState가 empty가 되어 CompletionMessage는 렌더되지 않는다).
      setCompletedCount(data.completedTasks.length);
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
    } finally {
      // try 안의 각 분기가 return으로 빠져나가도 finally는 항상 실행된다 — 튜토리얼 자동
      // 시작 조건이 "최소 1회는 서버 진짜 mainState를 반영했는지"를 판단하는 유일한 신호.
      setMainDataLoaded(true);
    }
  }, []);

  useEffect(() => {
    syncTodayState();
  }, [completed, syncTodayState]);

  // API 연결 7단계 — 메모장 전체 화면 등 다른 라우트에서 오늘의 한 개를 바꾸고
  // 돌아왔을 때도 최신 서버 상태로 갱신되도록, 탭이 다시 focus될 때마다 재조회한다.
  useFocusEffect(
    useCallback(() => {
      dbg("focus", { lastOffsetY: dbgLastOffsetRef.current }); // ⚠️ [임시 계측]
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
            completedCount: await fetchTodayCompletedCountParam(),
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
          completedCount: await fetchTodayCompletedCountParam(),
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
    dbg("handleExtra", { mainState }); // ⚠️ [임시 계측]
    setShowMemoPreview(true);
  };

  const handleSelectMemoTask = async (memo: TaskResponse) => {
    dbg("selectMemo:start", { memoId: memo.id, mainState, showMemoPreview }); // ⚠️ [임시 계측]
    if (isSelectingMemoTask) return;
    setIsSelectingMemoTask(true);
    try {
      const data = await setTodayTask(memo.id);
      dbg("selectMemo:afterSetToday", { newTaskId: data.currentTask?.id }); // ⚠️ [임시 계측]
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
    // pushEnabled=false와 notificationPromptSeen=true를 한 번에 저장해야만
    // 팝업을 닫는다. 실패하면 재시도할 수 있도록 팝업을 유지한다.
    try {
      await updateMySettings({ pushEnabled: false, notificationPromptSeen: true });
    } catch (error) {
      console.error('푸시 알림 설정(OFF) 저장 실패:', error);
      Alert.alert('알림 설정 저장에 실패했습니다.', '다시 시도해주세요.');
      return;
    }
    setSettings((prev) => (prev ? { ...prev, pushEnabled: false, notificationPromptSeen: true } : prev));
    setShowNotificationModal(false);
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
        // 권한 거부/등록 실패면 registerForPushNotifications 내부에서 pushEnabled/notificationPromptSeen을
        // 저장하지 않으므로, 계정 생성 시 기본값(pushEnabled=true)이 그대로 남지 않도록 여기서 맞춘다.
        // 이 저장이 성공해야만 팝업을 닫는다.
        try {
          await updateMySettings({ pushEnabled: false, notificationPromptSeen: true });
        } catch (updateError) {
          console.error('푸시 알림 설정(OFF) 저장 실패:', updateError);
          Alert.alert('알림 설정 저장에 실패했습니다.', '다시 시도해주세요.');
          return;
        }
        setSettings((prev) => (prev ? { ...prev, pushEnabled: false, notificationPromptSeen: true } : prev));
      } else {
        // registerForPushNotifications가 이미 서버에 pushEnabled/notificationPromptSeen을
        // true로 저장했다 — 로컬 settings도 같은 값으로 맞춘다(재조회 없이).
        setSettings((prev) => (prev ? { ...prev, pushEnabled: true, notificationPromptSeen: true } : prev));
      }

      setShowNotificationModal(false);
    } finally {
      setRegisteringPush(false);
    }
  };

  // useCopilot()은 CopilotProvider(app/(tabs)/_layout.tsx) 하위에서만 호출 가능하다.
  //
  // [버그 수정] activeTourId를 설정한 직후 같은 함수 안에서 곧바로 start()를 호출하면 안 된다.
  // CopilotStep은 active=true가 된 뒤 자신의 useEffect에서 registerStep을 호출하므로
  // (비동기, 최소 한 렌더 이후), 그 시점의 start()는 아직 어떤 step도 등록되지 않은 상태를
  // 캡처해 호출된다. react-native-copilot은 step이 없으면 내부적으로 최대 120프레임 재시도
  // 후 에러 없이 조용히 return하므로 기존 try/catch로는 감지가 안 되고, Promise가 resolve됐다는
  // 이유만으로 setRunning(true)가 실행돼 "실행된 것처럼" 보였다.
  // → requestTour는 상태만 세팅하고, 실제 start() 호출은 totalStepsNumber가 기대치에
  //   도달한 뒤 별도 useEffect에서 그 시점의 최신 start를 사용해 수행한다.
  const { start, totalStepsNumber, copilotEvents } = useCopilot();
  const activeTourId = useTutorialStore((s) => s.activeTourId);
  const isRunning = useTutorialStore((s) => s.isRunning);
  const completionEvent = useTutorialStore((s) => s.completionEvent);
  const currentUserId = useUserStore((s) => s.user?.id);
  const startRequestedRef = useRef(false);
  // 계정+tour+요구 버전을 합친 키 — 같은 키로는 다시 requestTour를 호출하지 않는다.
  // userId가 키에 포함돼 있어 계정이 바뀌면(예: 로그아웃 후 다른 계정 로그인) 자연히
  // 다른 키가 되어 가드가 저절로 무효화된다(별도 초기화 코드 불필요).
  const requestedTourKeyRef = useRef<string | null>(null);

  const requestTour = (tourId: TutorialTourId) => {
    const state = useTutorialStore.getState();
    if (state.activeTourId !== null) {
      console.warn("튜토리얼이 이미 활성 상태입니다:", state);
      return;
    }
    startRequestedRef.current = false;
    state.setRunning(false);
    state.setActiveTourId(tourId);
  };

  // activeTourId가 설정된 뒤, 해당 tour의 step이 전부 등록됐을 때만(totalStepsNumber가
  // 기대치에 도달했을 때만) 그 시점의 최신 start를 호출한다.
  useEffect(() => {
    if (!activeTourId || isRunning || startRequestedRef.current) {
      return;
    }

    const expectedSteps =
      activeTourId === "main-empty" ? 3 : activeTourId === "main-completed" ? 1 : 0;

    if (totalStepsNumber !== expectedSteps) {
      return;
    }

    startRequestedRef.current = true;

    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        start().catch((error) => {
          console.error("튜토리얼 시작 실패:", error);
          startRequestedRef.current = false;
          useTutorialStore.getState().setRunning(false);
          useTutorialStore.getState().setActiveTourId(null);
        });
      });
    });
  }, [activeTourId, isRunning, totalStepsNumber, start]);

  // 실제 실행 여부는 start() Promise가 아니라 copilotEvents로 판단한다.
  // (react-native-copilot@3.3.3 .d.ts: Events = { start: undefined; stop: undefined;
  //  stepChange: Step | undefined }.)
  useEffect(() => {
    const handleStart = () => {
      useTutorialStore.getState().setRunning(true);
    };
    // [버그 수정] store 초기화의 "주" 경로는 이제 Adapter의 finishTour()다(그쪽이 stop()을
    // await한 뒤 결정적으로 초기화한다). 다만 stopOnOutsideClick(dim 영역 터치, __DEV__ 전용)처럼
    // Adapter를 거치지 않고 라이브러리 내부에서 곧바로 stop()이 호출되는 경로도 있어
    // (react-native-copilot dist 확인: handleMaskClick → handleStop → stop()), 이 리스너가
    // 그 경로의 유일한 초기화 지점이다. finishTour와 값이 겹쳐 두 번 세팅돼도 멱등이라 무해하다.
    // 이 경로는 markSeen을 거치지 않으므로 completionEvent를 발생시키지 않는다 — 개발 중
    // dim 영역을 눌러 종료한 경우까지 "시청 완료"로 서버에 저장하면 안 되기 때문이다.
    const handleStop = () => {
      startRequestedRef.current = false;
      useTutorialStore.getState().setRunning(false);
      useTutorialStore.getState().setActiveTourId(null);
    };

    copilotEvents.on("start", handleStart);
    copilotEvents.on("stop", handleStop);

    return () => {
      copilotEvents.off("start", handleStart);
      copilotEvents.off("stop", handleStop);
    };
  }, [copilotEvents]);

  // 메인 탭이 focus 상태인지 — 다른 탭을 보고 있을 때 튜토리얼이 뒤에서 시작되지 않게 한다.
  const isMainTabFocused = useIsFocused();

  // 튜토리얼 자동 시작의 공통 전제 조건. 여기 쓰는 상태는 전부 이미 이 화면에 존재하는
  // 값이다(새로 추측해서 만든 변수 없음): isNotificationFlowPending은 별도 상태로 만들지
  // 않았다 — NotificationPermissionModal은 그 안의 비동기 처리(등록/저장)가 끝나야만
  // setShowNotificationModal(false)가 호출되므로, showNotificationModal 하나만으로
  // "모달이 열려 있거나 그 처리가 진행 중"을 이미 충분히 나타낸다.
  const canStartTutorial =
    isMainTabFocused &&
    settings !== null &&
    mainDataLoaded &&
    !showNotificationModal &&
    !isKeyboardVisible &&
    !showMemoPreview &&
    activeTourId === null &&
    !isRunning;

  // main-empty(입력창/메모탭/메모장에서고르기)와 main-completed(한개더하기)는 mainState로
  // 이미 서로 배타적이다(둘 다 후보가 되는 상태가 없음) — 한 번에 하나만 요청된다.
  useEffect(() => {
    if (!canStartTutorial || !settings || !currentUserId) return;

    if (mainState === "empty" && settings.mainTutorialVersion < MAIN_TUTORIAL_VERSION) {
      const key = `${currentUserId}:main-empty:${MAIN_TUTORIAL_VERSION}`;
      if (requestedTourKeyRef.current !== key) {
        requestedTourKeyRef.current = key;
        requestTour("main-empty");
      }
      return;
    }

    if (mainState === "completed" && settings.mainCompletedTutorialVersion < MAIN_COMPLETED_TUTORIAL_VERSION) {
      const key = `${currentUserId}:main-completed:${MAIN_COMPLETED_TUTORIAL_VERSION}`;
      if (requestedTourKeyRef.current !== key) {
        requestedTourKeyRef.current = key;
        requestTour("main-completed");
      }
    }
  }, [canStartTutorial, settings, mainState, currentUserId]);

  // 튜토리얼 종료(HaruCopilotTooltipAdapter의 finishTour)가 markSeen=true로 남긴
  // completionEvent를 감지해 서버에 시청 완료를 저장한다. 로컬 settings는 PATCH 성공 여부와
  // 무관하게 먼저 갱신해(3), 같은 세션에서 같은 튜토리얼이 다시 자동 시작되지 않게 한다.
  // PATCH가 실패해도 현재 세션에서 즉시 재시도하지 않는다 — 다음 앱 실행 때 서버 값이
  // 여전히 이전 버전이면 그때 다시 자동 시작 대상이 되는 것으로 충분하다.
  useEffect(() => {
    if (!completionEvent) return;
    const { tourId } = completionEvent;
    // 탭 화면은 언마운트되지 않으므로 캘린더 등 다른 도메인의 완료 이벤트도 보일 수 있다.
    // 메인 화면은 자신이 소유한 두 tour만 소비하고, 나머지는 해당 화면이 처리하게 둔다.
    if (tourId !== "main-empty" && tourId !== "main-completed") return;
    useTutorialStore.getState().clearCompletion();

    const payload =
      tourId === "main-empty"
        ? { mainTutorialVersion: MAIN_TUTORIAL_VERSION }
        : { mainCompletedTutorialVersion: MAIN_COMPLETED_TUTORIAL_VERSION };

    setSettings((prev) => (prev ? { ...prev, ...payload } : prev));

    updateMySettings(payload)
      .then((updated) => setSettings(updated))
      .catch((error) => {
        console.error("튜토리얼 시청 완료 저장 실패:", error);
      });
  }, [completionEvent]);

  return (
    <LinearGradient colors={["#FFFFFF", "#E6F4FF"]} style={styles.gradient}>
      <View
        style={styles.safeArea}
        onLayout={(e) => dbg("L:safeArea", { ...e.nativeEvent.layout })} /* ⚠️ [임시 계측] */
      >
        <StatusBarSpacer />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          // [실제 수정] TextInput이 있는 empty/editing에서만 키보드 회피를 켠다.
          // selected/completed에서 KAV(behavior:height)가 가용 높이를 키보드 이력에 따라
          // 다르게 유지해 카드가 위/아래로 흔들리던 문제를 차단(원인).
          enabled={mainState === "empty" || mainState === "editing"}
          onLayout={(e) => dbg("L:KAV", { ...e.nativeEvent.layout })} /* ⚠️ [임시 계측] */
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View
              style={styles.container}
              onLayout={(e) => dbg("L:container", { ...e.nativeEvent.layout })} /* ⚠️ [임시 계측] */
            >
              <View
                ref={dbgHeaderRef}
                style={styles.headerOuter}
                onLayout={(e) => dbg("L:headerOuter", { ...e.nativeEvent.layout })} /* ⚠️ [임시 계측] */
              >
                <View style={styles.headerContent}>
                  <Text style={styles.dateLabel}>{today}</Text>
                  <StreakBadge count={streakCount} />
                </View>
              </View>

              <ScrollView
                ref={dbgScrollRef}
                style={styles.scrollFlex}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onLayout={(e) => {
                  dbgViewportHRef.current = r1(e.nativeEvent.layout.height);
                  dbg("scrollViewLayout", {
                    mainState,
                    x: r1(e.nativeEvent.layout.x),
                    y: r1(e.nativeEvent.layout.y),
                    w: r1(e.nativeEvent.layout.width),
                    h: r1(e.nativeEvent.layout.height),
                  });
                } /* ⚠️ [임시 계측] */}
                onScroll={(e) => {
                  const y = e.nativeEvent.contentOffset.y;
                  if (
                    dbgLastOffsetRef.current !== null &&
                    Math.abs(y - dbgLastOffsetRef.current) < 1
                  )
                    return;
                  dbgLastOffsetRef.current = y;
                  dbg("scroll", {
                    mainState,
                    y: r1(y),
                    vh: r1(e.nativeEvent.layoutMeasurement.height),
                    ch: r1(e.nativeEvent.contentSize.height),
                  });
                } /* ⚠️ [임시 계측] */}
                onContentSizeChange={(w, h) =>
                  dbg("contentSize", { mainState, w: r1(w), h: r1(h) })
                } /* ⚠️ [임시 계측] */
              >
                <View
                  ref={dbgMainContentRef}
                  style={styles.mainContent}
                  onLayout={(e) =>
                    dbg("mainContent", {
                      mainState,
                      y: r1(e.nativeEvent.layout.y),
                      h: r1(e.nativeEvent.layout.height),
                    })
                  } /* ⚠️ [임시 계측] */
                >
                {mainState === "empty" && (
                  <EmptyState
                    onSubmit={handleSubmitTask}
                    onChooseFromMemo={handleOpenMemoPreviewForSelect}
                  />
                )}

                {mainState === "selected" && (
                  <MainCardWithMemoLinkLayout
                    onChoosePress={handleOpenMemoPreviewForSelect}
                    onStageLayout={(y, h) => dbg("cardStage", { y, h })} /* ⚠️ [임시 계측] */
                  >
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

                {mainState === "completed" && completedCount !== null && completedCount > 0 && (
                  <CompletionMessage
                    taskContent={taskContent}
                    streakCount={streakCount}
                    todayDayIndex={todayDayIndex}
                    completedDays={completedDays}
                    completedCount={completedCount}
                    onExtra={handleExtra}
                  />
                )}
                </View>
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
  // 헤더 배경/전체폭은 유지하되(headerOuter), 실제 날짜·배지 내용(headerContent)만
  // 대형 화면에서 본문과 동일한 maxWidth로 중앙 정렬한다.
  headerOuter: {
    width: "100%",
    alignItems: "center",
  },
  headerContent: {
    width: "100%",
    maxWidth: 430,
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
    // 대형 화면에서 mainContent(maxWidth)를 가로 중앙 정렬한다.
    alignItems: "center",
    // 중앙 정렬 기준은 실제 탭바 safe area 포함 높이가 아니라 디자인 기준 tabBarHeight를 사용한다.
    // Android 탭바 자체의 safe area 처리는 app/(tabs)/_layout.tsx에서 별도로 한다.
    paddingBottom: layout.tabBarHeight,
  },
  // 실제 메인 콘텐츠 래퍼 — 대형 화면(>430px)에서만 폭을 maxWidth로 제한하고 중앙 정렬한다.
  // flex:1을 주지 않는다: ScrollView contentContainer 안의 flex:1은 높이를 뷰포트로 가둬
  //   긴 콘텐츠의 스크롤을 막고 잘림을 유발하므로, 세로 중앙정렬은 scrollContent가 담당한다.
  // 좌우 padding은 과거 scrollContent에 있던 것을 여기로 옮긴 것 — 두 곳 중복 금지.
  //   390px에서 inner 350 / 카드 342(기존 동일)를 유지하고, ScrollView 자체엔 좌우 padding이
  //   없어 카드 그림자(shadowRadius 24)는 전체폭 프레임 안에서 잘리지 않는다.
  mainContent: {
    width: "100%",
    maxWidth: 430,
    paddingHorizontal: spacing.xl,
  },
});

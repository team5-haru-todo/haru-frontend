import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import {
  getMonthlyCalendar,
  type CalendarRecord,
} from '@/src/api/calendar';
import { getStreak, type StreakSummary } from '@/src/api/record';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  InteractionManager,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/src/constants/colors';
import { logEvent } from '@/src/lib/analytics';
import { layout } from '@/src/constants/layout';
import { StatusBarSpacer } from '@/src/components/common/StatusBarSpacer';
import { getMySettings, updateMySettings } from '@/src/api/user';
import { useCopilot } from 'react-native-copilot';
import { TutorialTargetFrame } from '@/src/components/tutorial/TutorialTargetFrame';
import { calendarTutorialStepConfigs } from '@/src/components/calendar/tutorial/calendarTutorialConfigs';
import { useTutorialStore } from '@/src/store/tutorialStore';

const ICON_ARROW_LEFT = require('../../assets/images/Icon/Arrow_left.png');
const ICON_ARROW_RIGHT = require('../../assets/images/Icon/Arrow_right.png');
const ICON_CHECK_DONE = require('../../assets/images/Icon/Ic_Check.png');
const ICON_CHECK_EMPTY = require('../../assets/images/Icon/Ic_Check_Cal_Ip.png');

const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];
const DAYS_FULL = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
const TODO_SKELETONS = [0, 1];
const EMPTY_CALENDAR_RECORDS: CalendarRecord[] = [];

interface CalendarRequestState {
  monthKey: string;
  records: CalendarRecord[];
  loading: boolean;
  error: string | null;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

function getMonthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export default function CalendarScreen() {
  const isFocused = useIsFocused();
  const { start, totalStepsNumber, copilotEvents } = useCopilot();
  const activeTourId = useTutorialStore((state) => state.activeTourId);
  const isTutorialRunning = useTutorialStore((state) => state.isRunning);
  const completionEvent = useTutorialStore((state) => state.completionEvent);
  const tutorialCheckedRef = useRef(false);
  const startRequestedRef = useRef(false);
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const monthKey = getMonthKey(currentYear, currentMonth);
  const [calendarState, setCalendarState] = useState<CalendarRequestState>(() => ({
    monthKey,
    records: [],
    loading: true,
    error: null,
  }));
  const [streak, setStreak] = useState<StreakSummary | null>(null);
  const [streakLoading, setStreakLoading] = useState(true);
  const isCurrentMonthState = calendarState.monthKey === monthKey;
  const records = isCurrentMonthState ? calendarState.records : EMPTY_CALENDAR_RECORDS;
  const loading = !isCurrentMonthState || calendarState.loading;
  const error = isCurrentMonthState ? calendarState.error : null;

  useEffect(() => {
    const handleStart = () => useTutorialStore.getState().setRunning(true);
    const handleStop = () => {
      startRequestedRef.current = false;
      useTutorialStore.getState().setRunning(false);
      if (useTutorialStore.getState().activeTourId === 'calendar') {
        useTutorialStore.getState().setActiveTourId(null);
      }
    };
    copilotEvents.on('start', handleStart);
    copilotEvents.on('stop', handleStop);
    return () => {
      copilotEvents.off('start', handleStart);
      copilotEvents.off('stop', handleStop);
    };
  }, [copilotEvents]);

  // active=true가 렌더된 뒤 CopilotStep 두 개가 모두 등록되어야 start()를 호출할 수 있다.
  // 메인 튜토리얼과 동일하게 totalStepsNumber를 기준으로 기다려, 실기기에서 등록 전
  // start()가 조용히 무시되는 경합을 막는다.
  useEffect(() => {
    if (
      activeTourId !== 'calendar' ||
      isTutorialRunning ||
      startRequestedRef.current ||
      totalStepsNumber !== 2
    ) {
      return;
    }

    startRequestedRef.current = true;
    const interaction = InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        start().catch((requestError) => {
          console.error('캘린더 튜토리얼 시작 실패:', requestError);
          startRequestedRef.current = false;
          useTutorialStore.getState().setRunning(false);
          useTutorialStore.getState().setActiveTourId(null);
        });
      });
    });

    return () => interaction.cancel();
  }, [activeTourId, isTutorialRunning, start, totalStepsNumber]);

  useEffect(() => {
    if (!isFocused || loading || streakLoading || tutorialCheckedRef.current) return;
    tutorialCheckedRef.current = true;
    let cancelled = false;

    getMySettings()
      .then((settings) => {
        if (cancelled || settings.calendarTutorialSeen) return;
        const store = useTutorialStore.getState();
        if (store.activeTourId || store.isRunning) return;
        startRequestedRef.current = false;
        store.setRunning(false);
        store.setActiveTourId('calendar');
      })
      .catch((requestError) => {
        console.error('캘린더 튜토리얼 시작 실패:', requestError);
        useTutorialStore.getState().setActiveTourId(null);
      });

    return () => {
      cancelled = true;
    };
  }, [isFocused, loading, streakLoading]);

  useEffect(() => {
    if (completionEvent?.tourId !== 'calendar') return;
    useTutorialStore.getState().clearCompletion();
    updateMySettings({ calendarTutorialSeen: true }).catch((requestError) => {
      console.error('캘린더 튜토리얼 완료 저장 실패:', requestError);
    });
  }, [completionEvent]);

  // 탭 화면은 전환해도 언마운트되지 않아 다른 달을 보던 상태가 남는다.
  // 탭이 다시 focus될 때마다 오늘 기준 연/월/일로 되돌려, 캘린더에 들어오면 항상 이번 달이 보이게 한다.
  useFocusEffect(
    useCallback(() => {
      const now = new Date();
      setCurrentYear(now.getFullYear());
      setCurrentMonth(now.getMonth() + 1);
      setSelectedDay(now.getDate());
      logEvent('calendar_viewed');
    }, [])
  );

  useEffect(() => {
    let active = true;

    async function fetchCalendar() {
      setCalendarState({
        monthKey,
        records: [],
        loading: true,
        error: null,
      });

      try {
        const data = await getMonthlyCalendar(currentYear, currentMonth);

        if (active) {
          setCalendarState({
            monthKey,
            records: data,
            loading: false,
            error: null,
          });
        }
      } catch (requestError) {
        console.error('캘린더 조회 실패:', requestError);

        if (active) {
          setCalendarState({
            monthKey,
            records: [],
            loading: false,
            error: '인터넷 연결이 불안정해요.',
          });
        }
      }
    }

    fetchCalendar();

    return () => {
      active = false;
    };
  }, [currentYear, currentMonth, monthKey]);

  useEffect(() => {
    let active = true;

    getStreak()
      .then((data) => {
        if (active) setStreak(data);
      })
      .catch((requestError) => {
        console.error('스트릭 조회 실패:', requestError);
      })
      .finally(() => {
        if (active) setStreakLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const completedDays = useMemo(
    () => new Set(
      records
        .filter((record) => record.fireEarned)
        .map((record) => Number(record.date.slice(8, 10)))
    ),
    [records]
  );
  const monthlyCompletionCount = completedDays.size;

  const isToday = (day: number) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() + 1 &&
    currentYear === today.getFullYear();

  const goToPrevMonth = () => {
    if (currentMonth === 1) { setCurrentYear(y => y - 1); setCurrentMonth(12); }
    else setCurrentMonth(m => m - 1);
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) { setCurrentYear(y => y + 1); setCurrentMonth(1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDay(null);
  };

  const weeks = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);
    const cells: (number | null)[] = [
      ...Array(firstDayOfWeek).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    while (cells.length % 7 !== 0) cells.push(null);

    const calendarWeeks: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      calendarWeeks.push(cells.slice(i, i + 7));
    }
    return calendarWeeks;
  }, [currentYear, currentMonth]);

  const selectedDate = selectedDay
    ? `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null;
  const selectedRecord = selectedDate
    ? records.find((record) => record.date === selectedDate)
    : undefined;
  const selectedTodos = useMemo(
    () => selectedRecord?.completedTasks.map((task) => ({
      id: task.completionId,
      text: task.content,
    })) ?? [],
    [selectedRecord]
  );
  const selectedCompletedCount = selectedTodos.length;

  const selectedDayName = selectedDay
    ? DAYS_FULL[new Date(currentYear, currentMonth - 1, selectedDay).getDay()].slice(0, 1) + '요일'
    : '';

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <StatusBarSpacer />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* NavBar: h=56, justify-between, border-bottom 2px #F7F7F7, px=20 */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={goToPrevMonth} style={styles.navArrow} activeOpacity={0.7}>
            <Image source={ICON_ARROW_LEFT} style={styles.navIcon} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>{currentYear}년 {currentMonth}월</Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.navArrow} activeOpacity={0.7}>
            <Image source={ICON_ARROW_RIGHT} style={styles.navIcon} />
          </TouchableOpacity>
        </View>

        {/* Card_AchieveSummary: gap=12, px=16, py=12, items-center, justify-center */}
        <TutorialTargetFrame
          stepConfig={calendarTutorialStepConfigs['calendar-summary']}
          active={activeTourId === 'calendar'}
          style={styles.statsCard}
        >
          <>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>이번 달 완료</Text>
            {loading ? (
              <View style={[styles.skeleton, styles.statValueSkeleton]} />
            ) : (
              <Text style={styles.statValue}>{monthlyCompletionCount}일</Text>
            )}
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>연속 달성</Text>
            {streakLoading ? (
              <View style={[styles.skeleton, styles.statValueSkeleton]} />
            ) : (
              <Text style={styles.statValue}>{streak?.currentStreak ?? 0}일</Text>
            )}
          </View>
          </>
        </TutorialTargetFrame>

        {/* Calendar_Section: flex-col gap=21, items-center, px=20, py=30, flex=1
            Content_Area gap=24 → marginTop=24 */}
        <TutorialTargetFrame
          stepConfig={calendarTutorialStepConfigs['calendar-grid']}
          active={activeTourId === 'calendar'}
          style={styles.calSection}
          accessibilityState={{ busy: loading }}
          accessibilityLabel={loading ? '캘린더 기록을 불러오는 중' : undefined}
        >
          <>
          {error && !loading && (
            <View style={styles.errorBanner}>
              <Text style={[styles.feedbackText, styles.errorText]}>{error}</Text>
            </View>
          )}

          {/* WeekdayHeader: flex-row, gap=10, items-center, justify-center, text-center */}
          <View style={styles.weekdayHeader}>
            {DAYS_KO.map(d => (
              <Text key={d} style={styles.weekdayText}>{d}</Text>
            ))}
          </View>

          {/* Calendar_Grid: flex-col, gap=10, items-center, justify-center */}
          <View style={styles.calGrid}>
            {weeks.map((week, wi) => {
              // TodayBadge: Figma → position absolute in Row_Week, centered over the
              // today column. Computed as a percentage of the row's own width (not a
              // fixed 390px-screen pixel value) so it stays centered on any device width.
              const todayColIdx = week.findIndex(
                (d) => d !== null && isToday(d as number)
              );

              return (
                // Row_Week: flex, items-center, align-self stretch, position relative
                <View key={wi} style={styles.weekRow}>
                  {/* TodayBadge: absolute in Row_Week, centered over today's column */}
                  {todayColIdx >= 0 && (
                    <View style={[
                      styles.todayBadgeWrap,
                      { left: `${((todayColIdx + 0.5) / 7) * 100}%`, marginLeft: -16, top: -11 },
                    ]}>
                      <View style={styles.todayBadge}>
                        <Text style={styles.todayText}>오늘</Text>
                      </View>
                      <View style={styles.todayTail} />
                    </View>
                  )}

                  {week.map((day, di) => {
                    if (!day) return <View key={di} style={[styles.stateCell, styles.emptyStateCell]} />;
                    const completed = completedDays.has(day);
                    const selected = selectedDay === day;

                    return (
                      <TouchableOpacity
                        key={di}
                        style={[styles.stateCell, selected && styles.stateCellSelected]}
                        onPress={() => setSelectedDay(day)}
                        activeOpacity={0.7}
                        disabled={loading}
                      >
                        {loading ? (
                          <View style={[styles.skeleton, styles.calendarIconSkeleton]} />
                        ) : (
                          <Image
                            source={completed ? ICON_CHECK_DONE : ICON_CHECK_EMPTY}
                            style={styles.checkIcon}
                          />
                        )}
                        <Text style={styles.dayNum}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </View>
          </>
        </TutorialTargetFrame>

        {/* Section_SelectedDay: marginTop=24, px=20, pt=16 */}
        {selectedDay !== null && (
          <View style={styles.selectedSection}>
            <View style={styles.dateHeaderRow}>
              <Text style={styles.dateHeaderText}>
                {currentMonth}.{selectedDay} {selectedDayName}
              </Text>
              {loading ? (
                <View style={[styles.skeleton, styles.dateCountSkeleton]} />
              ) : (
                <Text style={styles.dateCountText}>{selectedCompletedCount}개 완료</Text>
              )}
            </View>
            <View style={styles.todoList}>
              {loading ? TODO_SKELETONS.map((item) => (
                <View key={item} style={styles.todoSkeletonCard}>
                  <View style={[styles.skeleton, styles.todoTextSkeleton]} />
                  <View style={[styles.skeleton, styles.calendarIconSkeleton]} />
                </View>
              )) : selectedTodos.length > 0 ? selectedTodos.map(todo => (
                <View key={todo.id} style={styles.todoCard}>
                  <Text style={styles.todoText}>{todo.text}</Text>
                  <Image source={ICON_CHECK_DONE} style={styles.checkIcon} />
                </View>
              )) : (
                <Text style={styles.emptyText}>완료된 할 일이 없어요</Text>
              )}
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  // Figma navigation_bar 88px already includes the bottom safe-area region.
  scroll: { paddingBottom: layout.tabBarHeight },

  // NavBar: h=56, justify-between, px=20, py=14, border-bottom 2px #F7F7F7
  navBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#F7F7F7',
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  navArrow: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  navIcon: { width: 24, height: 24, resizeMode: 'contain' },
  navTitle: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: colors.text.primary,
    letterSpacing: -0.5,
    lineHeight: 26,
  },

  // Card_AchieveSummary: gap=12, px=16, py=12, items-center, justify-center
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  // Stat cell: flex=1, flex-col, gap=10, items-center, justify-center, p=10
  statCell: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 10,
  },
  statLabel: {
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    color: colors.text.primary,
    lineHeight: 24,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: colors.text.primary,
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  // 분리선: w=0.5, h=100, #E0E0E0
  statDivider: { width: 0.5, height: 100, backgroundColor: '#E0E0E0' },

  // Calendar_Section: flex-col, gap=21, items-center, px=20, py=30, flex=1, align-self=stretch
  // Content_Area gap=24 → marginTop=24 between statsCard and calSection
  calSection: {
    flexDirection: 'column',
    gap: 21,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
    flex: 1,
    alignSelf: 'stretch',
    marginTop: 24,
    position: 'relative',
  },

  // WeekdayHeader: flex-row, gap=10, items-center, justify-center, text-center
  weekdayHeader: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  weekdayText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    color: colors.text.primary,
    lineHeight: 24,
    textAlign: 'center',
  },

  // Calendar_Grid: flex-col, gap=10, items-center, justify-center, align-self=stretch
  calGrid: {
    flexDirection: 'column',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },

  // Row_Week: flex, items-center, align-self stretch, position relative (for TodayBadge abs)
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    position: 'relative',
  },

  // State (DateCell): flex-col, gap=3, items-center, justify-center, py=4
  // flex-[1_0_0] min-w-px — no explicit height, determined by content
  // State: flex=1, flex-col, justify-center, items-center, gap=3, padding: 4px 0
  stateCell: {
    flex: 1,
    height: 51,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 3,
  },
  emptyStateCell: {
    height: 53,
  },
  stateCellSelected: {
    borderWidth: 1,
    borderColor: '#259BFF',
    borderRadius: 8,
  },

  // Ic_Check / Ic_Check_Cal_Ip: asset icon 24x24
  checkIcon: { width: 24, height: 24, resizeMode: 'contain' },

  // 날짜 숫자: Medium 12px, lineHeight 16, tertiary, text-center
  dayNum: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: colors.text.tertiary,
    lineHeight: 16,
    textAlign: 'center',
    width: '100%',
  },
  // TodayBadge: Figma position:absolute in Row_Week
  // w=32, flex-col, items-center
  // right: 309 - colIdx*50 (dynamic), top: -11
  todayBadgeWrap: {
    position: 'absolute',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 10,
    width: 32,
  },
  // Badge_Today: bg=#15171C, px=6, py=2, rounded=50px, items-center, justify-center
  todayBadge: {
    backgroundColor: '#15171C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  // Badge_Today text: Regular 11px, lineHeight 14, white, center
  todayText: {
    fontSize: 11,
    fontFamily: 'Pretendard-Regular',
    color: '#FFFFFF',
    lineHeight: 14,
    textAlign: 'center',
  },
  // Badge_Today_Tail: SVG 원본 4.33x3.75px → borderLeft/Right 2, borderTop 4
  todayTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#15171C',
  },

  // Section_SelectedDay: w=390, padding 16px 20px, flex-col, justify-center, align-items flex-end, gap=14
  // marginTop=24 는 Content_Area gap=24 대응
  selectedSection: {
    marginTop: 24,
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 14,
  },
  // Row_DateHeader: justify-between, align-center, align-self stretch
  dateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  // Row_DateHeader left: Medium 14px, lineHeight 20, #1A1A1A
  dateHeaderText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: '#1A1A1A',
    lineHeight: 20,
  },
  // Row_DateHeader right: 12px, lineHeight 16, tertiary
  dateCountText: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: colors.text.tertiary,
    lineHeight: 16,
  },
  dateCountSkeleton: {
    width: 48,
    height: 16,
    borderRadius: 4,
  },
  // List_CompletedTasks: flex-col, gap=8, align-self stretch, items-start
  todoList: {
    flexDirection: 'column',
    gap: 8,
    alignSelf: 'stretch',
    alignItems: 'flex-start',
  },
  // State (todo): bg=#E6F4FF, px=14, py=12, rounded=8, flex-row, gap=8, items-start, align-self stretch
  // height NOT explicit — determined by content (py=12+lineHeight24+py=12=48)
  todoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#E6F4FF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'stretch',
  },
  // Todo text: flex=1, Regular 16px, lineHeight 24, #259BFF, text-center
  todoText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: '#259BFF',
    lineHeight: 24,
    textAlign: 'center',
  },
  todoSkeletonCard: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface.sunken,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'stretch',
  },
  todoTextSkeleton: {
    flex: 1,
    height: 16,
    borderRadius: 4,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.placeholder,
    textAlign: 'center',
    paddingVertical: 20,
  },
  skeleton: {
    backgroundColor: colors.button.disabled,
  },
  statValueSkeleton: {
    width: 42,
    height: 26,
    borderRadius: 6,
  },
  calendarIconSkeleton: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  feedbackText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  errorBanner: {
    position: 'absolute',
    top: -18,
    left: 20,
    right: 20,
    zIndex: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#D14343',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
});

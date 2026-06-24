import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/src/constants/colors';

const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];
const DAYS_FULL = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

// Mock: 완료된 날짜들
const MOCK_COMPLETED: Record<string, number[]> = {
  '2026-6': [1, 8, 12, 15, 22, 29],
};

const MOCK_TODOS: Record<string, { id: number; text: string }[]> = {
  '2026-6-11': [
    { id: 1, text: '헬스장 등록하기' },
    { id: 2, text: '분리수거하기' },
  ],
  '2026-6-12': [
    { id: 1, text: '운동하기' },
    { id: 2, text: '독서하기' },
  ],
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

export default function CalendarScreen() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);
  const completedDays = MOCK_COMPLETED[`${currentYear}-${currentMonth}`] ?? [];

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

  // 날짜 배열: 첫 주 빈칸 + 날짜들
  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const selectedTodos =
    selectedDay ? (MOCK_TODOS[`${currentYear}-${currentMonth}-${selectedDay}`] ?? []) : [];

  const selectedDayName = selectedDay
    ? DAYS_FULL[new Date(currentYear, currentMonth - 1, selectedDay).getDay()].slice(0, 1) + '요일'
    : '';

  const streak = 3;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* NavBar: h=56, border-bottom 2px #F7F7F7, px=20 */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={goToPrevMonth} style={styles.navArrow} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>{currentYear}년 {currentMonth}월</Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.navArrow} activeOpacity={0.7}>
            <Ionicons name="chevron-forward" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Card_AchieveSummary: h=124, px=16 */}
        <View style={styles.statsCard}>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>이번 달 완료</Text>
            <Text style={styles.statValue}>{completedDays.length}일</Text>
          </View>
          {/* 분리선: w=0.5, h=100, #E0E0E0 */}
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>연속 달성</Text>
            <Text style={styles.statValue}>{streak}일</Text>
          </View>
        </View>

        {/* Calendar_Section: px=20, pt=30, pb=30 */}
        <View style={styles.calSection}>

          {/* WeekdayHeader: w=350, gap=10, Medium 16px, text-primary */}
          <View style={styles.weekdayHeader}>
            {DAYS_KO.map(d => (
              <Text key={d} style={styles.weekdayText}>{d}</Text>
            ))}
          </View>

          {/* Calendar_Grid: gap=10 between rows, marginTop=21 from header */}
          <View style={styles.calGrid}>
            {weeks.map((week, wi) => (
              <View key={wi} style={styles.weekRow}>
                {week.map((day, di) => {
                  if (!day) return <View key={di} style={styles.stateCell} />;
                  const todayDay = isToday(day);
                  const completed = completedDays.includes(day);
                  const selected = selectedDay === day;

                  return (
                    <TouchableOpacity
                      key={di}
                      style={styles.stateCell}
                      onPress={() => setSelectedDay(selected ? null : day)}
                      activeOpacity={0.7}
                    >
                      {/* 오늘 뱃지: 원 위에 말풍선 형태로 절대 위치 */}
                      {todayDay && (
                        <View style={styles.todayBadgeWrap}>
                          <View style={styles.todayBadge}>
                            <Text style={styles.todayText}>오늘</Text>
                          </View>
                          {/* Badge_Today_Tail: 아래를 가리키는 삼각형 */}
                          <View style={styles.todayTail} />
                        </View>
                      )}
                      {/* 체크 원: outer 24px, inner circle */}
                      <View style={styles.checkOuter}>
                        <View style={[
                          styles.checkInner,
                          completed && styles.checkDone,
                          !completed && selected && styles.checkSelected,
                          !completed && !selected && styles.checkEmpty,
                        ]}>
                          {completed && (
                            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                          )}
                        </View>
                      </View>
                      {/* 날짜 숫자: Medium 12px, tertiary */}
                      <Text style={[
                        styles.dayNum,
                        (completed || selected) && styles.dayNumActive,
                      ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        {/* Section_SelectedDay: marginTop=24, px=20, pt=16 */}
        {selectedDay !== null && (
          <View style={styles.selectedSection}>
            {/* Row_DateHeader: h=20 */}
            <View style={styles.dateHeaderRow}>
              <Text style={styles.dateHeaderText}>
                {currentMonth}.{selectedDay} {selectedDayName}
              </Text>
              <Text style={styles.dateCountText}>{selectedTodos.length}개 완료</Text>
            </View>

            {/* List_CompletedTasks: mt=14(50-16-20), gap=8 between cards */}
            <View style={styles.todoList}>
              {selectedTodos.length > 0 ? selectedTodos.map(todo => (
                <View key={todo.id} style={styles.todoCard}>
                  {/* Text: Regular 16px, lineHeight 24, #259BFF, line-through, flex=1 */}
                  <Text style={styles.todoText}>{todo.text}</Text>
                  {/* Component 2: 24x24 파란 원 + 체크 */}
                  <View style={styles.todoCheck}>
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>
                </View>
              )) : (
                <Text style={styles.emptyText}>완료된 할 일이 없어요</Text>
              )}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { paddingBottom: 96 },

  // NavBar: h=56, border-bottom 2px #F7F7F7, px=20, py=14
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
  navTitle: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: colors.text.primary,
    letterSpacing: -0.5,
    lineHeight: 26,
  },

  // Card_AchieveSummary: h=124, px=16, flex-row, center-aligned
  statsCard: {
    height: 124,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  statCell: {
    flex: 1,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  // Stat label: Medium 16px, lineHeight 24, text-primary
  statLabel: {
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    color: colors.text.primary,
    lineHeight: 24,
  },
  // Stat value: SemiBold 18px, lineHeight 26, letterSpacing -0.5
  statValue: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: colors.text.primary,
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  // 분리선: w=0.5, h=100
  statDivider: { width: 0.5, height: 100, backgroundColor: '#E0E0E0' },

  // Calendar_Section: px=20, pt=30, pb=30
  calSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
    width: '100%',
  },

  // WeekdayHeader: flex-row, gap=10, w=350 (within px=20 container)
  weekdayHeader: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  // WeekdayHeader text: Medium 16px, lineHeight 24, text-primary, center
  weekdayText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    color: colors.text.primary,
    lineHeight: 24,
    textAlign: 'center',
  },

  // Calendar_Grid: flex-col, gap=10, marginTop=21 from header
  calGrid: {
    marginTop: 21,
    gap: 10,
    width: '100%',
  },

  // Week Row: flex-row (7 cells each flex=1, no gap → each 50px)
  weekRow: {
    flexDirection: 'row',
    width: '100%',
  },

  // State cell: flex=1, h=51, flex-col, items-center, pt=4, gap=3
  // justifyContent: flex-start so today badge doesn't push circle up
  stateCell: {
    flex: 1,
    height: 51,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    gap: 3,
  },

  // 체크 원: outer 24x24
  checkOuter: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // inner circle: 20x20 (inset 2px = 8.33% of 24)
  checkInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: '#259BFF' },
  checkSelected: { borderWidth: 1, borderColor: '#259BFF', backgroundColor: 'transparent' },
  checkEmpty: { backgroundColor: '#F4F5F7' },

  // 날짜 숫자: Medium 12px, lineHeight 16, tertiary
  dayNum: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: colors.text.tertiary,
    lineHeight: 16,
    textAlign: 'center',
  },
  dayNumActive: { color: colors.text.primary },

  // 오늘 뱃지 컨테이너: 원 위에 절대 위치
  todayBadgeWrap: {
    position: 'absolute',
    top: -22,
    alignItems: 'center',
    zIndex: 10,
  },
  // Badge_Today: bg=#15171C, px=6, py=2, rounded=50, w=32
  todayBadge: {
    backgroundColor: '#15171C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 50,
    minWidth: 32,
    alignItems: 'center',
  },
  todayText: {
    fontSize: 11,
    fontFamily: 'Pretendard-Regular',
    color: '#FFFFFF',
    lineHeight: 14,
    textAlign: 'center',
  },
  // Badge_Today_Tail: 4.33x3.75px 아래를 향한 삼각형
  todayTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#15171C',
  },

  // Section_SelectedDay: marginTop=24, px=20, pt=16
  selectedSection: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // Row_DateHeader: flex-row, justify-between, h=20
  dateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  // 날짜 텍스트: Medium 14px, lineHeight 20, #1A1A1A
  dateHeaderText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: '#1A1A1A',
    lineHeight: 20,
  },
  // 완료 개수: Regular 12px, lineHeight 16, tertiary
  dateCountText: {
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.tertiary,
    lineHeight: 16,
  },

  // List_CompletedTasks: marginTop=14, gap=8
  todoList: { marginTop: 14, gap: 8, width: '100%' },

  // State (todo card): h=48, bg=#E6F4FF, px=14, py=12, rounded=8, gap=8, items-start
  todoCard: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E6F4FF',
    paddingHorizontal: 14,
    borderRadius: 8,
    width: '100%',
  },
  // Todo 텍스트: Regular 16px, lineHeight 24, #259BFF, line-through, flex=1
  todoText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: '#259BFF',
    lineHeight: 24,
    textDecorationLine: 'line-through',
  },
  // Component 2: 24x24 파란 원
  todoCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#259BFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.placeholder,
    textAlign: 'center',
    paddingVertical: 20,
  },
});

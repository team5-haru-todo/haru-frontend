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

const MOCK_COMPLETED: Record<string, number[]> = {
  '2026-6': [1, 8, 12, 15, 22, 29],
};

const MOCK_TODOS: Record<string, { id: number; text: string }[]> = {
  '2026-6-11': [
    { id: 1, text: '헬스장 등록하기' },
    { id: 2, text: '분리수거하기' },
    { id: 3, text: '독서 30분' },
  ],
  '2026-6-12': [
    { id: 1, text: '운동하기' },
    { id: 2, text: '독서하기' },
  ],
  '2026-6-24': [
    { id: 1, text: '오늘의 할 일 완료' },
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

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const selectedTodos =
    selectedDay ? (MOCK_TODOS[`${currentYear}-${currentMonth}-${selectedDay}`] ?? []) : [];

  const selectedDayOfWeek = selectedDay
    ? DAYS_FULL[new Date(currentYear, currentMonth - 1, selectedDay).getDay()].slice(0, 1) + '요일'
    : '';

  const streak = 3;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* NavBar — h=56, border-bottom 2px #F7F7F7, px=20 */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={goToPrevMonth} style={styles.navArrow} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>{currentYear}년 {currentMonth}월</Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.navArrow} activeOpacity={0.7}>
            <Ionicons name="chevron-forward" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Card_AchieveSummary — px=16, py=12, gap=12 */}
        <View style={styles.statsCard}>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>이번 달 완료</Text>
            <Text style={styles.statValue}>{completedDays.length}일</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>연속 달성</Text>
            <Text style={styles.statValue}>{streak}일</Text>
          </View>
        </View>

        {/* Calendar_Section — px=20, py=30, gap=21 */}
        <View style={styles.calendarSection}>

          {/* WeekdayHeader — gap=10, Medium 16px, text-primary */}
          <View style={styles.weekdayHeader}>
            {DAYS_KO.map(d => (
              <Text key={d} style={styles.weekdayText}>{d}</Text>
            ))}
          </View>

          {/* Calendar_Grid — gap=10 between rows */}
          <View style={styles.calendarGrid}>
            {weeks.map((week, wi) => (
              <View key={wi} style={styles.weekRow}>
                {week.map((day, di) => {
                  if (!day) return <View key={di} style={styles.dayCell} />;
                  const todayDay = isToday(day);
                  const completed = completedDays.includes(day);
                  const selected = selectedDay === day;

                  return (
                    <TouchableOpacity
                      key={di}
                      style={styles.dayCell}
                      onPress={() => setSelectedDay(selected ? null : day)}
                      activeOpacity={0.7}
                    >
                      {/* Outer 24px, inner 20px circle */}
                      <View style={styles.dayCircleOuter}>
                        <View style={[
                          styles.dayCircleInner,
                          completed && styles.dayCircleCompleted,
                          !completed && selected && styles.dayCircleSelected,
                          !completed && !selected && styles.dayCircleEmpty,
                        ]}>
                          {completed && (
                            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                          )}
                        </View>
                      </View>

                      {/* Day number — Medium 12px, lineHeight 16, tertiary */}
                      <Text style={[
                        styles.dayNumber,
                        (completed || selected) && styles.dayNumberActive,
                      ]}>
                        {day}
                      </Text>

                      {/* 오늘 badge — bg=#15171C, px=6, py=2, rounded=50, Regular 11px white */}
                      {todayDay && (
                        <View style={styles.todayBadge}>
                          <Text style={styles.todayBadgeText}>오늘</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        {/* Section_SelectedDay — px=20, py=16, gap=14 */}
        {selectedDay !== null && (
          <View style={styles.detailSection}>
            {/* Row_DateHeader */}
            <View style={styles.dateHeaderRow}>
              <Text style={styles.dateHeaderText}>
                {currentMonth}.{selectedDay} {selectedDayOfWeek}
              </Text>
              <Text style={styles.dateCountText}>{selectedTodos.length}개 완료</Text>
            </View>

            {/* List_CompletedTasks — gap=8 */}
            <View style={styles.todoList}>
              {selectedTodos.length > 0 ? selectedTodos.map(todo => (
                <View key={todo.id} style={styles.todoCard}>
                  {/* Regular 16px, lineHeight 24, #259BFF, line-through, center, flex=1 */}
                  <Text style={styles.todoText}>{todo.text}</Text>
                  {/* Component2: 24x24 filled blue circle with check */}
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
  scrollContent: { paddingBottom: 96 },

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
  },
  navArrow: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  navTitle: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: colors.text.primary,
    letterSpacing: -0.5,
    lineHeight: 26,
  },

  // Card_AchieveSummary: flex-row, gap=12, px=16, py=12
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
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
  // Divider: w=0.5, h=100, #E0E0E0
  statDivider: { width: 0.5, height: 100, backgroundColor: '#E0E0E0' },

  // Calendar_Section: flex-col, gap=21, px=20, py=30
  calendarSection: {
    flexDirection: 'column',
    gap: 21,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },

  // WeekdayHeader: flex-row, gap=10
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

  // Calendar_Grid: flex-col, gap=10
  calendarGrid: { flexDirection: 'column', gap: 10, width: '100%' },

  // Week Row
  weekRow: { flexDirection: 'row', alignItems: 'center' },

  // Day Cell: flex=1, flex-col, gap=3, items-center, justify-center, py=4
  dayCell: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 4,
    minHeight: 53,
  },

  // Outer 24x24, inner 20x20
  dayCircleOuter: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleCompleted: { backgroundColor: '#259BFF' },
  dayCircleSelected: { borderWidth: 1, borderColor: '#259BFF', backgroundColor: 'transparent' },
  dayCircleEmpty: { backgroundColor: '#F4F5F7' },

  // Day number: Medium 12px, lineHeight 16, tertiary
  dayNumber: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: colors.text.tertiary,
    lineHeight: 16,
    textAlign: 'center',
    width: '100%',
  },
  dayNumberActive: { color: colors.text.primary },

  // 오늘 badge: bg=#15171C, px=6, py=2, rounded=50
  todayBadge: {
    backgroundColor: '#15171C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 50,
  },
  todayBadgeText: {
    fontSize: 11,
    fontFamily: 'Pretendard-Regular',
    color: '#FFFFFF',
    lineHeight: 14,
    textAlign: 'center',
  },

  // Section_SelectedDay: flex-col, gap=14, px=20, py=16
  detailSection: {
    flexDirection: 'column',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  // Row_DateHeader
  dateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateHeaderText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: '#1A1A1A',
    lineHeight: 20,
  },
  dateCountText: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: colors.text.tertiary,
    lineHeight: 16,
  },

  // List_CompletedTasks: gap=8
  todoList: { flexDirection: 'column', gap: 8 },

  // Todo card: bg=#E6F4FF, px=14, py=12, rounded=8, gap=8, items-start
  todoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#E6F4FF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
  },
  todoText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: '#259BFF',
    lineHeight: 24,
    textDecorationLine: 'line-through',
    textAlign: 'center',
  },
  // Component2: 24x24 blue circle + checkmark
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

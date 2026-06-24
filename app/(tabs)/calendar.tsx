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
  '2026-6': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 22, 29],
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
    if (currentMonth === 1) {
      setCurrentYear(y => y - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(m => m - 1);
    }
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(y => y + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(m => m + 1);
    }
    setSelectedDay(null);
  };

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const selectedTodos =
    selectedDay ? (MOCK_TODOS[`${currentYear}-${currentMonth}-${selectedDay}`] ?? []) : [];

  const selectedDayName = selectedDay
    ? DAYS_FULL[new Date(currentYear, currentMonth - 1, selectedDay).getDay()].slice(0, 1) + '요일'
    : '';

  const streak = 3;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* NavBar */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={goToPrevMonth} style={styles.navArrow} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>
            {currentYear}년 {currentMonth}월
          </Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.navArrow} activeOpacity={0.7}>
            <Ionicons name="chevron-forward" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>이번 달 완료</Text>
            <Text style={styles.statValue}>{completedDays.length}일</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>연속 달성</Text>
            <Text style={styles.statValue}>{streak}일</Text>
          </View>
        </View>

        {/* Day headers */}
        <View style={styles.dayHeaderRow}>
          {DAYS_KO.map(d => (
            <View key={d} style={styles.dayHeaderCell}>
              <Text style={styles.dayHeaderText}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
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
                    <View
                      style={[
                        styles.dayCircle,
                        completed && styles.dayCircleCompleted,
                        !completed && selected && styles.dayCircleSelected,
                        !completed && !selected && styles.dayCircleEmpty,
                      ]}
                    >
                      {completed && (
                        <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.dayNumber,
                        completed && styles.dayNumberCompleted,
                        !completed && selected && styles.dayNumberSelected,
                      ]}
                    >
                      {day}
                    </Text>
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

        {/* Selected date detail */}
        {selectedDay !== null && (
          <View style={styles.detailSection}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailDate}>
                {currentMonth}.{selectedDay} {selectedDayName}
              </Text>
              <Text style={styles.detailCount}>{selectedTodos.length}개 완료</Text>
            </View>
            {selectedTodos.length > 0 ? (
              selectedTodos.map(todo => (
                <View key={todo.id} style={styles.todoCard}>
                  <Text style={styles.todoText}>{todo.text}</Text>
                  <View style={styles.todoCheck}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noTodoText}>완료된 할 일이 없어요</Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.default,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // NavBar
  navBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F7F7',
    backgroundColor: colors.surface.default,
  },
  navArrow: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E9EC',
    backgroundColor: colors.surface.default,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: colors.text.tertiary,
    lineHeight: 16,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Pretendard-Bold',
    color: colors.text.primary,
    letterSpacing: -1,
    lineHeight: 32,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E8E9EC',
  },

  // Day headers
  dayHeaderRow: {
    flexDirection: 'row',
    paddingTop: 20,
    paddingBottom: 8,
    backgroundColor: colors.surface.default,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
  },
  dayHeaderText: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: colors.text.tertiary,
  },

  // Calendar grid
  calendarGrid: {
    backgroundColor: colors.surface.default,
    paddingBottom: 16,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    minHeight: 72,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleCompleted: {
    backgroundColor: colors.primary.default,
  },
  dayCircleSelected: {
    borderWidth: 1.5,
    borderColor: colors.primary.default,
    backgroundColor: 'transparent',
  },
  dayCircleEmpty: {
    backgroundColor: '#ECEDF0',
  },
  dayNumber: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.tertiary,
  },
  dayNumberCompleted: {
    color: colors.text.primary,
  },
  dayNumberSelected: {
    color: colors.primary.default,
    fontFamily: 'Pretendard-Medium',
  },
  todayBadge: {
    marginTop: 4,
    backgroundColor: '#15171C',
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  todayBadgeText: {
    fontSize: 10,
    fontFamily: 'Pretendard-Regular',
    color: '#FFFFFF',
  },

  // Detail section
  detailSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E8E9EC',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailDate: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: colors.text.primary,
  },
  detailCount: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.tertiary,
  },
  todoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  todoText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: colors.primary.default,
  },
  todoCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  noTodoText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.placeholder,
    textAlign: 'center',
    paddingVertical: 24,
  },
});

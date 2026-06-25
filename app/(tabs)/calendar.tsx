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

        {/* NavBar: h=56, justify-between, border-bottom 2px #F7F7F7, px=20 */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={goToPrevMonth} style={styles.navArrow} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>{currentYear}년 {currentMonth}월</Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.navArrow} activeOpacity={0.7}>
            <Ionicons name="chevron-forward" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Card_AchieveSummary: gap=12, px=16, py=12, items-center, justify-center */}
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

        {/* Calendar_Section: flex-col gap=21, items-center, px=20, py=30, flex=1
            Content_Area gap=24 → marginTop=24 */}
        <View style={styles.calSection}>

          {/* WeekdayHeader: flex-row, gap=10, items-center, justify-center, text-center */}
          <View style={styles.weekdayHeader}>
            {DAYS_KO.map(d => (
              <Text key={d} style={styles.weekdayText}>{d}</Text>
            ))}
          </View>

          {/* Calendar_Grid: flex-col, gap=10, items-center, justify-center */}
          <View style={styles.calGrid}>
            {weeks.map((week, wi) => {
              // TodayBadge: Figma → position absolute in Row_Week
              // right: 309 - colIndex*50 (Row 350px, cell 50px, badge 32px)
              // top: -11px
              const todayColIdx = week.findIndex(
                (d) => d !== null && isToday(d as number)
              );

              return (
                // Row_Week: flex, items-center, align-self stretch, position relative
                <View key={wi} style={styles.weekRow}>
                  {/* TodayBadge: absolute in Row_Week, Figma: right=309-colIdx*50, top=-11 */}
                  {todayColIdx >= 0 && (
                    <View style={[
                      styles.todayBadgeWrap,
                      { right: 309 - todayColIdx * 50, top: -11 },
                    ]}>
                      <View style={styles.todayBadge}>
                        <Text style={styles.todayText}>오늘</Text>
                      </View>
                      <View style={styles.todayTail} />
                    </View>
                  )}

                  {week.map((day, di) => {
                    if (!day) return <View key={di} style={styles.stateCell} />;
                    const completed = completedDays.includes(day);
                    const selected = selectedDay === day;

                    return (
                      <TouchableOpacity
                        key={di}
                        style={styles.stateCell}
                        onPress={() => setSelectedDay(selected ? null : day)}
                        activeOpacity={0.7}
                      >
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
              );
            })}
          </View>
        </View>

        {/* Section_SelectedDay: marginTop=24, px=20, pt=16 */}
        {selectedDay !== null && (
          <View style={styles.selectedSection}>
            <View style={styles.dateHeaderRow}>
              <Text style={styles.dateHeaderText}>
                {currentMonth}.{selectedDay} {selectedDayName}
              </Text>
              <Text style={styles.dateCountText}>{selectedTodos.length}개 완료</Text>
            </View>
            <View style={styles.todoList}>
              {selectedTodos.length > 0 ? selectedTodos.map(todo => (
                <View key={todo.id} style={styles.todoCard}>
                  <Text style={styles.todoText}>{todo.text}</Text>
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
  stateCell: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 3,
    position: 'relative',
  },

  // Ic_Check_Cal / Ip: outer size=24, inner inset=8.33% (2px), rounded=50px
  checkOuter: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Ic_Check_Cal: bg=#259BFF (completed)
  checkDone: { backgroundColor: '#259BFF' },
  // Selected: border 1px #259BFF
  checkSelected: { borderWidth: 1, borderColor: '#259BFF', backgroundColor: 'transparent' },
  // Ic_Check_Cal_Ip: bg=#F4F5F7 (incomplete)
  checkEmpty: { backgroundColor: '#F4F5F7' },

  // 날짜 숫자: Medium 12px, lineHeight 16, tertiary, text-center
  dayNum: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: colors.text.tertiary,
    lineHeight: 16,
    textAlign: 'center',
    width: '100%',
  },
  dayNumActive: { color: colors.text.primary },

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
    fontFamily: 'Pretendard-Regular',
    color: colors.text.tertiary,
    lineHeight: 16,
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
  // Todo text: flex=1, Regular 16px, lineHeight 24, #259BFF, line-through, text-center
  todoText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: '#259BFF',
    lineHeight: 24,
    textDecorationLine: 'line-through',
    textAlign: 'center',
  },
  // Component 2: 24x24, bg=#259BFF, rounded=12
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

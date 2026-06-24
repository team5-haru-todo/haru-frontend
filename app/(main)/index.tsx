import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/src/constants/colors';
import { typography } from '@/src/constants/typography';
import { spacing } from '@/src/constants/layout';
import { EmptyState } from '@/src/components/main/EmptyState';
import { TodayTaskCard } from '@/src/components/main/TodayTaskCard';
import { CheckButton } from '@/src/components/main/CheckButton';
import { StreakBadge } from '@/src/components/main/StreakBadge';
import { CompletionCelebration } from '@/src/components/main/CompletionCelebration';
import { CompletionMessage } from '@/src/components/main/CompletionMessage';

type MainState = 'empty' | 'selected' | 'editing' | 'celebrating' | 'completed';

// TODO: 백엔드 record 도메인 API 명세 확정 후 실제 데이터로 교체
const DUMMY_STREAK = 3;
const DUMMY_TODAY_DAY_INDEX = 2; // 0=월 ~ 6=일, 2=수요일
const DUMMY_COMPLETED_DAYS = [true, true, true, false, false, false, false];


export default function MainScreen() {
  const [mainState, setMainState] = useState<MainState>('empty');
  const [taskContent, setTaskContent] = useState('');
  const [editingText, setEditingText] = useState('');

  const today = new Date().toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const handleSubmitTask = (text: string) => {
    setTaskContent(text);
    setMainState('selected');
  };

  const handlePressEdit = () => {
    setEditingText(taskContent);
    setMainState('editing');
  };

  const handleComplete = () => {
    // TODO: 백엔드 record 도메인 완료 처리 API 확정 후 연결
    if (mainState === 'editing' && editingText.trim()) {
      setTaskContent(editingText.trim());
    }
    setMainState('celebrating');
  };

  const handleBlurEdit = () => {
    // TODO: 백엔드 task/record 수정 API 확정 후 실제 저장 로직 연결
    if (editingText.trim()) {
      setTaskContent(editingText.trim());
    }
    setMainState('selected');
  };

  const handleShare = () => {
    // TODO: 카카오톡 공유 SDK 연동 후 실제 구현
  };

  const handleConfirm = () => {
    setMainState('completed');
  };

  const handleExtra = () => {
    // TODO: 추가 완료 화면 라우팅 연결
  };

  return (
    <LinearGradient
      colors={['#FFFFFF', '#E6F4FF']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.dateLabel}>{today}</Text>
            <StreakBadge count={DUMMY_STREAK} />
          </View>

          <View style={styles.body}>
            {mainState === 'empty' && (
              <EmptyState onSubmit={handleSubmitTask} />
            )}

            {mainState === 'selected' && (
              <View style={styles.taskArea}>
                <TodayTaskCard
                  content={taskContent}
                  isEditing={false}
                  onPressEdit={handlePressEdit}
                />
                <CheckButton onPress={handleComplete} />
              </View>
            )}

            {mainState === 'editing' && (
              <View style={styles.taskArea}>
                <TodayTaskCard
                  content={editingText}
                  isEditing={true}
                  onPressEdit={handlePressEdit}
                  onChangeText={setEditingText}
                  onBlur={handleBlurEdit}
                />
                <CheckButton onPress={handleComplete} />
              </View>
            )}

            {mainState === 'celebrating' && (
              <CompletionCelebration
                taskContent={taskContent}
                streakCount={DUMMY_STREAK}
                todayDayIndex={DUMMY_TODAY_DAY_INDEX}
                completedDays={DUMMY_COMPLETED_DAYS}
                onShare={handleShare}
                onConfirm={handleConfirm}
              />
            )}

            {mainState === 'completed' && (
              <CompletionMessage
                taskContent={taskContent}
                streakCount={DUMMY_STREAK}
                todayDayIndex={DUMMY_TODAY_DAY_INDEX}
                completedDays={DUMMY_COMPLETED_DAYS}
                onExtra={handleExtra}
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
      </SafeAreaView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  dateLabel: {
    ...typography.t2Title2,
    color: colors.text.primary,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: spacing.xxxl,
  },
  taskArea: {
    gap: spacing.lg,
    alignItems: 'center',
  },
});

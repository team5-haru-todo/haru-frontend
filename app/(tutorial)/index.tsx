import { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TutorialPage1 from '@/components/tutorial/TutorialPage1';
import TutorialPage2 from '@/components/tutorial/TutorialPage2';
import { HomeIndicatorSpacer } from '@/src/components/common/HomeIndicatorSpacer';
import { colors, spacing, typography } from '@/src/constants';
import { completeOnboarding } from '@/src/api/auth';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_PAGES = 2;

export default function TutorialScreen() {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const statusBarHeight = Math.max(insets.top, 54);

  const handleFinish = async () => {
    try {
      await completeOnboarding();
    } catch (error) {
      console.error('온보딩 완료 처리 실패:', error);
      // 실패해도 사용자 흐름은 막지 않음 (다음 로그인 때 다시 온보딩 뜰 수 있음)
    }
    router.replace('/(tabs)');
  };

  const handleNext = () => {
    if (activeIndex < TOTAL_PAGES - 1) {
      setActiveIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const content = (
    <>
      <View style={{ height: statusBarHeight }} />

      <View style={styles.pageArea}>
        {activeIndex === 0 && <TutorialPage1 isActive={activeIndex === 0} />}
        {activeIndex === 1 && <TutorialPage2 isActive={activeIndex === 1} />}
      </View>

      <View style={styles.bottomArea}>
        <View style={styles.dots}>
          {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>
      </View>

      <View style={styles.btnWrapper}>
        <TouchableOpacity style={styles.btnNext} activeOpacity={0.8} onPress={handleNext}>
          <Text style={styles.btnNextText}>
            {activeIndex === TOTAL_PAGES - 1 ? '시작하기' : '다음'}
          </Text>
        </TouchableOpacity>

        {/* 건너뛰기 - 게스트 로그인 버튼과 동일한 패턴 */}
        <TouchableOpacity style={styles.skipButton} activeOpacity={0.7} onPress={handleSkip}>
          <Text style={styles.skipText}>건너뛰기</Text>
        </TouchableOpacity>
      </View>

      <HomeIndicatorSpacer />
    </>
  );

  if (activeIndex === 0) {
    return (
      <LinearGradient
        colors={['#FFFFFF', colors.primary.light]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.96 }}
        style={styles.contentArea}
      >
        {content}
      </LinearGradient>
    );
  }

  return <View style={[styles.contentArea, { backgroundColor: '#FFFFFF' }]}>{content}</View>;
}

const styles = StyleSheet.create({
  contentArea: { flex: 1 },
  pageArea: { flex: 1, width: SCREEN_WIDTH },

  bottomArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: spacing.xl,
  },
  dots: { flexDirection: 'row', gap: 6 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border.default,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.primary.default,
  },

  btnWrapper: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
  },
  btnNext: {
    width: '100%',
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.primary.default,
    overflow: 'hidden',
  },
  btnNextText: { ...typography.b2BodyBold, color: '#FFFFFF' },

  skipButton: {
    padding: 8,
  },
  skipText: {
    ...typography.b4BodySm,
    color: colors.text.tertiary,
    textDecorationLine: 'underline',
  },
});
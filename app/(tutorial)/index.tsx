import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TutorialPage1 from '@/components/tutorial/TutorialPage1';
import TutorialPage2 from '@/components/tutorial/TutorialPage2';
import { HomeIndicatorSpacer } from '@/src/components/common/HomeIndicatorSpacer';
import { colors, spacing, typography } from '@/src/constants';
import { completeOnboarding } from '@/src/api/auth';
import { logEvent } from '@/src/lib/analytics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_PAGES = 2;

export default function TutorialScreen() {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const statusBarHeight = Math.max(insets.top, 54);

  useEffect(() => {
    logEvent('onboarding_started');
  }, []);

  const handleFinish = async (completionType: 'finished' | 'skipped') => {
    logEvent(completionType === 'skipped' ? 'onboarding_skipped' : 'onboarding_completed', {
      last_page_index: activeIndex,
    });
    try {
      await completeOnboarding();
    } catch (error) {
      console.error('온보딩 완료 처리 실패:', error);
      // 실패해도 사용자 흐름은 막지 않음 (다음 로그인 때 다시 온보딩 뜰 수 있음)
    }
    router.replace('/(tabs)');
  };

  // 버튼으로 페이지를 넘길 때도 스크롤 위치를 함께 맞춰서, 스와이프로 되돌아갔을 때와
  // 상태가 어긋나지 않도록 한다.
  const goToPage = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    setActiveIndex(index);
  };

  const handleNext = () => {
    if (activeIndex < TOTAL_PAGES - 1) {
      goToPage(activeIndex + 1);
    } else {
      handleFinish('finished');
    }
  };

  // 손가락 스와이프로 페이지가 바뀌었을 때(버튼이 아니라) activeIndex를 동기화한다.
  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <LinearGradient
      colors={['#FFFFFF', colors.primary.light]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0.96 }}
      style={styles.contentArea}
    >
      <View style={{ height: statusBarHeight }} />

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        style={styles.pageArea}
      >
        <TutorialPage1 isActive={activeIndex === 0} />
        <TutorialPage2 isActive={activeIndex === 1} />
      </ScrollView>

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
      </View>

      <HomeIndicatorSpacer />
    </LinearGradient>
  );
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
});
import { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import TutorialPage1 from '@/components/tutorial/TutorialPage1';
import TutorialPage2 from '@/components/tutorial/TutorialPage2';
import { HomeIndicatorSpacer } from '@/src/components/common/HomeIndicatorSpacer';
import { colors, spacing, typography } from '@/src/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TOTAL_PAGES = 2;

export default function TutorialScreen() {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);

  const isLastPage = activeIndex === TOTAL_PAGES - 1;

  const handleFinish = () => {
    router.replace('/(tabs)');
  };

  const handleNext = () => {
    if (activeIndex < TOTAL_PAGES - 1) {
      setActiveIndex((prev) => prev + 1);
      return;
    }

    handleFinish();
  };

  return (
    <LinearGradient
      colors={['#FFFFFF', colors.primary.light]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0.96 }}
      style={styles.contentArea}
    >
      <View style={{ height: Math.max(insets.top, 54) }} />

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
            {isLastPage ? '오늘 한개 시작해 볼까요?' : '다음'}
          </Text>
        </TouchableOpacity>
      </View>

      <HomeIndicatorSpacer />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  contentArea: {
    flex: 1,
  },

  pageArea: {
    flex: 1,
    width: SCREEN_WIDTH,
  },

  bottomArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: spacing.xl,
  },

  dots: {
    flexDirection: 'row',
    gap: 6,
  },

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
  },

  btnNext: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.primary.default,
    overflow: 'hidden',
  },

  btnNextText: {
    ...typography.b2BodyBold,
    color: '#FFFFFF',
  },
});
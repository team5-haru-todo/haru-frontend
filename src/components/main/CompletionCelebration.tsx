import { useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { colors } from '@/src/constants/colors';
import { typography } from '@/src/constants/typography';
import { spacing, radius } from '@/src/constants/layout';
import { StreakBadge } from './StreakBadge';
import { WeeklyStrip } from './WeeklyStrip';

type Props = {
  taskContent: string;
  streakCount: number;
  todayDayIndex: number;
  completedDays: boolean[];
  onShare: () => void;
  onConfirm: () => void;
};

export function CompletionCelebration({
  streakCount,
  todayDayIndex,
  completedDays,
  onShare,
  onConfirm,
}: Props) {
  const confettiRef = useRef<LottieView>(null);

  useEffect(() => {
    // check.json은 autoPlay로 즉시 재생
    // confetti.json은 check 시작 후 430ms 딜레이 후 재생
    const timer = setTimeout(() => {
      confettiRef.current?.play();
    }, 430);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Confetti_JSON: Content_Area 전체 오버레이, check 뒤에서 터짐 (zIndex 0) */}
      <LottieView
        ref={confettiRef}
        source={require('../../../assets/animations/confetti.json')}
        autoPlay={false}
        loop={false}
        style={styles.confettiLottie}
        webStyle={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 313, zIndex: 0 }}
        resizeMode="cover"
      />

      <Text style={styles.title}>오늘 한 개 완료!</Text>

      {/* Check_JSON: 130×130px, 화면 진입 즉시 재생 (zIndex 1) */}
      <LottieView
        source={require('../../../assets/animations/check.json')}
        autoPlay={true}
        loop={false}
        style={styles.checkLottie}
        webStyle={{ width: 130, height: 130 }}
      />

      <StreakBadge count={streakCount} />

      <WeeklyStrip todayDayIndex={todayDayIndex} completedDays={completedDays} />

      {/* TODO: 카카오톡 공유 SDK 연동 후 onShare 실제 구현 */}
      <TouchableOpacity style={styles.shareButton} onPress={onShare} activeOpacity={0.8}>
        <Image
          source={require('../../../assets/images/share.png')}
          style={styles.shareIcon}
          resizeMode="contain"
        />
        <Text style={styles.shareText}>공유하기</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.confirmButton} onPress={onConfirm} activeOpacity={0.8}>
        <Text style={styles.confirmText}>확인</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.lg,
    width: '100%',
    paddingVertical: spacing.xl,
  },
  confettiLottie: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 313,
    zIndex: 0,
    pointerEvents: 'none',
  },
  title: {
    ...typography.t1Title1,
    color: colors.primary.default,
    textAlign: 'center',
    zIndex: 1,
  },
  checkLottie: {
    width: 130,
    height: 130,
    zIndex: 1,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  shareIcon: {
    width: 20,
    height: 20,
    tintColor: colors.primary.default,
  },
  shareText: {
    ...typography.b2BodyMedium,
    color: colors.primary.default,
  },
  confirmButton: {
    backgroundColor: colors.primary.default,
    height: 54,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  confirmText: {
    ...typography.b2BodyBold,
    color: colors.surface.default,
  },
});

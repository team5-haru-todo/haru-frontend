import { colors } from '@/src/constants/colors';
import { typography } from '@/src/constants/typography';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

// SCR-003_2 진행 중 배지(Badge_Streak). 헤더의 StreakBadge("N일 연속 달성")와는 다른
// 컴포넌트라 혼동 방지를 위해 InProgressBadge로 명명한다.
// 파란 Dot만 opacity 1 → 0.3 → 1(각 600ms, 총 1200ms)로 무한 깜빡이고, 텍스트는 정적이다.
export function InProgressBadge() {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    // 언마운트/상태 전환 시 반복 애니메이션 자체를 멈추고 opacity를 기본값으로 되돌린다.
    return () => {
      animation.stop();
      opacity.setValue(1);
    };
  }, [opacity]);

  return (
    <View style={styles.badge}>
      <Animated.View style={[styles.dot, { opacity }]} />
      <Text style={styles.text} numberOfLines={1}>
        진행 중
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 108,
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 20,
    gap: 12,
    borderRadius: 50,
    backgroundColor: colors.surface.sunken,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary.default,
    flexShrink: 0,
  },
  text: {
    ...typography.b2BodyMedium,
    color: colors.text.secondary,
  },
});

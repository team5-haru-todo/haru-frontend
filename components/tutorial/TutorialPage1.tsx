import { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, typography, layout } from '@/src/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type BubbleData = {
  id: string;
  label: string;
  startLeft: number;
  startTop: number;
  pileTop: number;
  pileRotate: number;
  zIndex: number;
  popDelay: number;
  fallDelay: number;
};

const BUBBLES: BubbleData[] = [
  {
    id: 'plant',
    label: '화분에 물주기',
    startLeft: 92,
    startTop: 12,
    pileTop: 54,
    pileRotate: -3,
    zIndex: 1,
    popDelay: 0,
    fallDelay: 0,
  },
  {
    id: 'clean',
    label: '방 청소하기',
    startLeft: 100,
    startTop: 44,
    pileTop: 98,
    pileRotate: 4,
    zIndex: 2,
    popDelay: 420,
    fallDelay: 120,
  },
  {
    id: 'toeic',
    label: '토익 공부하기',
    startLeft: 42,
    startTop: 92,
    pileTop: 156,
    pileRotate: -6,
    zIndex: 3,
    popDelay: 840,
    fallDelay: 240,
  },
  {
    id: 'checkup',
    label: '건강검진 예약',
    startLeft: 166,
    startTop: 94,
    pileTop: 160,
    pileRotate: 7,
    zIndex: 4,
    popDelay: 1260,
    fallDelay: 360,
  },
  {
    id: 'laundry',
    label: '빨래 개기',
    startLeft: 30,
    startTop: 150,
    pileTop: 220,
    pileRotate: -4,
    zIndex: 5,
    popDelay: 1680,
    fallDelay: 480,
  },
  {
    id: 'book',
    label: '책 30쪽 읽기',
    startLeft: 178,
    startTop: 154,
    pileTop: 226,
    pileRotate: 5,
    zIndex: 6,
    popDelay: 2100,
    fallDelay: 600,
  },
];

const POP_SETTLE = 500;
const HOLD = 800;
const FALL_START_BASE = BUBBLES[BUBBLES.length - 1].popDelay + POP_SETTLE + HOLD;
const FALL_DURATION = 800;

function Bubble({ b, isActive }: { b: BubbleData; isActive: boolean }) {
  const scale = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (!isActive) {
      scale.value = 0;
      translateY.value = 0;
      rotate.value = 0;
      return;
    }

    scale.value = withDelay(
      b.popDelay,
      withSequence(
        withSpring(1.08, {
          damping: 7,
          stiffness: 180,
          mass: 0.6,
        }),
        withSpring(1, {
          damping: 9,
          stiffness: 160,
          mass: 0.6,
        })
      )
    );

    const fallDelay = FALL_START_BASE + b.fallDelay;
    const dy = b.pileTop - b.startTop;

    translateY.value = withDelay(
      fallDelay,
      withSequence(
        withTiming(dy * 0.82, {
          duration: FALL_DURATION * 0.72,
          easing: Easing.in(Easing.quad),
        }),
        withTiming(dy, {
          duration: FALL_DURATION * 0.28,
          easing: Easing.bounce,
        })
      )
    );

    rotate.value = withDelay(
      fallDelay,
      withTiming(b.pileRotate, {
        duration: FALL_DURATION,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          left: b.startLeft,
          top: b.startTop,
          zIndex: b.zIndex,
          elevation: b.zIndex + 6,
        },
        animatedStyle,
      ]}
    >
      <Text style={styles.bubbleLabel}>{b.label}</Text>
    </Animated.View>
  );
}

export default function TutorialPage1({ isActive }: { isActive: boolean }) {
  return (
    <View style={[styles.container, { width: SCREEN_WIDTH }]}>
      <View style={styles.topArea}>
        <Text style={styles.title}>
          {'너무 많은 계획들 때문에\n시작도 하기 전에 지쳐버린 적 있나요?'}
        </Text>
      </View>

      <View style={styles.spacer} />

      <View style={styles.bubblePlayArea}>
        {BUBBLES.map((b) => (
          <Bubble key={b.id} b={b} isActive={isActive} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  topArea: {
    paddingTop: 76,
    paddingBottom: 20,
    paddingHorizontal: layout.margin,
    alignItems: 'center',
  },

  title: {
    ...typography.t1Title1,
    color: colors.text.primary,
    textAlign: 'center',
  },

  spacer: {
    flex: 1,
  },

  bubblePlayArea: {
    height: 340,
    position: 'relative',
    overflow: 'visible',
    marginBottom: 8,
  },

  bubble: {
    position: 'absolute',
    width: 160,
    height: 48,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary.default,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },

  bubbleLabel: {
    ...typography.b2BodyMedium,
    color: colors.text.primary,
  },
});
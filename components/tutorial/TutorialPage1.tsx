import { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, typography, layout } from '@/src/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BUBBLE_AREA_HEIGHT = 360;

type BubbleData = {
  id: string;
  label: string;
  scatterLeft: number;
  scatterTop: number;
  pileLeft: number;
  pileTop: number;
  pileRotate: number;
  popDelay: number;
  fallDelay: number;
};

const BUBBLES: BubbleData[] = [
  { id: 'plant', label: '화분에 물주기', scatterLeft: 20, scatterTop: 20, pileLeft: 40, pileTop: 130, pileRotate: -10, popDelay: 0, fallDelay: 0 },
  { id: 'clean', label: '방 청소하기', scatterLeft: 210, scatterTop: 0, pileLeft: 190, pileTop: 145, pileRotate: 6, popDelay: 100, fallDelay: 120 },
  { id: 'toeic', label: '토익 공부하기', scatterLeft: 200, scatterTop: 70, pileLeft: 30, pileTop: 205, pileRotate: -4, popDelay: 200, fallDelay: 240 },
  { id: 'checkup', label: '건강검진 예약', scatterLeft: 60, scatterTop: 180, pileLeft: 190, pileTop: 220, pileRotate: 9, popDelay: 300, fallDelay: 360 },
  { id: 'laundry', label: '빨래 개기', scatterLeft: 150, scatterTop: 220, pileLeft: 60, pileTop: 275, pileRotate: -7, popDelay: 400, fallDelay: 480 },
  { id: 'book', label: '책 30쪽 읽기', scatterLeft: 15, scatterTop: 280, pileLeft: 210, pileTop: 290, pileRotate: 5, popDelay: 500, fallDelay: 600 },
];

const POP_SETTLE = 500;
const HOLD = 500;
const FALL_START_BASE = BUBBLES[BUBBLES.length - 1].popDelay + POP_SETTLE + HOLD;
const SLOW_FALL_DURATION = 900;

function Bubble({ b, isActive }: { b: BubbleData; isActive: boolean }) {
  const scale = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (!isActive) {
      scale.value = 0;
      translateX.value = 0;
      translateY.value = 0;
      rotate.value = 0;
      return;
    }

    scale.value = withDelay(
      b.popDelay,
      withSpring(1, { damping: 8, stiffness: 180, mass: 0.6 })
    );

    const fallDelay = FALL_START_BASE + b.fallDelay;
    const dx = b.pileLeft - b.scatterLeft;
    const dy = b.pileTop - b.scatterTop;

    translateX.value = withDelay(
      fallDelay,
      withTiming(dx, {
        duration: SLOW_FALL_DURATION,
        easing: Easing.in(Easing.cubic),
      })
    );

    translateY.value = withDelay(
      fallDelay,
      withSequence(
        withTiming(dy * 0.6, {
          duration: SLOW_FALL_DURATION * 0.7,
          easing: Easing.in(Easing.quad),
        }),
        withTiming(dy, {
          duration: SLOW_FALL_DURATION * 0.3,
          easing: Easing.bounce,
        })
      )
    );

    rotate.value = withDelay(
      fallDelay,
      withTiming(b.pileRotate, {
        duration: SLOW_FALL_DURATION,
        easing: Easing.in(Easing.cubic),
      })
    );
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.bubble,
        { left: b.scatterLeft, top: b.scatterTop },
        animatedStyle,
      ]}
    >
      <Text style={styles.bubbleLabel}>{b.label}</Text>
    </Animated.View>
  );
}

export default function TutorialPage1({ isActive }: { isActive: boolean }) {
  return (
    <LinearGradient
      colors={['#FFFFFF', colors.primary.light]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0.96 }}
      style={[styles.container, { width: SCREEN_WIDTH }]}
    >
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
    </LinearGradient>
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
    height: BUBBLE_AREA_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 12,
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
    elevation: 6,
  },

  bubbleLabel: {
    ...typography.b2BodyMedium,
    color: colors.text.primary,
  },
});
import { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { colors, typography, layout } from '@/src/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BUBBLE_WIDTH = 160;
const BUBBLE_HEIGHT = 48;
const BUBBLE_AREA_HEIGHT = 340;

type BubbleData = {
  id: string;
  label: string;
  left: number;
  top: number;
  rotate: number;
  zIndex: number;
};

const PILE_BUBBLES: BubbleData[] = [
  { id: 'plant', label: '화분에 물주기', left: 92, top: 54, rotate: -3, zIndex: 1 },
  { id: 'clean', label: '방 청소하기', left: 100, top: 98, rotate: 4, zIndex: 2 },
  { id: 'toeic', label: '토익 공부하기', left: 42, top: 156, rotate: -6, zIndex: 3 },
  { id: 'checkup', label: '건강검진 예약', left: 166, top: 160, rotate: 7, zIndex: 4 },
  { id: 'laundry', label: '빨래 개기', left: 30, top: 220, rotate: -4, zIndex: 5 },
  { id: 'book', label: '책 30쪽 읽기', left: 178, top: 226, rotate: 5, zIndex: 6 },
];

const FOCUS_BUBBLE = PILE_BUBBLES[0];

const CENTER_LEFT = (SCREEN_WIDTH - BUBBLE_WIDTH) / 2;
const FOCUS_TOP = -18;

const TARGET_DX = CENTER_LEFT - FOCUS_BUBBLE.left;
const TARGET_DY = FOCUS_TOP - FOCUS_BUBBLE.top;

export default function TutorialPage2({ isActive }: { isActive: boolean }) {
  const focusX = useSharedValue(0);
  const focusY = useSharedValue(0);
  const focusScale = useSharedValue(1);
  const focusRotate = useSharedValue(FOCUS_BUBBLE.rotate);

  useEffect(() => {
    if (!isActive) {
      focusX.value = 0;
      focusY.value = 0;
      focusScale.value = 1;
      focusRotate.value = FOCUS_BUBBLE.rotate;
      return;
    }

    focusRotate.value = withDelay(
      500,
      withTiming(0, {
        duration: 700,
        easing: Easing.out(Easing.cubic),
      })
    );

    focusX.value = withDelay(
      500,
      withTiming(TARGET_DX, {
        duration: 700,
        easing: Easing.out(Easing.cubic),
      })
    );

    focusY.value = withDelay(
      500,
      withTiming(TARGET_DY, {
        duration: 700,
        easing: Easing.out(Easing.cubic),
      })
    );

    focusScale.value = withDelay(
      500,
      withTiming(1.12, {
        duration: 700,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [isActive, focusX, focusY, focusScale, focusRotate]);

  const focusStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: focusX.value },
      { translateY: focusY.value },
      { scale: focusScale.value },
      { rotate: `${focusRotate.value}deg` },
    ],
  }));

  return (
    <View style={[styles.container, { width: SCREEN_WIDTH }]}>
      <View style={styles.topArea}>
        <Text style={styles.title}>
          {"복잡한 생각은 접어두고\n오늘부터 '하루한개'만 해보세요"}
        </Text>
      </View>

      <View style={styles.spacer} />

      <View style={styles.bubblePlayArea}>
        {PILE_BUBBLES.map((b) =>
          b.id === FOCUS_BUBBLE.id ? null : (
            <View
              key={b.id}
              style={[
                styles.bubble,
                {
                  left: b.left,
                  top: b.top,
                  zIndex: b.zIndex,
                  elevation: b.zIndex + 6,
                  transform: [{ rotate: `${b.rotate}deg` }],
                },
              ]}
            >
              <Text style={styles.bubbleLabel}>{b.label}</Text>
            </View>
          )
        )}

        <Animated.View
          style={[
            styles.bubble,
            styles.focusBubble,
            {
              left: FOCUS_BUBBLE.left,
              top: FOCUS_BUBBLE.top,
            },
            focusStyle,
          ]}
        >
          <Text style={[styles.bubbleLabel, styles.focusBubbleLabel]}>
            {FOCUS_BUBBLE.label}
          </Text>
        </Animated.View>
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
    height: BUBBLE_AREA_HEIGHT,
    position: 'relative',
    overflow: 'visible',
    marginBottom: 8,
  },

  bubble: {
    position: 'absolute',
    width: BUBBLE_WIDTH,
    height: BUBBLE_HEIGHT,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary.default,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },

  focusBubble: {
    borderWidth: 1,
    borderColor: colors.primary.default,
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 20,
    zIndex: 20,
  },

  bubbleLabel: {
    ...typography.b2BodyMedium,
    color: colors.text.primary,
  },

  focusBubbleLabel: {
    color: colors.primary.default,
  },
});
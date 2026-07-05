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

type BubbleData = {
  id: string;
  label: string;
  left: number;
  top: number;
  rotate: number;
};

const PILE_BUBBLES: BubbleData[] = [
  { id: 'plant', label: '화분에 물주기', left: 40, top: 130, rotate: -10 },
  { id: 'clean', label: '방 청소하기', left: 190, top: 145, rotate: 6 },
  { id: 'toeic', label: '토익 공부하기', left: 30, top: 205, rotate: -4 },
  { id: 'checkup', label: '건강검진 예약', left: 190, top: 220, rotate: 9 },
  { id: 'laundry', label: '빨래 개기', left: 60, top: 275, rotate: -7 },
  { id: 'book', label: '책 30쪽 읽기', left: 210, top: 290, rotate: 5 },
];

const FOCUS_BUBBLE = PILE_BUBBLES[0];

const CENTER_LEFT = (SCREEN_WIDTH - BUBBLE_WIDTH) / 2;
const CENTER_TOP = 64;

const TARGET_DX = CENTER_LEFT - FOCUS_BUBBLE.left;
const TARGET_DY = CENTER_TOP - FOCUS_BUBBLE.top;

export default function TutorialPage2({ isActive }: { isActive: boolean }) {
  const focusX = useSharedValue(0);
  const focusY = useSharedValue(0);
  const focusScale = useSharedValue(1);
  const focusRotate = useSharedValue(FOCUS_BUBBLE.rotate);
  const titleOpacity = useSharedValue(0);

  useEffect(() => {
    if (!isActive) {
      focusX.value = 0;
      focusY.value = 0;
      focusScale.value = 1;
      focusRotate.value = FOCUS_BUBBLE.rotate;
      titleOpacity.value = 0;
      return;
    }

    focusRotate.value = withDelay(
      600,
      withTiming(0, {
        duration: 700,
        easing: Easing.out(Easing.cubic),
      })
    );

    focusX.value = withDelay(
      600,
      withTiming(TARGET_DX, {
        duration: 700,
        easing: Easing.out(Easing.cubic),
      })
    );

    focusY.value = withDelay(
      600,
      withTiming(TARGET_DY, {
        duration: 700,
        easing: Easing.out(Easing.cubic),
      })
    );

    focusScale.value = withDelay(
      600,
      withTiming(1.18, {
        duration: 700,
        easing: Easing.out(Easing.cubic),
      })
    );

    titleOpacity.value = withDelay(
      1200,
      withTiming(1, {
        duration: 500,
      })
    );
  }, [isActive]);

  const focusStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: focusX.value },
      { translateY: focusY.value },
      { scale: focusScale.value },
      { rotate: `${focusRotate.value}deg` },
    ],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  return (
    <View style={[styles.container, { width: SCREEN_WIDTH }]}>
      <View style={styles.topArea}>
        <Animated.Text style={[styles.title, titleStyle]}>
          {"복잡한 생각은 접어두고\n오늘부터 '하루한개'만 해보세요"}
        </Animated.Text>
      </View>

      <View style={styles.bubbleArea}>
        {PILE_BUBBLES.map((b) =>
          b.id === FOCUS_BUBBLE.id ? null : (
            <View
              key={b.id}
              style={[
                styles.bubble,
                {
                  left: b.left,
                  top: b.top,
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
          <Text style={styles.bubbleLabel}>{FOCUS_BUBBLE.label}</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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

  bubbleArea: {
    flex: 1,
    position: 'relative',
    overflow: 'visible',
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
    elevation: 6,
  },

  focusBubble: {
    zIndex: 10,
    shadowOpacity: 0.3,
    shadowRadius: 24,
  },

  bubbleLabel: {
    ...typography.b2BodyMedium,
    color: colors.text.primary,
  },
});
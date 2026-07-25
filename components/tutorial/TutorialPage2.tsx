import { useEffect } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import {
  colors,
  layout,
  typography,
} from '@/src/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BUBBLE_WIDTH = 160;
const BUBBLE_HEIGHT = 48;
const BUBBLE_AREA_HEIGHT = 340;

const GROUP_MIN_LEFT = 30;
const GROUP_MAX_RIGHT = 178 + BUBBLE_WIDTH;
const GROUP_WIDTH =
  GROUP_MAX_RIGHT - GROUP_MIN_LEFT;

const GROUP_OFFSET_X =
  (SCREEN_WIDTH - GROUP_WIDTH) / 2 -
  GROUP_MIN_LEFT;

type BubbleData = {
  id: string;
  label: string;
  left: number;
  top: number;
  rotate: number;
  zIndex: number;
};

type TutorialPage2Props = {
  isActive: boolean;
};

const PILE_BUBBLES: BubbleData[] = [
  {
    id: 'plant',
    label: '화분에 물주기',
    left: 92,
    top: 54,
    rotate: -3,
    zIndex: 1,
  },
  {
    id: 'clean',
    label: '방 청소하기',
    left: 100,
    top: 98,
    rotate: 4,
    zIndex: 2,
  },
  {
    id: 'toeic',
    label: '토익 공부하기',
    left: 42,
    top: 156,
    rotate: -6,
    zIndex: 3,
  },
  {
    id: 'checkup',
    label: '건강검진 예약',
    left: 166,
    top: 160,
    rotate: 7,
    zIndex: 4,
  },
  {
    id: 'laundry',
    label: '빨래 개기',
    left: 30,
    top: 220,
    rotate: -4,
    zIndex: 5,
  },
  {
    id: 'book',
    label: '책 30쪽 읽기',
    left: 178,
    top: 226,
    rotate: 5,
    zIndex: 6,
  },
];

const FOCUS_BUBBLE = PILE_BUBBLES[0];

const FOCUS_START_LEFT =
  FOCUS_BUBBLE.left + GROUP_OFFSET_X;

const CENTER_LEFT =
  (SCREEN_WIDTH - BUBBLE_WIDTH) / 2;

const FOCUS_TOP = -18;

const TARGET_DX =
  CENTER_LEFT - FOCUS_START_LEFT;

const TARGET_DY =
  FOCUS_TOP - FOCUS_BUBBLE.top;

export default function TutorialPage2({
  isActive,
}: TutorialPage2Props) {
  const focusX = useSharedValue(0);
  const focusY = useSharedValue(0);
  const focusScale = useSharedValue(1);

  const focusRotate = useSharedValue(
    FOCUS_BUBBLE.rotate,
  );

  const focusProgress = useSharedValue(0);
  const pileProgress = useSharedValue(0);

  useEffect(() => {
    if (!isActive) {
      focusX.value = 0;
      focusY.value = 0;
      focusScale.value = 1;
      focusRotate.value =
        FOCUS_BUBBLE.rotate;
      focusProgress.value = 0;
      pileProgress.value = 0;

      return;
    }

    const delay = 450;
    const moveDuration = 700;
    const easing =
      Easing.out(Easing.cubic);

    focusX.value = withDelay(
      delay,
      withTiming(TARGET_DX, {
        duration: moveDuration,
        easing,
      }),
    );

    focusY.value = withDelay(
      delay,
      withTiming(TARGET_DY, {
        duration: moveDuration,
        easing,
      }),
    );

    focusRotate.value = withDelay(
      delay,
      withTiming(0, {
        duration: moveDuration,
        easing,
      }),
    );

    focusProgress.value = withDelay(
      delay,
      withTiming(1, {
        duration: moveDuration,
        easing,
      }),
    );

    pileProgress.value = withDelay(
      delay,
      withTiming(1, {
        duration: moveDuration,
        easing,
      }),
    );

    focusScale.value = withDelay(
      delay,
      withSequence(
        withTiming(1.08, {
          duration: 560,
          easing,
        }),
        withTiming(1.04, {
          duration: 180,
          easing: Easing.out(
            Easing.quad,
          ),
        }),
      ),
    );
  }, [
    focusProgress,
    focusRotate,
    focusScale,
    focusX,
    focusY,
    isActive,
    pileProgress,
  ]);

  const focusBubbleStyle =
    useAnimatedStyle(() => ({
      backgroundColor: interpolateColor(
        focusProgress.value,
        [0, 1],
        [
          '#FFFFFF',
          colors.primary.default,
        ],
      ),

      shadowOpacity: interpolate(
        focusProgress.value,
        [0, 1],
        [0.16, 0.26],
      ),

      shadowRadius: interpolate(
        focusProgress.value,
        [0, 1],
        [18, 24],
      ),

      transform: [
        {
          translateX: focusX.value,
        },
        {
          translateY: focusY.value,
        },
        {
          scale: focusScale.value,
        },
        {
          rotate: `${focusRotate.value}deg`,
        },
      ],
    }));

  const focusLabelStyle =
    useAnimatedStyle(() => ({
      color: interpolateColor(
        focusProgress.value,
        [0, 1],
        [
          colors.text.primary,
          '#FFFFFF',
        ],
      ),
    }));

  const pileStyle =
    useAnimatedStyle(() => ({
      opacity: interpolate(
        pileProgress.value,
        [0, 1],
        [1, 0.48],
      ),

      transform: [
        {
          translateY: interpolate(
            pileProgress.value,
            [0, 1],
            [0, 10],
          ),
        },
        {
          scale: interpolate(
            pileProgress.value,
            [0, 1],
            [1, 0.98],
          ),
        },
      ],
    }));

  return (
    <View
      style={[
        styles.container,
        {
          width: SCREEN_WIDTH,
        },
      ]}
    >
      <View style={styles.topArea}>
        <Text style={styles.eyebrow}>
          <Text style={styles.brandText}>
            하루한개
          </Text>
          와 함께
        </Text>

        <Text style={styles.title}>
          {'딱 한 개부터\n시작해볼까요?'}
        </Text>
      </View>

      <View style={styles.spacer} />

      <View style={styles.bubblePlayArea}>
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            pileStyle,
          ]}
        >
          {PILE_BUBBLES.map((bubble) => {
            if (
              bubble.id ===
              FOCUS_BUBBLE.id
            ) {
              return null;
            }

            return (
              <View
                key={bubble.id}
                style={[
                  styles.bubble,
                  styles.pileBubble,
                  {
                    left:
                      bubble.left +
                      GROUP_OFFSET_X,
                    top: bubble.top,
                    zIndex: bubble.zIndex,
                    elevation:
                      bubble.zIndex + 6,
                    transform: [
                      {
                        rotate: `${bubble.rotate}deg`,
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.bubbleLabel}>
                  {bubble.label}
                </Text>
              </View>
            );
          })}
        </Animated.View>

        <Animated.View
          style={[
            styles.bubble,
            styles.focusBubble,
            {
              left: FOCUS_START_LEFT,
              top: FOCUS_BUBBLE.top,
            },
            focusBubbleStyle,
          ]}
        >
          <Animated.Text
            style={[
              styles.bubbleLabel,
              styles.focusBubbleLabel,
              focusLabelStyle,
            ]}
          >
            {FOCUS_BUBBLE.label}
          </Animated.Text>
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
    paddingHorizontal: layout.margin,
    alignItems: 'center',
  },

  eyebrow: {
    ...typography.c1Caption,
    marginBottom: 10,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  brandText: {
    color: colors.primary.default,
    fontWeight: '700',
  },

  title: {
    ...typography.t1Title1,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: -0.5,
  },

  spacer: {
    flex: 1,
  },

  bubblePlayArea: {
    position: 'relative',
    width: SCREEN_WIDTH,
    height: BUBBLE_AREA_HEIGHT,
    marginBottom: 8,
    overflow: 'visible',
    transform: [
      {
        translateY: -24,
      },
    ],
  },

  bubble: {
    position: 'absolute',
    width: BUBBLE_WIDTH,
    height: BUBBLE_HEIGHT,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  pileBubble: {
    backgroundColor: '#FFFFFF',

    shadowColor: colors.primary.default,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.14,
    shadowRadius: 18,
  },

  focusBubble: {
    zIndex: 20,
    elevation: 20,

    shadowColor: colors.primary.default,
    shadowOffset: {
      width: 0,
      height: 12,
    },
  },

  bubbleLabel: {
    ...typography.b2BodyMedium,
    color: colors.text.primary,
    textAlign: 'center',
  },

  focusBubbleLabel: {
    fontWeight: '700',
  },
});
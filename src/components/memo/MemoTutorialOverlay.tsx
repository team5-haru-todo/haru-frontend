import { useEffect, useState, type RefObject } from 'react';
import {
  LayoutChangeEvent,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout, radius, typography } from '@/src/constants';
import { logEvent } from '@/src/lib/analytics';

/**
 * 메모장 첫 진입 튜토리얼.
 *
 * 딤을 한 장으로 덮지 않고 상/하/좌/우 4장으로 나눠 가운데를 비우는 구조다(피그마 Dim_Top~Right와 동일).
 * 비워둔 구멍으로 아래 화면이 그대로 비치므로, 강조할 대상은 다시 그리지 않아도 된다.
 *
 * 다만 이 튜토리얼이 뜨는 시점은 신규 사용자의 첫 진입이라 실제 메모가 하나도 없다.
 * 그래서 예시 카드만은 오버레이가 직접 그리고, 두 스텝 모두 그 카드를 대상으로 삼는다.
 *   1스텝 — 카드 전체를 비춘다
 *   2스텝 — 카드는 딤에 덮이고 '시작' 버튼만 비춘다
 */

// 피그마 Tutorial_Memo_Step1/Step2 (390x844 기준)에서 가져온 값.
const DIM_COLOR = 'rgba(20, 23, 28, 0.65)';
const HOLE_PADDING = 8; // 강조 대상 둘레 여백 — 두 스텝 공통
const HOLE_BORDER_WIDTH = 2; // 2스텝 Highlight_Border

const BUBBLE_MARGIN = 35; // 말풍선 좌우 여백 (390 - 320 = 70, 양쪽 35)
const BUBBLE_RADIUS = 20;
const BUBBLE_PADDING_TOP = 28;
const BUBBLE_PADDING_BOTTOM = 20;
const BUBBLE_PADDING_HORIZONTAL = 20;
const BUBBLE_TEXT_GAP = 6; // 제목 ↔ 설명
const BUBBLE_SECTION_GAP = 20; // 텍스트 ↔ 하단 행
const BUBBLE_OFFSET = 18; // 구멍 아래 ↔ 말풍선 위

const TAIL_WIDTH = 18;
const TAIL_HEIGHT = 8;
const TAIL_OFFSET = 12; // 구멍 아래 ↔ 꼬리 위 (말풍선과 2px 겹쳐 이음매를 감춘다)

const FOOTER_RIGHT_GAP = 14; // 진행 표시 ↔ 버튼
const NEXT_BUTTON_RADIUS = 8;
const NEXT_BUTTON_PADDING_HORIZONTAL = 14;
const NEXT_BUTTON_PADDING_VERTICAL = 8;

// 예시 카드가 놓이는 자리 — 실제 목록의 첫 카드와 같은 좌표.
// app/(memo)/index.tsx의 content(paddingTop 16, paddingHorizontal 10)와
// listContent(paddingTop 10, paddingHorizontal 10)를 합한 값이다.
const CARD_MARGIN = 20;
const CARD_TOP_OFFSET = 26;

// 실제 데이터가 아니라 사용법을 보여주기 위한 예시다.
const EXAMPLE_MEMO = { content: '헬스장 등록하기', caption: '3일 전' };

type Rect = { x: number; y: number; width: number; height: number };

type Step = {
  title: string;
  accent: string; // 제목 중 파란색으로 강조할 구간
  description: string;
  buttonLabel: string;
  // 강조 대상 — 카드 전체인지, 카드 안의 '시작' 버튼인지
  target: 'card' | 'startButton';
};

const STEPS: Step[] = [
  {
    title: '할 일을 눌러보세요',
    accent: '눌러',
    description: '수정하거나, 왼쪽으로 밀어 즐겨찾기에 추가할 수 있어요',
    buttonLabel: '다음',
    target: 'card',
  },
  {
    title: `'시작'을 눌러보세요`,
    accent: '시작',
    description: '메인 화면으로 이동해 바로 진행할 수 있어요',
    buttonLabel: '확인',
    target: 'startButton',
  },
];

type MemoTutorialOverlayProps = {
  visible: boolean;
  // 목록 영역의 아래 경계를 잡기 위한 '할 일 추가' 버튼 영역. 헤더·추가 버튼·탭바는
  // 실제 화면을 그대로 쓰고, 그 사이 목록만 덮는다.
  listBottomRef: RefObject<View | null>;
  onFinish: (reason: 'completed' | 'skipped') => void;
};

export function MemoTutorialOverlay({
  visible,
  listBottomRef,
  onFinish,
}: MemoTutorialOverlayProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [stepIndex, setStepIndex] = useState(0);
  const [cardHeight, setCardHeight] = useState(0);
  // 카드 기준 상대 좌표 (onLayout이 부모 기준으로 준다)
  const [startButtonRect, setStartButtonRect] = useState<Rect | null>(null);
  const [listBottom, setListBottom] = useState<number | null>(null);

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  useEffect(() => {
    if (!visible) {
      setStepIndex(0);
      setListBottom(null);
      return;
    }
    logEvent('memo_tutorial_started');
    listBottomRef.current?.measureInWindow((_x, y) => setListBottom(y));
  }, [listBottomRef, visible]);

  const finish = (reason: 'completed' | 'skipped') => {
    logEvent(reason === 'skipped' ? 'memo_tutorial_skipped' : 'memo_tutorial_completed', {
      last_step_index: stepIndex,
    });
    onFinish(reason);
  };

  const handleNext = () => {
    if (isLastStep) {
      finish('completed');
      return;
    }
    setStepIndex(stepIndex + 1);
  };

  const handleStartButtonLayout = (event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setStartButtonRect({ x, y, width, height });
  };

  // 카드 좌표는 기기 inset에 따라 달라지므로 런타임에 계산한다.
  const cardTop = insets.top + layout.navBarHeight + CARD_TOP_OFFSET;
  const cardWidth = screenWidth - CARD_MARGIN * 2;

  const target: Rect | null =
    step.target === 'card'
      ? cardHeight > 0
        ? { x: CARD_MARGIN, y: cardTop, width: cardWidth, height: cardHeight }
        : null
      : startButtonRect
        ? {
            x: CARD_MARGIN + startButtonRect.x,
            y: cardTop + startButtonRect.y,
            width: startButtonRect.width,
            height: startButtonRect.height,
          }
        : null;

  const hole: Rect | null = target && {
    x: target.x - HOLE_PADDING,
    y: target.y - HOLE_PADDING,
    width: target.width + HOLE_PADDING * 2,
    height: target.height + HOLE_PADDING * 2,
  };

  // 꼬리는 구멍 중앙을 가리키되 말풍선 밖으로 나가지 않게 잡아둔다.
  const tailCenterX = hole
    ? Math.min(
        Math.max(hole.x + hole.width / 2, BUBBLE_MARGIN + BUBBLE_RADIUS),
        screenWidth - BUBBLE_MARGIN - BUBBLE_RADIUS
      )
    : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => finish('skipped')}>
      {/* 목록 영역을 통째로 덮는다. 튜토리얼은 예시 카드를 그려 보여주는 방식이라
          사용자의 실제 메모가 함께 보이면 자기 목록에 없는 할 일이 섞여 있는 것처럼 읽히고,
          메모가 없는 신규 사용자에게는 '아직 적어둔 할 일이 없어요' 문구가 카드와 같이 비친다.
          헤더·추가 버튼·탭바는 실제 화면을 그대로 두고 딤만 씌운다(디자인과 동일). */}
      {listBottom !== null && (
        <View
          style={[
            styles.listCover,
            {
              top: insets.top + layout.navBarHeight,
              height: Math.max(listBottom - insets.top - layout.navBarHeight, 0),
            },
          ]}
        />
      )}

      {/* 구멍으로는 아래 화면이 그대로 비친다. 기존 메모가 있는 계정에서 실제 카드가
          예시 카드 둘레로 새어 나오므로, 구멍 크기만큼 목록 배경색을 깔아 가린다.
          (2스텝에서는 구멍이 카드 안쪽이라 이 배경이 카드에 가려 보이지 않는다) */}
      {hole && (
        <View
          style={[
            styles.holeBackground,
            { top: hole.y, left: hole.x, width: hole.width, height: hole.height },
          ]}
        />
      )}

      {/* 예시 카드는 딤보다 먼저 그린다 — 2스텝에서 카드가 딤에 덮여야 하기 때문 */}
      <View
        style={[
          styles.exampleCard,
          { top: cardTop, left: CARD_MARGIN, width: cardWidth },
          // 측정이 끝나야 딤을 그릴 수 있다. 그 전까지 카드만 덩그러니 보이지 않도록 숨긴다.
          !hole && styles.measuring,
        ]}
        onLayout={(event) => setCardHeight(event.nativeEvent.layout.height)}>
        <View style={styles.exampleCardContent}>
          <Text style={styles.exampleCardTitle}>{EXAMPLE_MEMO.content}</Text>
          <Text style={styles.exampleCardCaption}>{EXAMPLE_MEMO.caption}</Text>
        </View>
        <View style={styles.exampleStartButton} onLayout={handleStartButtonLayout}>
          <Text style={styles.exampleStartLabel}>시작</Text>
        </View>
      </View>

      {/* 측정이 끝나기 전에 딤을 그리면 구멍이 엉뚱한 자리에 생긴다 */}
      {hole && (
        <>
          <View style={[styles.dim, { top: 0, left: 0, right: 0, height: hole.y }]} />
          <View
            style={[
              styles.dim,
              { top: hole.y + hole.height, left: 0, right: 0, height: screenHeight },
            ]}
          />
          <View
            style={[styles.dim, { top: hole.y, left: 0, width: hole.x, height: hole.height }]}
          />
          <View
            style={[
              styles.dim,
              { top: hole.y, left: hole.x + hole.width, right: 0, height: hole.height },
            ]}
          />

          {/* 문구가 '눌러보세요'라 강조된 곳을 실제로 누를 수 있게 한다 */}
          <Pressable
            style={{
              position: 'absolute',
              top: hole.y,
              left: hole.x,
              width: hole.width,
              height: hole.height,
            }}
            onPress={handleNext}
          />

          {step.target === 'startButton' && (
            <View
              pointerEvents="none"
              style={[
                styles.holeBorder,
                {
                  top: hole.y,
                  left: hole.x,
                  width: hole.width,
                  height: hole.height,
                  borderRadius: hole.height / 2,
                },
              ]}
            />
          )}

          <View
            pointerEvents="none"
            style={[
              styles.tail,
              { top: hole.y + hole.height + TAIL_OFFSET, left: tailCenterX - TAIL_WIDTH / 2 },
            ]}
          />

          <View style={[styles.bubble, { top: hole.y + hole.height + BUBBLE_OFFSET }]}>
            <View style={styles.bubbleTextGroup}>
              <Text style={styles.bubbleTitle}>
                {renderTitle(step.title, step.accent)}
              </Text>
              <Text style={styles.bubbleDescription}>{step.description}</Text>
            </View>

            <View style={styles.bubbleFooter}>
              <Pressable onPress={() => finish('skipped')} hitSlop={8}>
                <Text style={styles.skipLabel}>건너뛰기</Text>
              </Pressable>

              <View style={styles.footerRight}>
                <Text style={styles.stepIndicator}>
                  {stepIndex + 1}/{STEPS.length}
                </Text>
                <Pressable style={styles.nextButton} onPress={handleNext}>
                  <Text style={styles.nextButtonLabel}>{step.buttonLabel}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </>
      )}
    </Modal>
  );
}

function renderTitle(title: string, accent: string) {
  const index = title.indexOf(accent);
  if (index < 0) {
    return title;
  }
  return (
    <>
      {title.slice(0, index)}
      <Text style={styles.bubbleTitleAccent}>{accent}</Text>
      {title.slice(index + accent.length)}
    </>
  );
}

const styles = StyleSheet.create({
  dim: {
    position: 'absolute',
    backgroundColor: DIM_COLOR,
  },

  measuring: {
    opacity: 0,
  },

  listCover: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: colors.surface.sunken,
  },

  holeBackground: {
    position: 'absolute',
    backgroundColor: colors.surface.sunken,
  },

  // 아래 카드 스타일은 MemoCard.tsx와 같은 값이다. 실제 카드와 달라 보이면 안 되므로
  // MemoCard 쪽이 바뀌면 여기도 맞춰야 한다.
  exampleCard: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.button,
    backgroundColor: colors.surface.default,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  exampleCardContent: {
    flex: 1,
    gap: 2,
    padding: 10,
  },
  exampleCardTitle: {
    ...typography.b2BodyMedium,
    color: colors.text.primary,
  },
  exampleCardCaption: {
    ...typography.c1Caption,
    color: colors.text.tertiary,
  },
  exampleStartButton: {
    borderRadius: radius.pill,
    backgroundColor: colors.primary.light,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  exampleStartLabel: {
    ...typography.b4BodySm,
    color: colors.primary.default,
  },

  holeBorder: {
    position: 'absolute',
    borderWidth: HOLE_BORDER_WIDTH,
    borderColor: colors.surface.default,
  },

  tail: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: TAIL_WIDTH / 2,
    borderRightWidth: TAIL_WIDTH / 2,
    borderBottomWidth: TAIL_HEIGHT,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.surface.default,
  },

  bubble: {
    position: 'absolute',
    left: BUBBLE_MARGIN,
    right: BUBBLE_MARGIN,
    gap: BUBBLE_SECTION_GAP,
    paddingTop: BUBBLE_PADDING_TOP,
    paddingBottom: BUBBLE_PADDING_BOTTOM,
    paddingHorizontal: BUBBLE_PADDING_HORIZONTAL,
    borderRadius: BUBBLE_RADIUS,
    backgroundColor: colors.surface.default,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  bubbleTextGroup: {
    gap: BUBBLE_TEXT_GAP,
  },
  bubbleTitle: {
    ...typography.b2BodyMedium,
    color: colors.text.primary,
  },
  bubbleTitleAccent: {
    color: colors.primary.default,
  },
  bubbleDescription: {
    ...typography.c1Caption,
    color: colors.text.secondary,
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipLabel: {
    ...typography.c1Caption,
    color: colors.text.placeholder,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: FOOTER_RIGHT_GAP,
  },
  stepIndicator: {
    ...typography.c1Caption,
    color: colors.primary.default,
  },
  nextButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: NEXT_BUTTON_RADIUS,
    backgroundColor: colors.primary.default,
    paddingHorizontal: NEXT_BUTTON_PADDING_HORIZONTAL,
    paddingVertical: NEXT_BUTTON_PADDING_VERTICAL,
  },
  nextButtonLabel: {
    ...typography.c1Caption,
    color: colors.surface.default,
  },
});

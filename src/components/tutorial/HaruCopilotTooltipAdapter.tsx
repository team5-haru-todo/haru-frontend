import { mainTutorialStepConfigs } from '@/src/components/main/tutorial/mainTutorialConfigs';
import { useTutorialStore } from '@/src/store/tutorialStore';
import { useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useCopilot } from 'react-native-copilot';
import type { TooltipProps } from 'react-native-copilot';
import { TutorialTooltipShell } from './TutorialTooltipShell';
import type { TutorialArrowSide, TutorialTooltipPlacement } from './tutorialTypes';

// 피그마 요구: 네 단계 모두 말풍선 가로/세로 크기가 완전히 같고, 항상 화면 가로 중앙에 있다.
// 단계마다 달라지는 건 세로 위치(target 위/아래)와 꼭지의 가로 위치뿐이다. 이 값들은
// react-native-copilot의 자동 tooltip 배치(dist의 tooltipStyles state)를 쓰지 않고
// (app/(tabs)/_layout.tsx의 tooltipStyle이 그 계산 결과를 전부 무효화한다), 여기서
// currentStep.measure()만으로 직접 계산한다.
const TOOLTIP_SIDE_MARGIN = 32;
const TOOLTIP_WIDTH_MAX = 394;
const TOOLTIP_HEIGHT = 136;

// target과 tooltip 카드 사이 실제 화면 간격 보정값. 흰 target frame이 TARGET_FRAME_INSET(8,
// TutorialTargetFrame.tsx와 동일 값)만큼 target 원본보다 튀어나와 있고, custom arrow가
// ARROW_HEIGHT(10)만큼 카드 밖으로 더 튀어나오므로, 이 셋을 합쳐야 흰 frame과 화살표 사이에
// 실제로 TARGET_ARROW_VISUAL_GAP(8)의 시각적 간격이 생긴다.
const TARGET_FRAME_INSET = 8;
const ARROW_HEIGHT = 10;
const TARGET_ARROW_VISUAL_GAP = 8;
const ARROW_WIDTH = 20;
const ARROW_HALF_WIDTH = ARROW_WIDTH / 2;
const ARROW_EDGE_GUARD = 24;

// 유일하게 "target 아래에 말풍선(꼭지는 카드 위쪽)"인 step. 나머지 세 step은 전부
// "target 위에 말풍선(꼭지는 카드 아래쪽)"이다 — 피그마 요구사항 그대로.
const BELOW_TARGET_STEP_NAME = 'main-empty-input';

type MeasuredRect = { x: number; y: number; width: number; height: number };

function computeArrowLeft(targetCenterX: number, tooltipScreenLeft: number, tooltipWidth: number): number {
  const rawArrowLeft = targetCenterX - tooltipScreenLeft - ARROW_HALF_WIDTH;
  return Math.max(
    ARROW_EDGE_GUARD,
    Math.min(rawArrowLeft, tooltipWidth - ARROW_EDGE_GUARD - ARROW_WIDTH)
  );
}

function computePlacement(rect: MeasuredRect, windowWidth: number, stepName: string): TutorialTooltipPlacement {
  const width = Math.min(windowWidth - TOOLTIP_SIDE_MARGIN * 2, TOOLTIP_WIDTH_MAX);
  const screenLeft = (windowWidth - width) / 2;
  const isBelowTarget = stepName === BELOW_TARGET_STEP_NAME;
  const screenTop = isBelowTarget
    ? rect.y + rect.height + TARGET_FRAME_INSET + TARGET_ARROW_VISUAL_GAP + ARROW_HEIGHT
    : rect.y - TARGET_FRAME_INSET - TARGET_ARROW_VISUAL_GAP - ARROW_HEIGHT - TOOLTIP_HEIGHT;
  const targetCenterX = rect.x + rect.width / 2;
  const arrowSide: TutorialArrowSide = isBelowTarget ? 'top' : 'bottom';
  return {
    screenLeft,
    screenTop,
    width,
    height: TOOLTIP_HEIGHT,
    arrowLeft: computeArrowLeft(targetCenterX, screenLeft, width),
    arrowSide,
  };
}

// react-native-copilot@3.3.3 확인 결과: tooltipComponent는 { labels }만 props로 받고,
// currentStep/goToNext/stop 등은 컴포넌트 내부에서 useCopilot()을 호출해야만 얻을 수 있다.
// (node_modules/react-native-copilot/dist/index.d.ts: CopilotOptions.tooltipComponent?:
//  React.ComponentType<TooltipProps>, TooltipProps { labels: Labels })
export function HaruCopilotTooltipAdapter(_props: TooltipProps) {
  const { currentStep, isLastStep, goToNext, stop } = useCopilot();
  const { width: windowWidth } = useWindowDimensions();
  // screenTop은 target의 실측 y가 있어야만 의미가 있어 초기값을 추정하지 않는다 — measure()가
  // resolve되는 한 프레임 동안은 카드를 그리지 않고 기다린다(animated:false라 점프도 없다).
  const [placement, setPlacement] = useState<TutorialTooltipPlacement | null>(null);
  // [버그 수정] "확인/시작하기/건너뛰기"를 여러 번 눌러 finishTour가 겹쳐 호출되는 것을 막는다.
  // TODO: completed 확인 버튼이 한 번에 종료되지 않고 여러 번 눌러야 dim overlay가 서서히
  // 사라지는 현상이 남아있음 — 별도로 원인 조사 후 해결.
  const [isEnding, setIsEnding] = useState(false);

  useEffect(() => {
    if (!currentStep) {
      setPlacement(null);
      return;
    }
    let cancelled = false;
    currentStep.measure().then((rect) => {
      if (cancelled) return;
      setPlacement(computePlacement(rect, windowWidth, currentStep.name));
    });
    return () => {
      cancelled = true;
    };
  }, [currentStep, windowWidth]);

  const cfg = currentStep?.name ? mainTutorialStepConfigs[currentStep.name] : undefined;
  if (!cfg || !currentStep || !placement) return null;

  const finishTour = async (markSeen: boolean) => {
    if (isEnding) return;
    setIsEnding(true);
    const tourId = useTutorialStore.getState().activeTourId;
    try {
      await stop();
    } catch (error) {
      console.error('튜토리얼 종료 실패:', error);
    } finally {
      useTutorialStore.getState().setRunning(false);
      useTutorialStore.getState().setActiveTourId(null);
      if (markSeen && tourId) {
        useTutorialStore.getState().emitCompletion(tourId);
      }
      // markSeen=true 여부와 무관하게 finishTour가 끝나면 이 Shell은 곧 언마운트되므로
      // isEnding을 되돌릴 필요는 없다 — 다음 step으로 넘어가는 경로(goToNext)만 별도로 막는다.
    }
  };

  // [버그 수정] 마지막 step에서 actionType이 "next"여도 goToNext()를 호출하지 않는다.
  // react-native-copilot은 마지막에서 goToNext()를 부르면 currentStep만 undefined가 되고
  // visible은 true로 남을 수 있어(내부적으로 "다음 step 없음"을 종료로 취급하지 않음),
  // isLastStep이면 항상 finishTour()로 명시적으로 종료한다. 마지막 step의 primary(시작하기/확인)는
  // "이 튜토리얼을 다 봤다"는 뜻이므로 markSeen=true.
  const handlePrimaryPress = async () => {
    if (cfg.actionType === 'next' && !isLastStep) {
      if (isEnding) return;
      await goToNext();
      return;
    }
    await finishTour(true);
  };

  const primaryAction = { label: cfg.primaryLabel, onPress: handlePrimaryPress, disabled: isEnding };

  // "건너뛰기"도 정상 종료로 취급해 markSeen=true — 도중에 건너뛰어도 다시 같은 튜토리얼을
  // 자동으로 또 띄우지 않는다(반복 노출은 사용자 경험을 해친다).
  const secondaryAction = cfg.secondaryLabel
    ? { label: cfg.secondaryLabel, onPress: () => finishTour(true), disabled: isEnding }
    : undefined;

  return (
    // [버그 수정] step이 바뀔 때마다 Shell을 완전히 새로 마운트해, 이전 step의 잔여 상태가
    // 화면에 남지 않게 한다(주 원인은 animated:false로 이미 제거했지만 방어적으로 유지).
    <TutorialTooltipShell
      key={currentStep.name}
      titleParts={cfg.titleParts}
      placement={placement}
      description={cfg.description}
      progress={cfg.progress}
      secondaryAction={secondaryAction}
      primaryAction={primaryAction}
    />
  );
}

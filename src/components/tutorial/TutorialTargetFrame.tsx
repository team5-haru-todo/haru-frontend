import type { ReactElement } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
import { colors } from '@/src/constants/colors';
import type { TutorialStepConfig } from './tutorialTypes';

// 4개 target(EmptyState 입력창/메모 탭/메모장에서 고르기/한개 더하기)이 공유하는
// "흰색 tutorial frame" 배선. 좌표는 항상 walkthroughable View의 실제 bounds로 결정되고
// (화면 x/y 하드코딩 없음), currentStep일 때만 흰 배경이 켜진다.
//
// [버그 수정] TouchableOpacity는 collapsable을 네이티브까지 전달하지 않는다(react-native
// 소스 확인됨) — 그래서 measure 대상은 항상 이 walkthroughable(View)여야 하고, 실제
// 눌리는 요소(children)는 그 안에 평범하게 둔다.
const WalkthroughableView = walkthroughable(View);

// spotlight(SVG mask hole, app/(tabs)/_layout.tsx의 roundedSpotlightPath)와 이 흰색 frame이
// 항상 같은 크기·모서리로 겹치도록 두 곳이 공유하는 상수. 값을 바꿀 땐 반드시 함께 바꾼다.
export const TARGET_FRAME_INSET = 8;
export const TARGET_FRAME_RADIUS = 4;

type Props = {
  stepConfig: TutorialStepConfig;
  active: boolean;
  // [설계 변경] 이전의 frameStyle은 padding으로 흰 프레임 자체의 시각적 크기까지 함께
  // 지정했는데, padding은 control의 실제 레이아웃 크기(예: Step1 입력창 높이)까지 함께
  // 밀어내는 부작용이 있었다. 이제 프레임의 padding/모서리는 TARGET_FRAME_INSET/RADIUS로
  // 고정하고, 여기 style에는 "control을 감싸는 이 wrapper가 부모 안에서 어떻게 배치되는지"
  // (alignSelf, marginTop 등 레이아웃 배치값)만 전달한다 — 시각적 프레임 크기는 건드리지 않는다.
  style?: StyleProp<ViewStyle>;
  children: ReactElement;
};

export function TutorialTargetFrame({ stepConfig, active, style, children }: Props) {
  const { currentStep } = useCopilot();
  // [버그 수정] react-native-copilot의 currentStep은 stop() 이후에도 즉시 undefined로
  // 리셋되지 않는다(실기기 확인: 각 tour의 "마지막" step — main-empty의 "메모장에서
  // 고르기", main-completed의 "한개 더하기" — 흰 frame이 튜토리얼 종료 후에도 계속
  // 남아있었음). currentStep만으로 하이라이트 여부를 판단하면 이 stale 값에 그대로
  // 속는다. active(호출부가 useTutorialStore의 activeTourId로 넘겨주는 값, 예:
  // activeTourId === "main-empty")를 함께 요구해, tour store가 확실히 리셋되면
  // (finishTour의 setActiveTourId(null)) currentStep이 무엇이든 프레임이 꺼지게 한다.
  const isCurrentStep = active && currentStep?.name === stepConfig.name;

  return (
    <CopilotStep
      name={stepConfig.name}
      order={stepConfig.order}
      text={stepConfig.description ?? stepConfig.title}
      active={active}
    >
      <WalkthroughableView collapsable={false} style={style}>
        {/* 흰 프레임은 control 위에 겹쳐 그리는 absolute 배경일 뿐이다(pointerEvents:none).
            절대 위치 자식은 Yoga 레이아웃 계산에서 부모 크기에 영향을 주지 않으므로,
            이 WalkthroughableView가 measure()로 보고하는 크기는 여전히 children의
            원래 크기 그대로다 — 프레임이 커져도 실제 control 위치/크기는 밀리지 않는다. */}
        {isCurrentStep ? <View pointerEvents="none" style={styles.whiteFrame} /> : null}
        {children}
      </WalkthroughableView>
    </CopilotStep>
  );
}

const styles = StyleSheet.create({
  whiteFrame: {
    position: 'absolute',
    top: -TARGET_FRAME_INSET,
    left: -TARGET_FRAME_INSET,
    right: -TARGET_FRAME_INSET,
    bottom: -TARGET_FRAME_INSET,
    backgroundColor: colors.surface.default,
    borderRadius: TARGET_FRAME_RADIUS,
  },
});

// 공통 튜토리얼 타입만 정의한다. 도메인 문구(메인/메모/캘린더 등)는 여기 두지 않는다.

export type TutorialAction = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

// 제목 안의 일부 단어만 primary blue로 강조하기 위한 최소 구조.
// React Native Text는 부분 스타일링을 위해 중첩 <Text>가 필요해, 문자열 대신 조각 배열로 받는다.
export type TutorialTitlePart = {
  text: string;
  highlighted?: boolean;
};

// 말풍선 꼭지가 붙는 변("top"=카드 상단, 즉 target이 카드 "아래"쪽에 있을 때 /
// "bottom"=카드 하단, 즉 target이 카드 "위"쪽에 있을 때).
export type TutorialArrowSide = "top" | "bottom";

// 네 단계 모두 카드 자체의 가로/세로 크기는 동일하다 — 이 타입이 담는 값은 "그 동일 크기
// 카드를 화면 어디에 절대좌표로 둘지"와 "꼭지를 어느 변의 어느 x좌표에 그릴지"뿐이다.
// react-native-copilot의 자동 tooltip 좌우/상하 배치(dist의 tooltipStyles state)는 쓰지 않고,
// 이 값을 호출부(HaruCopilotTooltipAdapter)가 target measure 결과로 직접 계산해 내려준다.
export type TutorialTooltipPlacement = {
  screenLeft: number;
  screenTop: number;
  width: number;
  height: number;
  arrowLeft: number;
  arrowSide: TutorialArrowSide;
};

export type TutorialTooltipShellProps = {
  titleParts: TutorialTitlePart[];
  placement: TutorialTooltipPlacement;
  description?: string;
  progress?: {
    current: number;
    total: number;
  };
  secondaryAction?: TutorialAction;
  primaryAction: TutorialAction;
};

// 앱 전역 CopilotProvider에서 구분하는 도메인별 tour id.
export type TutorialTourId = "main-empty" | "main-completed" | "calendar";

export type TutorialActionType = "next" | "finish" | "confirm";

// CopilotStep에 그대로 대응하는 정적 설정. onPress 등 함수는 여기 넣지 않는다
// (react-native-copilot의 useCopilot() API로 Adapter가 조립한다).
export type TutorialStepConfig = {
  name: string;
  order: number;
  // 접근성/CopilotStep.text(필수, string)용 평문 제목. 화면에는 titleParts를 렌더한다.
  title: string;
  titleParts: TutorialTitlePart[];
  description?: string;
  progress?: {
    current: number;
    total: number;
  };
  secondaryLabel?: string;
  primaryLabel: string;
  actionType: TutorialActionType;
};

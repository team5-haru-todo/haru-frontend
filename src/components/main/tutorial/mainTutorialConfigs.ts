import type { TutorialStepConfig } from '@/src/components/tutorial/tutorialTypes';

// 메인 도메인 전용 튜토리얼 문구/설정 — 공통 tutorial 폴더에 두지 않는다.
// 메모장/캘린더 등 다른 도메인이 생기면 각자 폴더에 동일한 패턴으로 분리한다
// (예: src/components/memo/tutorial/memoTutorialConfigs.ts).

// 계정이 이 튜토리얼을 "봤다"고 인정하는 버전. 백엔드 UserSettings.mainTutorialVersion/
// mainCompletedTutorialVersion과 비교하는 유일한 기준값 — 여러 컴포넌트에 숫자를 흩어
// 하드코딩하지 않고 이 두 상수만 참조한다. 튜토리얼 내용이 바뀌어 기존 시청 이력을
// 무효화하고 다시 노출해야 하면 이 값을 올린다(가입일 기준 신규 판정이 아님).
export const MAIN_TUTORIAL_VERSION = 1;
export const MAIN_COMPLETED_TUTORIAL_VERSION = 1;
export const mainTutorialStepConfigs: Record<string, TutorialStepConfig> = {
  'main-empty-input': {
    name: 'main-empty-input',
    order: 1,
    title: '오늘의 한 개를 적어보세요',
    titleParts: [
      { text: '오늘의 ' },
      { text: '한 개', highlighted: true },
      { text: '를 적어보세요' },
    ],
    description: '사소한 일도 괜찮아요. 작은 일부터 가볍게 시작해보세요',
    progress: { current: 1, total: 3 },
    secondaryLabel: '건너뛰기',
    primaryLabel: '다음',
    actionType: 'next',
  },
  'main-empty-memo-tab': {
    name: 'main-empty-memo-tab',
    order: 2,
    title: '나중에 할 일은 메모장에 적어보세요',
    titleParts: [
      { text: '나중에 할 일은 ' },
      { text: '메모장', highlighted: true },
      { text: '에 적어보세요' },
    ],
    description: '여러 개의 할 일을 저장해둘 수 있어요',
    progress: { current: 2, total: 3 },
    secondaryLabel: '건너뛰기',
    primaryLabel: '다음',
    actionType: 'next',
  },
  'main-empty-choose-memo': {
    name: 'main-empty-choose-memo',
    order: 3,
    title: '메모장에서 골라보세요',
    titleParts: [
      { text: '메모장', highlighted: true },
      { text: '에서 골라보세요' },
    ],
    description: '미리 적어둔 할 일을 선택해서 시작할 수 있어요',
    progress: { current: 3, total: 3 },
    secondaryLabel: '건너뛰기',
    primaryLabel: '시작하기',
    actionType: 'finish',
  },
  // progress/secondaryLabel 필드 자체를 생략한다 — Shell이 조건부 렌더로 완전히 스킵해
  // 해당 영역에 빈 공간이 남지 않는다(1단계 단독 tour).
  'main-completed-extra-button': {
    name: 'main-completed-extra-button',
    order: 1,
    title: '첫 한 개를 해냈어요! 🎉',
    // 완료 화면 제목은 전체 검정, 별도 강조 없음 — 조각 하나만 담는다.
    titleParts: [{ text: '첫 한 개를 해냈어요! 🎉' }],
    description: '메모장에서 할 일을 선택하고 한 개 더 해볼까요?',
    primaryLabel: '확인',
    actionType: 'confirm',
  },
};

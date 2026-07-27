import type { TutorialStepConfig } from '@/src/components/tutorial/tutorialTypes';

export const calendarTutorialStepConfigs: Record<string, TutorialStepConfig> = {
  'calendar-summary': {
    name: 'calendar-summary',
    order: 1,
    title: '따로 기록하지 않아도 괜찮아요',
    titleParts: [{ text: '따로 기록하지 않아도 괜찮아요' }],
    description: '완료한 날과 연속 달성 기록을 한눈에 볼 수 있어요',
    progress: { current: 1, total: 2 },
    secondaryLabel: '건너뛰기',
    primaryLabel: '다음',
    actionType: 'next',
  },
  'calendar-grid': {
    name: 'calendar-grid',
    order: 2,
    title: '날짜를 눌러서 확인해 보세요',
    titleParts: [{ text: '날짜를 눌러서 확인해 보세요' }],
    description: '선택한 날짜의 완료 목록을 확인할 수 있어요',
    progress: { current: 2, total: 2 },
    secondaryLabel: '건너뛰기',
    primaryLabel: '확인',
    actionType: 'confirm',
  },
};

// SCR-003 Empty 상태 메인 카드에 표시되는 랜덤 문구.
// 각 줄은 최대 하나의 따옴표 강조 구간(quoted)을 가질 수 있고, 렌더링 시 그 부분만
// accent 색상으로 표시된다(따옴표 기호 자체는 일반 텍스트로 유지).
export type EmptyStateMessageLine = {
  prefix: string;
  quoted?: string;
  suffix?: string;
};

export type EmptyStateMessage = {
  line1: EmptyStateMessageLine;
  line2: EmptyStateMessageLine;
};

export const EMPTY_STATE_MESSAGES: EmptyStateMessage[] = [
  {
    line1: { prefix: '딱 하나만 해도 괜찮아요,' },
    line2: { prefix: '오늘의 ', quoted: '한개', suffix: '를 적어볼까요?' },
  },
  {
    line1: { prefix: '오늘은 하나면 충분해요' },
    line2: { prefix: '작은 ', quoted: '한 걸음', suffix: '부터 시작해볼까요?' },
  },
  {
    line1: { prefix: '많이 하지 않아도 괜찮아요' },
    line2: { prefix: '오늘의 ', quoted: '한 개', suffix: '만 골라볼까요?' },
  },
  {
    line1: { prefix: '', quoted: '하나', suffix: '를 해낸 오늘은 분명 달라요' },
    line2: { prefix: '가볍게 시작해볼까요?' },
  },
  {
    line1: { prefix: '작은 ', quoted: '하나', suffix: '가 오늘을 바꿀 수 있어요' },
    line2: { prefix: '지금 떠오르는 걸 적어보세요' },
  },
  {
    line1: { prefix: '완벽한 하루보다 해낸 하나' },
    line2: { prefix: '오늘의 ', quoted: '한 개', suffix: '는 무엇인가요?' },
  },
  {
    line1: { prefix: '천천히 가도 괜찮아요' },
    line2: { prefix: '오늘 할 수 있는 ', quoted: '하나', suffix: '만 적어볼까요?' },
  },
  {
    line1: { prefix: '오늘도 나를 위한 한 걸음' },
    line2: { prefix: '딱 ', quoted: '하나', suffix: '만 시작해봐요' },
  },
  {
    line1: { prefix: '', quoted: '한 개', suffix: '면 어때요, 해냈다는 게 중요하죠' },
    line2: { prefix: '오늘의 도전을 적어볼까요?' },
  },
  {
    line1: { prefix: '작아 보여도 분명한 변화예요' },
    line2: { prefix: '오늘 해낼 ', quoted: '하나', suffix: '를 골라보세요' },
  },
  {
    line1: { prefix: '내일의 나를 위한 작은 약속' },
    line2: { prefix: '오늘은 ', quoted: '하나', suffix: '만 지켜볼까요?' },
  },
];

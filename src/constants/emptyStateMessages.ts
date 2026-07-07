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
    line1: { prefix: "딱 하나만 해도 괜찮아요," },
    line2: { prefix: "오늘의", quoted: "한개", suffix: "를 적어볼까요?" },
  },
  {
    line1: { prefix: "거창하지 않아도 괜찮아요" },
    line2: { prefix: "", quoted: "하루 한개", suffix: "면 충분해요" },
  },
  {
    line1: { prefix: "무리하지 않아도 괜찮아요" },
    line2: { prefix: "", quoted: "하나", suffix: "만 해볼까요?" },
  },
  {
    line1: { prefix: "완벽하지 않아도 돼요" },
    line2: { prefix: "", quoted: "하루 한개", suffix: "면 충분해요" },
  },
  {
    line1: { prefix: "천천히 해도 괜찮아요" },
    line2: { prefix: "", quoted: "오늘 한 개", suffix: "만 해볼까요" },
  },
  {
    line1: { prefix: "완벽하지 않아도 돼요" },
    line2: { prefix: "", quoted: "한개", suffix: "로 시작해볼까요" },
  },
  {
    line1: { prefix: "매일이 쌓이면 힘이 돼요" },
    line2: { prefix: "", quoted: "작은 습관", suffix: "이 쌓여가요" },
  },
  {
    line1: { prefix: "완벽하지 않아도 돼요" },
    line2: { prefix: "", quoted: "딱 한개", suffix: "면 충분해요" },
  },
  {
    line1: { prefix: "너무 애쓰지 않아도 돼요" },
    line2: { prefix: "", quoted: "딱 한개", suffix: "만 정해봐요" },
  },
  {
    line1: { prefix: "느려도 꾸준하면 충분해요" },
    line2: { prefix: "", quoted: "작은 실천", suffix: "이 쌓이는 중" },
  },
  {
    line1: { prefix: "포기하지 않는 게 중요해요" },
    line2: { prefix: "", quoted: "오늘 한개", suffix: "로 시작해요" },
  },
  {
    line1: { prefix: "오늘도 한 만큼이면 돼요" },
    line2: { prefix: "", quoted: "지금 할 하나", suffix: "만 골라봐요" },
  },
  {
    line1: { prefix: "조금씩 가도 앞으로 가요" },
    line2: { prefix: "", quoted: "작은 시작", suffix: "부터 해볼까요" },
  },
  {
    line1: { prefix: "다 하지 않아도 괜찮아요" },
    line2: { prefix: "", quoted: "오늘의 한 개", suffix: "만 끝내봐요" },
  },
  {
    line1: { prefix: "멈추지 않으면 충분해요" },
    line2: { prefix: "", quoted: "한 걸음", suffix: "부터 이어가요" },
  },
  {
    line1: { prefix: "잘하려 하지 않아도 돼요" },
    line2: { prefix: "", quoted: "할 수 있는 것", suffix: "부터 해요" },
  },
  {
    line1: { prefix: "오늘은 가볍게 시작해요" },
    line2: { prefix: "", quoted: "딱 하나", suffix: "만 정해볼까요" },
  },
  {
    line1: { prefix: "작은 변화도 변화예요" },
    line2: { prefix: "", quoted: "오늘의 선택", suffix: "을 믿어봐요" },
  },
  {
    line1: { prefix: "지금의 속도로도 좋아요" },
    line2: { prefix: "", quoted: "한 가지", suffix: "부터 해내봐요" },
  },
  {
    line1: { prefix: "부담은 잠시 내려놔도 돼요" },
    line2: { prefix: "", quoted: "작은 목표", suffix: "만 세워봐요" },
  },
  {
    line1: { prefix: "오늘도 충분히 잘하고 있어요" },
    line2: { prefix: "", quoted: "다음 한 걸음", suffix: "만 생각해요" },
  },
];

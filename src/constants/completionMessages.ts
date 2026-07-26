// SCR-003_3 완료 축하 화면(CompletionCelebration)의 완료 개수별 문구.
// 기준값은 "오늘 완료한 할 일의 누적 개수"(getToday().completedTasks.length)이며,
// 스트릭과는 무관하다. 3·6·10·15만 이벤트 문구, 16 이상은 fallback 문구를 쓴다.
const SPECIAL_MESSAGES: Record<number, string> = {
  3: '벌써 3개째예요!',
  6: '오늘 6개째! 대단해요!',
  10: '오늘 각성하셨나요...?',
  15: '오늘의 MVP 등장 🏆',
};

// count는 route param(string)에서 넘어오거나 지연 도착할 수 있어 방어적으로 정규화한다.
// 완료 화면은 정의상 최소 1개 완료가 존재하므로, undefined/null/NaN/0 이하/소수는 1로 fallback한다.
export function getCompletionMessage(count?: number | null): string {
  const parsed = Number(count);
  const normalized =
    Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;

  if (normalized >= 16) {
    return `오늘 ${normalized}개째 성공!`;
  }
  return SPECIAL_MESSAGES[normalized] ?? `오늘 ${normalized}개 완료!`;
}

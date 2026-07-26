// 하루의 경계는 서버(record_date)와 동일하게 Asia/Seoul 자정으로 판단한다.
// 기기 로컬 타임존을 쓰면 해외에서 서버와 날짜가 어긋나므로 여기서 KST를 고정한다.
const KST_DATE_FORMAT = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' });

// 메모 작성 시점을 상대 날짜로 표시한다 ("오늘" / "N일 전").
// 경과 시간이 아니라 KST 달력 날짜 차이 기준이라, 자정을 넘기면 곧바로 "1일 전"이 된다.
// (경과 시간으로 계산하면 어젯밤에 적은 메모가 다음 날 아침에도 "오늘"로 남는다)
export function formatRelativeDays(createdAt: string): string {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) {
    return '';
  }
  const createdUtc = Date.parse(`${KST_DATE_FORMAT.format(created)}T00:00:00Z`);
  const todayUtc = Date.parse(`${KST_DATE_FORMAT.format(new Date())}T00:00:00Z`);
  const days = Math.round((todayUtc - createdUtc) / 86_400_000);
  return days <= 0 ? '오늘' : `${days}일 전`;
}

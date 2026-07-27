// 하루의 경계는 서버(record_date)와 동일하게 Asia/Seoul 자정으로 판단한다.
// 기기 로컬 타임존을 쓰면 해외에서 서버와 날짜가 어긋나므로 여기서 KST를 고정한다.
const KST_DATE_FORMAT = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' });

// 이 일수를 넘으면 "N일 전" 대신 절대 날짜로 표시한다.
// "37일 전" 같은 값은 사용자가 날짜를 역산해야 해서 정보 구실을 못 한다.
const RELATIVE_DAYS_LIMIT = 7;

// 가입한 날을 1일째로 포함해 오늘까지 함께한 KST 달력 일수를 계산한다.
export function countInclusiveDaysSince(createdAt: string): number {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) {
    return 0;
  }

  const createdKey = KST_DATE_FORMAT.format(created);
  const todayKey = KST_DATE_FORMAT.format(new Date());
  const createdUtc = Date.parse(`${createdKey}T00:00:00Z`);
  const todayUtc = Date.parse(`${todayKey}T00:00:00Z`);

  return Math.max(1, Math.round((todayUtc - createdUtc) / 86_400_000) + 1);
}

// 메모 작성 시점을 표시한다 ("오늘" / "어제" / "N일 전" / "7월 20일").
// 경과 시간이 아니라 KST 달력 날짜 차이 기준이라, 자정을 넘기면 곧바로 "어제"가 된다.
// (경과 시간으로 계산하면 어젯밤에 적은 메모가 다음 날 아침에도 "오늘"로 남는다)
export function formatRelativeDays(createdAt: string): string {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) {
    return '';
  }
  const createdKey = KST_DATE_FORMAT.format(created);
  const todayKey = KST_DATE_FORMAT.format(new Date());
  const createdUtc = Date.parse(`${createdKey}T00:00:00Z`);
  const todayUtc = Date.parse(`${todayKey}T00:00:00Z`);
  const days = Math.round((todayUtc - createdUtc) / 86_400_000);

  if (days <= 0) {
    return '오늘';
  }
  if (days === 1) {
    return '어제';
  }
  if (days < RELATIVE_DAYS_LIMIT) {
    return `${days}일 전`;
  }

  // createdKey는 이미 KST 기준 YYYY-MM-DD라 그대로 쪼개 쓴다 (재변환 시 타임존 오차 위험).
  const [year, month, day] = createdKey.split('-').map(Number);
  const isSameYear = year === Number(todayKey.slice(0, 4));
  return isSameYear ? `${month}월 ${day}일` : `${year}년 ${month}월 ${day}일`;
}

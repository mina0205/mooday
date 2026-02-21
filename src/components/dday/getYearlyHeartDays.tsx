/**
 * 💘 하트 맵 전용 일수 계산 함수 (매년 리셋 + 윤년 365칸 고정)
 */

export function getYearlyHeartDays(startDate: string) {
  const start = new Date(startDate);
  const now = new Date();

  // 시간 무시, 순수 날짜만 비교
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  // 올해의 기념일 날짜 구하기
  const thisYearAnniversary = new Date(start);
  thisYearAnniversary.setFullYear(now.getFullYear());

  // 오늘이 올해 기념일보다 이전이라면, 기준일은 '작년 기념일'
  let recentAnniversary = new Date(thisYearAnniversary);
  if (now.getTime() < thisYearAnniversary.getTime()) {
    recentAnniversary.setFullYear(now.getFullYear() - 1);
  }

  // 최근 기념일로부터 며칠 지났는지 계산 (시작 당일이 1일차이므로 +1)
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysSince = Math.floor((now.getTime() - recentAnniversary.getTime()) / msPerDay) + 1;

  // 최대 365칸까지만 채우기 (윤년 366일 방어)
  return Math.min(daysSince, 365);
}


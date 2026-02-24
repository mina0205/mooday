// 디데이 날짜 계산 함수

export function getDaysTogether(startDate: string) {
  const start = new Date(startDate);
  const today = new Date();

  const diff =
    today.getTime() -
    new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();

  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

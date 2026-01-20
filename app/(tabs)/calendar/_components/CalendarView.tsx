import React, { useMemo } from 'react';
import { Calendar } from 'react-native-calendars';
import type { Schedule } from '@/src/types/schedule';

const COLORS = {
  MY: '#5DA9FF',
  PARTNER: '#7ED957',
  COUPLE: '#C77DFF',
};

type Props = {
  schedules: Schedule[];
  myUserId: string;
  onSelectDate: (date: string) => void;
};

/* 일정 → 색상 */
function getColor(s: Schedule, myUserId: string) {
  if (s.owner_type === 'COUPLE') return COLORS.COUPLE;
  if (s.owner_user_id === myUserId) return COLORS.MY;
  return COLORS.PARTNER;
}

/* 날짜 +1 */
function addDays(dateString: string, days: number) {
  const d = new Date(dateString);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/* +n */
function getScheduleCountByDate(schedules: Schedule[]) {
  const countMap: Record<string, number> = {};

  schedules.forEach((s) => {
    const start = s.start_date;
    const end = s.end_date ?? s.start_date;

    let current = start;
    while (current <= end) {
      countMap[current] = (countMap[current] ?? 0) + 1;
      current = addDays(current, 1);
    }
  });

  return countMap;
}

export function CalendarView({
  schedules,
  myUserId,
  onSelectDate,
}: Props) {

  /* 1️⃣ 일정별 lane 고정 (같은 일정 = 같은 줄) */
  const scheduleLaneMap = useMemo(() => {
    const map = new Map<string, number>();
    let lane = 0;

    schedules.forEach((s) => {
      if (!map.has(s.id)) {
        map.set(s.id, lane);
        lane += 1;
      }
    });

    return map;
  }, [schedules]);

  /* 2️⃣ multi-period용 markedDates 생성 */
  const markedDates = useMemo(() => {
  const result: Record<string, any> = {};
  const countByDate = getScheduleCountByDate(schedules);

  schedules.forEach((s) => {
    const start = s.start_date;
    const end = s.end_date ?? s.start_date;
    const color = getColor(s, myUserId);

    let current = start;

    while (current <= end) {
      if (!result[current]) {
        result[current] = { periods: [] };
      }

      result[current].periods.push({
        startingDay: current === start,
        endingDay: current === end,
        color,
      });

      current = addDays(current, 1);
    }
  });

  // 🔹 4개 이상인 날짜에 "marked" 추가
  Object.entries(countByDate).forEach(([date, count]) => {
    if (count >= 4) {
      result[date] = {
        ...(result[date] ?? {}),
        marked: true,
        dotColor: '#f2f4f6ff', // +n 힌트용
      };
    }
  });

  return result;
}, [schedules, myUserId]);

  return (
    <Calendar
      markingType="multi-period"
      markedDates={markedDates}

      onDayPress={(day) => onSelectDate(day.dateString)}

      theme={
        {
          calendarBackground: '#000',
          dayTextColor: '#fff',
          monthTextColor: '#fff',
          arrowColor: '#fff',

          // multi-period bar 스타일 (필수)
          'stylesheet.calendar.period': {
            periodContainer: {
              marginTop: 2,
            },
            period: {
              height: 6,
              borderRadius: 3,
            },
          },
        } as any
      }
    />
  );
}

import React, { useMemo } from 'react';
import { Calendar } from 'react-native-calendars';
import type { Schedule } from '@/src/types/schedule';

const MAX_BAR_LINES = 4;

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

function groupSchedulesByDate(schedules: Schedule[]) {
  const map: Record<string, Schedule[]> = {};

  schedules.forEach((s) => {
    const start = s.start_date;
    const end = s.end_date ?? s.start_date;

    let current = start;
    while (current <= end) {
      if (!map[current]) map[current] = [];
      map[current].push(s);
      current = addDays(current, 1);
    }
  });

  return map;
}

export function CalendarView({
  schedules,
  myUserId,
  onSelectDate,
}: Props) {

  /* 일정별 lane 고정 (같은 일정 = 같은 줄) */
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

  /* multi-period용 markedDates 생성 */
  const markedDates = useMemo(() => {
  const result: Record<string, any> = {};
  const byDate = groupSchedulesByDate(schedules);

  Object.entries(byDate).forEach(([date, daySchedules]) => {
    // 우선순위 정렬 (선택)
    const sorted = daySchedules.sort((a, b) => {
      if (a.owner_type === 'COUPLE' && b.owner_type !== 'COUPLE') return -1;
      if (a.owner_type !== 'COUPLE' && b.owner_type === 'COUPLE') return 1;
      return a.start_date.localeCompare(b.start_date);
    });

    const visible = sorted.slice(0, MAX_BAR_LINES);
    const hiddenCount = sorted.length - visible.length;

    result[date] = {
      periods: visible.map((s) => ({
        startingDay: s.start_date === date,
        endingDay: (s.end_date ?? s.start_date) === date,
        color: getColor(s, myUserId),
      })),
    };

    // 초과 일정 힌트
    if (hiddenCount > 0) {
      result[date].marked = true;
      result[date].dotColor = '#fff';
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

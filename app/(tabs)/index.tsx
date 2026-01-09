import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../src/lib/supabase';
import { User } from '@supabase/supabase-js';
import type { Schedule } from '@/src/types/schedule';
import { Calendar } from 'react-native-calendars';

const COLORS = {
  MY: '#5DA9FF',        // 내 개인 일정 (파랑)
  PARTNER: '#7ED957',   // 상대 개인 일정 (초록)
  COUPLE: '#C77DFF',    // 커플 일정 (보라)
};

export default function HomeTab() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  /* ------------------------------
   * 1️⃣ 최초 일정 조회
   * ------------------------------ */
  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setUser(user);

    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      setSchedules(data ?? []);
    } catch (e) {
      console.error('일정 조회 에러:', e);
    }

    setLoading(false);
  };

  /* ------------------------------
   * 2️⃣ 캘린더 줄(색상) 표시용 데이터
   * ------------------------------ */
  const markedDates = useMemo(() => {
    if (!user) return {};

    const result: Record<string, any> = {};

    schedules.forEach((schedule) => {
      const color = getScheduleColor(schedule, user.id);

      let current = schedule.start_date;
      const end = schedule.end_date ?? schedule.start_date;

      while (current <= end) {
        if (!result[current]) {
          result[current] = { periods: [] };
        }

        result[current].periods.push({
          startingDay: current === schedule.start_date,
          endingDay: current === end,
          color,
        });

        current = addDays(current, 1);
      }
    });

    return result;
  }, [schedules, user]);

  /* ------------------------------
   * 3️⃣ 선택된 날짜의 일정만 필터링
   * ------------------------------ */
  const schedulesOfDay = useMemo(() => {
    if (!selectedDate) return [];

    return schedules.filter(
      (s) =>
        s.start_date <= selectedDate &&
        (s.end_date ?? s.start_date) >= selectedDate
    );
  }, [schedules, selectedDate]);

  const mySchedules = schedulesOfDay.filter(
    (s) =>
      s.owner_type === 'PERSONAL' &&
      s.owner_user_id === user?.id
  );

  const partnerSchedules = schedulesOfDay.filter(
    (s) =>
      s.owner_type === 'PERSONAL' &&
      s.owner_user_id !== user?.id
  );

  const coupleSchedules = schedulesOfDay.filter(
    (s) => s.owner_type === 'COUPLE'
  );

  /* ------------------------------
   * 로딩 화면
   * ------------------------------ */
  if (loading) {
    return (
      <View style={{ padding: 20 }}>
        <Text>일정 불러오는 중...</Text>
      </View>
    );
  }

  /* ------------------------------
   * 렌더링
   * ------------------------------ */
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {/* 📅 캘린더 */}
      <Calendar
        markingType="multi-period"
        markedDates={markedDates}
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
        }}
        theme={{
          calendarBackground: '#000',
          dayTextColor: '#fff',
          monthTextColor: '#fff',
          arrowColor: '#fff',
          todayTextColor: '#5DA9FF',
        }}
      />

      {/* 📌 선택된 날짜 Overlay 카드 */}
      {selectedDate && (
        <View style={styles.overlay}>
          <Text style={styles.dateTitle}>{selectedDate}</Text>

          <Section
            title="내 개인 일정"
            color={COLORS.MY}
            schedules={mySchedules}
          />

          <Section
            title="상대 일정"
            color={COLORS.PARTNER}
            schedules={partnerSchedules}
          />

          <Section
            title="커플 일정"
            color={COLORS.COUPLE}
            schedules={coupleSchedules}
          />
        </View>
      )}
    </View>
  );
}

/* ------------------------------
 * 공통 섹션 컴포넌트
 * ------------------------------ */
function Section({
  title,
  color,
  schedules,
}: {
  title: string;
  color: string;
  schedules: Schedule[];
}) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ color, fontWeight: 'bold' }}>{title}</Text>
      {schedules.length === 0 && (
        <Text style={{ color: '#777', marginTop: 4 }}>
          일정 없음
        </Text>
      )}
      {schedules.map((s) => (
        <Text key={s.id} style={{ color: '#fff', marginTop: 4 }}>
          • {s.title}
        </Text>
      ))}
    </View>
  );
}

/* ------------------------------
 * 유틸 함수들
 * ------------------------------ */
function getScheduleColor(schedule: Schedule, myUserId: string) {
  if (schedule.owner_type === 'COUPLE') return COLORS.COUPLE;
  if (schedule.owner_user_id === myUserId) return COLORS.MY;
  return COLORS.PARTNER;
}

function addDays(dateString: string, days: number) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

/* ------------------------------
 * 스타일
 * ------------------------------ */
const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#111',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  dateTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

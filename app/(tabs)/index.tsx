import { View, Text, Button} from 'react-native';
import { useEffect, useState,useMemo } from 'react';
import { supabase } from '../../src/lib/supabase';
import { User } from '@supabase/supabase-js';
import type { Schedule } from '@/src/types/schedule'; //스케줄 타입 분기
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

  const myUserId = user?.id;

  const myPersonal = schedules.filter(
    (s) =>
      s.owner_type === 'PERSONAL' &&
      s.owner_user_id === myUserId
  );

  const partnerPersonal = schedules.filter(
    (s) =>
      s.owner_type === 'PERSONAL' &&
      s.owner_user_id !== myUserId
  );

  const coupleSchedules = schedules.filter(
    (s) => s.owner_type === 'COUPLE'
  );



  //📍 React Native에서 화면 열리자마자 "일정 조회 실행"
  useEffect(() => {
    fetchSchedules();
  }, []);

  // 일정 조회
  const fetchSchedules = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }
    setUser(user);
    //console.log('현재 로그인 유저 ID:', user?.id);

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


  // 일정 추가 
  const createTestSchedule = async () => {
    console.log('버튼 눌림');
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const now = new Date().toISOString().slice(0, 10);

    const { error } = await supabase.from('schedules').insert({
      title: '테스트 일정',
      start_date: now,
      end_date: now,
      owner_type: 'PERSONAL',
      owner_user_id: user.id,
    });

    if (error) {
      console.error(error);
    } else {
      fetchSchedules(); 
    }
  };

   // 캘린더용 데이터 변환하기 
    const calendarEvents = schedules.map((s) => ({
      id: s.id,
      title: s.title,
      start: s.start_date,
      end: s.end_date ?? s.start_date,
    }));
    console.log('캘린더 이벤트:', calendarEvents);

    // schedules → markedDates 변환 
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


  if (loading) {
    return (
      <View style={{ padding: 20 }}>
        <Text>일정 불러오는 중...</Text>
      </View>
    );
  }

  //이 일정이 무슨 색인지 반환하는 함수 
 function getScheduleColor(
    schedule: Schedule,
    myUserId: string
  ) {
    if (schedule.owner_type === 'COUPLE') {
      return COLORS.COUPLE;
    }

    if (schedule.owner_user_id === myUserId) {
      return COLORS.MY;
    }

    return COLORS.PARTNER;
  }

  //날짜+1 하는 함수
  function addDays(dateString: string, days: number) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }

  return (
  <View style={{ padding: 16 }}>
    
    {/* 📅 캘린더 영역 (상단/중앙) */}
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
      }}
    />


      {/* 📝 하단 메모 영역 */}
      <View style={{ padding: 16 }}>
        <Text style={{ fontWeight: 'bold' }}>📝 중요한 메모</Text>
        <Text style={{ color: '#666', marginTop: 8 }}>
          아직 메모가 없습니다
        </Text>
      </View>

  </View>
);

}

import { View, Text, Pressable, Button} from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../../src/lib/supabase';

type Schedule = {
  id: string;
  title: string;
  start_date: string;
};

export default function HomeTab() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  //📍 React Native에서 화면 열리자마자 조회 실행
  useEffect(() => {
    fetchSchedules();
  }, []);

  // 일정 조회
  const fetchSchedules = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log('현재 로그인 유저 ID:', user?.id);
    
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) throw error;
    console.log('조회된 일정:', data);
  } catch (e) {
    console.error('일정 조회 에러:', e);
  }
};


  // 일정 추가 
  const createTestSchedule = async () => {
    console.log('버튼 눌림');
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const now = new Date().toISOString();

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

  if (loading) {
    return (
      <View style={{ padding: 20 }}>
        <Text>일정 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>
        📅 내 일정
      </Text>

      <Button
        title="➕ 일정 하나 추가하기 (테스트)"
        onPress={createTestSchedule}
      />

      {schedules.length === 0 ? (
        <Text>아직 일정이 없어요</Text>
      ) : (
        schedules.map((item) => (
          <Text key={item.id}>
            • {item.title} ({item.start_date})
          </Text>
        ))
      )}
    </View>
  );
}

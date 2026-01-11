import {
  View,
  Text,
  StyleSheet,
  Button,
  Modal,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../src/lib/supabase';
import { User } from '@supabase/supabase-js';
import type { Schedule } from '@/src/types/schedule';
import { Calendar } from 'react-native-calendars';

/* ------------------------------
 * 색상 상수
 * ------------------------------ */
const COLORS = {
  MY: '#5DA9FF',
  PARTNER: '#7ED957',
  COUPLE: '#C77DFF',
};

export default function HomeTab() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [scheduleType, setScheduleType] = useState<'PERSONAL' | 'COUPLE'>('PERSONAL');
  const [userCoupleId, setUserCoupleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Modal 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');

  /* ------------------------------
   * 1️⃣ 일정 조회
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

    await fetchMyCoupleId();
    //console.log('auth uid', user.id);

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

  const fetchMyCoupleId = async () => {
    const { data, error } = await supabase
      .from('couple_members')
      .select('couple_id')
      .single(); // 커플은 1명당 1개 허용

    if (error) {
      // 커플이 없는 경우도 error로 떨어질 수 있음
      console.log('커플 없음 또는 조회 실패', error.message);
      setUserCoupleId(null);
      return;
    }

    setUserCoupleId(data.couple_id);
  };
  /* ------------------------------
   * 2️⃣ 일정 생성 (Modal 저장)
   * ------------------------------ */
  const handleCreateSchedule = async () => {
    
    if (scheduleType === 'COUPLE' && !userCoupleId) {
      alert('커플이 연결된 후에 커플 일정을 추가할 수 있어요');
      return;
    }
    if (!title.trim()) {
      alert('제목은 필수입니다');
      return;
    }
    if (!user || !selectedDate) return;

    const { error } = await supabase.from('schedules').insert({
      title,
      memo: memo || null,
      start_date: selectedDate,
      end_date: selectedDate,
      owner_type: scheduleType,
      owner_user_id: user.id,
      couple_id: scheduleType === 'COUPLE' ? userCoupleId : null,
    });

    if (error) {
      console.error(error);
      alert('일정 저장 실패');
      return;
    }

    setIsModalOpen(false);
    setTitle('');
    setMemo('');
    setScheduleType('PERSONAL');
    fetchSchedules();
  };

  /* ------------------------------
   * 3️⃣ 캘린더 줄 표시 데이터
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
   * 4️⃣ 선택 날짜 일정 필터링
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
    (s) => s.owner_type === 'PERSONAL' && s.owner_user_id === user?.id
  );
  const partnerSchedules = schedulesOfDay.filter(
    (s) => s.owner_type === 'PERSONAL' && s.owner_user_id !== user?.id
  );
  const coupleSchedules = schedulesOfDay.filter(
    (s) => s.owner_type === 'COUPLE'
  );

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
        onDayPress={(day) => setSelectedDate(day.dateString)}
        theme={{
          calendarBackground: '#000',
          dayTextColor: '#fff',
          monthTextColor: '#fff',
          arrowColor: '#fff',
          todayTextColor: COLORS.MY,
        }}
      />

      <Button title="＋ 일정 추가" onPress={() => setIsModalOpen(true)} />

      {/* 📌 선택 날짜 카드 */}
      {selectedDate && (
        <View style={styles.overlay}>
          <Text style={styles.dateTitle}>{selectedDate}</Text>
          <Section title="내 개인 일정" color={COLORS.MY} schedules={mySchedules} />
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

      {/* ➕ 일정 추가 Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>일정 추가</Text>

            <Text style={{ marginBottom: 8 }}>일정 타입</Text>

              <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                <TouchableOpacity
                  onPress={() => setScheduleType('PERSONAL')}
                  style={{
                    marginRight: 12,
                    padding: 8,
                    borderRadius: 8,
                    backgroundColor:
                      scheduleType === 'PERSONAL' ? '#5DA9FF' : '#eee',
                  }}
                >
                  <Text
                    style={{
                      color: scheduleType === 'PERSONAL' ? '#fff' : '#000',
                    }}
                  >
                    개인
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setScheduleType('COUPLE')}
                  style={{
                    padding: 8,
                    borderRadius: 8,
                    backgroundColor:
                      scheduleType === 'COUPLE' ? '#C77DFF' : '#eee',
                  }}
                >
                  <Text
                    style={{
                      color: scheduleType === 'COUPLE' ? '#fff' : '#000',
                    }}
                  >
                    커플
                  </Text>
                </TouchableOpacity>
              </View>

            <Text>제목 *</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="예: 데이트"
              style={styles.input}
            />

            <Text>메모</Text>
            <TextInput
              value={memo}
              onChangeText={setMemo}
              placeholder="상세 메모 (선택)"
              multiline
              style={[styles.input, { height: 80 }]}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Text>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateSchedule}>
                <Text style={{ color: COLORS.MY, fontWeight: 'bold' }}>
                  저장
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ------------------------------
 * 공통 컴포넌트
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
        <Text style={{ color: '#777', marginTop: 4 }}>일정 없음</Text>
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
 * 유틸
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
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
});

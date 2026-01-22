import {
  View,
  Text,
  StyleSheet,
  Button,
  Modal,
  TextInput,
  TouchableOpacity,
   Alert
} from 'react-native';
import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../../src/lib/supabase';
import { User } from '@supabase/supabase-js';
import type { Schedule } from '@/src/types/schedule';
import { CalendarView } from './_components/CalendarView';
import { DaySchedulePanel } from './_components/DaySchedulePanel';
import {CoupleNotice } from './_components/CoupleNotice';
import DateTimePicker from '@react-native-community/datetimepicker';

/* ------------------------------
 * 색상
 * ------------------------------ */
const COLORS = {
  MY: '#5DA9FF',
  PARTNER: '#7ED957',
  COUPLE: '#C77DFF',
};

export default function HomeTab() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [calendarMode, setCalendarMode] = useState<'VIEW' | 'ADD'>('VIEW');

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const [scheduleType, setScheduleType] =
    useState<'PERSONAL' | 'COUPLE'>('PERSONAL');

  const [userCoupleId, setUserCoupleId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);


  /* ------------------------------
   * 일정 조회
   * ------------------------------ */
  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUser(user);
    await fetchMyCoupleId();

    const { data } = await supabase
      .from('schedules')
      .select('*')
      .order('start_date');

    setSchedules(data ?? []);
    setLoading(false);
  };

  const fetchMyCoupleId = async () => {
    const { data } = await supabase
      .from('couple_members')
      .select('couple_id')
      .single();

    setUserCoupleId(data?.couple_id ?? null);
  };

  /* ------------------------------
   * 일정 저장 -> 추가, 수정 분기 
   * ------------------------------ */
  const handleSaveSchedule = async () => {
  if (!user) return;

  if (!title.trim()) {
    alert('제목은 필수입니다');
    return;
  }

  if (!startDate) {
    alert('날짜를 선택해주세요');
    return;
  }

  const payload = {
    title,
    memo: memo || null,
    start_date: startDate,
    end_date: endDate ?? startDate,
    owner_type: scheduleType,
    owner_user_id: user.id,
    couple_id: scheduleType === 'COUPLE' ? userCoupleId : null,
  };

  //  수정
  if (editingSchedule) {
    const { error } = await supabase
      .from('schedules')
      .update(payload)
      .eq('id', editingSchedule.id);

    if (error) {
    console.error('수정 에러:', error);
      alert('수정 실패');
      return;
    }

    setSchedules((prev) =>
      prev.map((s) =>
        s.id === editingSchedule.id
          ? { ...s, ...payload }
          : s
      )
    );
  }
  //  추가
  else {
    const { error } = await supabase
      .from('schedules')
      .insert(payload);

    if (error) {
    console.error('저장 에러:', error);
      alert('저장 실패');
      return;
    }

    await fetchSchedules();
  }

  closeModal();
};

  /* ------------------------------
   * 일정 삭제 
   * ------------------------------ */
const handleDeleteSchedule = () => {
//수정 상태가 아니면 '삭제'를 표시하지 않음  
  if (!editingSchedule) return;

  Alert.alert(
    '일정 삭제',
    '이 일정을 삭제할까요?',
    [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase
            .from('schedules')
            .delete()
            .eq('id', editingSchedule.id);

          if (error) {
            console.error('삭제 에러:', error);
            alert('삭제 실패');
            return;
          }

          // 로컬 상태 반영
          setSchedules((prev) =>
            prev.filter((s) => s.id !== editingSchedule.id)
          );

          setEditingSchedule(null);
          setIsModalOpen(false);   
          setSelectedDate(null);  
        },
      },
    ],
  );
};

  /* ------------------------------
   * markedDates
   * ------------------------------ */
  

  /* ------------------------------
   * 날짜 기준 필터링  
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


  /* ------------------------------
   * 캘린더 클릭
   * ------------------------------ */
  const handleCalendarPress = (date: string) => {
    if (calendarMode === 'VIEW') {
      setSelectedDate(prev => (prev === date ? null : date));
    }
  };

/* ------------------------------
   * closeModal
   * ------------------------------ */
  const closeModal = () => {
    setIsModalOpen(false);
    setCalendarMode('VIEW');
    
    setTitle('');
    setMemo('');
    setScheduleType('PERSONAL');
    setStartDate(null);
    setEndDate(null);
    setEditingSchedule(null);
  };

  if (loading) return <Text>로딩중...</Text>;

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>

        <Button
        title="로그아웃"
        onPress={async () => {
            await supabase.auth.signOut();
            alert('로그아웃 완료. 앱 다시 실행하세요');
        }}
        />

      <CalendarView
        //markedDates={markedDates}
        schedules={schedules} 
        myUserId={user?.id ?? ''}
        onSelectDate={handleCalendarPress}
      />

      <Button
        title="＋ 일정 추가"
        onPress={() => {
            setCalendarMode('ADD');
            // 일정 추가 후 이전 입력값 초기화
            setTitle('');
            setMemo('');
            setScheduleType('PERSONAL');
            setStartDate(null);
            setEndDate(null);

            setIsModalOpen(true);
        }}
    />
      {!selectedDate && userCoupleId && (
            <CoupleNotice coupleId={userCoupleId} />
            )}
       
      {calendarMode === 'VIEW' && selectedDate && (
        <DaySchedulePanel
            date={selectedDate}
            mySchedules={mySchedules}
            partnerSchedules={partnerSchedules}
            coupleSchedules={coupleSchedules}
            onPressSchedule={(schedule) => {
            // 수정 모드 진입
            setEditingSchedule(schedule);
            setCalendarMode('ADD');
            setIsModalOpen(true);

            // 기존 값 세팅
            setTitle(schedule.title);
            setMemo(schedule.memo ?? '');
            setScheduleType(schedule.owner_type);
            setStartDate(schedule.start_date);
            setEndDate(schedule.end_date);
            }}
            onClose={() => {
                setSelectedDate(null);   
            }}
        />
        )}

      {/* ---------------- Modal ---------------- */}
      <Modal visible={isModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>일정 추가</Text>

            {/*  일정 타입 선택 */}
            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
              일정 타입 <Text style={{ color: 'red' }}>*</Text>
            </Text>

            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
              <TouchableOpacity
                onPress={() => setScheduleType('PERSONAL')}
                style={[
                  styles.typeButton,
                  scheduleType === 'PERSONAL' && styles.typeButtonPersonal,
                ]}
              >
                <Text style={{ color: scheduleType === 'PERSONAL' ? '#fff' : '#000' }}>
                  개인
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setScheduleType('COUPLE')}
                style={[
                  styles.typeButton,
                  scheduleType === 'COUPLE' && styles.typeButtonCouple,
                ]}
              >
                <Text style={{ color: scheduleType === 'COUPLE' ? '#fff' : '#000' }}>
                  커플
                </Text>
              </TouchableOpacity>
            </View>

            {/* 날짜 선택 */}
            <Text style={{ fontWeight: 'bold' }}>
              날짜 <Text style={{ color: 'red' }}>*</Text>
            </Text>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                console.log('start picker open');
                setShowStartPicker(true);
            }}
            >
              <Text>시작 날짜: {startDate ?? '선택'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                if (!startDate) {
                  alert('시작 날짜를 먼저 선택하세요');
                  return;
                }
                setShowEndPicker(true);
              }}
            >
              <Text>종료 날짜: {endDate ?? '선택'}</Text>
            </TouchableOpacity>

            <Text style={{ fontWeight: 'bold' }}>
                제목 <Text style={{ color: 'red' }}>*</Text>
            </Text>
            <TextInput value={title} onChangeText={setTitle} style={styles.input} />

            <Text style={{ fontWeight: 'bold' }}>
                메모
            </Text>
            <TextInput
              value={memo}
              onChangeText={setMemo}
              multiline
              style={[styles.input, { height: 80 }]}
            />

            <View style={styles.modalButtons}>
            {editingSchedule && (
                <TouchableOpacity
                onPress={handleDeleteSchedule}
                style={{ marginRight: 'auto' }}
                >
                <Text style={{ color: 'red', fontWeight: 'bold' }}>
                    삭제
                </Text>
                </TouchableOpacity>
            )}
              <TouchableOpacity onPress={closeModal}>
                <Text>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveSchedule}>
                <Text style={{ color: COLORS.MY, fontWeight: 'bold' }}>
                  저장
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ===== iOS Date Picker 영역 ===== */}
        {showStartPicker && (
        <View style={styles.pickerWrapper}>
            <DateTimePicker
            value={startDate ? new Date(startDate) : new Date()}
            mode="date"
            display="spinner"
            onChange={(event, date) => {
                if (event.type === 'dismissed') {
                setShowStartPicker(false);
                return;
                }

                setShowStartPicker(false);

                if (date) {
                const formatted = date.toISOString().slice(0, 10);
                setStartDate(formatted);

                if (!endDate || endDate < formatted) {
                    setEndDate(formatted);
                }
                }
            }}
            />
        </View>
        )}

        {showEndPicker && (
        <View style={styles.pickerWrapper}>
            <DateTimePicker
            value={endDate ? new Date(endDate) : new Date(startDate ?? new Date())}
            mode="date"
            display="spinner"
            minimumDate={startDate ? new Date(startDate) : undefined}
            onChange={(event, date) => {
                if (event.type === 'dismissed') {
                setShowEndPicker(false);
                return;
                }

                setShowEndPicker(false);

                if (date) {
                const formatted = date.toISOString().slice(0, 10);
                setEndDate(formatted);
                }
            }}
            />
        </View>
        )}

      </Modal>

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
  const d = new Date(dateString);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/* ------------------------------
 * 스타일
 * ------------------------------ */
const styles = StyleSheet.create({
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
    marginBottom: 12,
  },
  dateButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginRight: 12,
  },
  typeButtonPersonal: {
    backgroundColor: COLORS.MY,
  },
  typeButtonCouple: {
    backgroundColor: COLORS.COUPLE,
  },
  pickerWrapper: {
  backgroundColor: '#fff',
  marginTop: 12,
  borderRadius: 12,
  overflow: 'hidden',
},


});

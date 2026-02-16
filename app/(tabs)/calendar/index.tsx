import {
  View, Text, StyleSheet, Button, Modal,
  TextInput, TouchableOpacity, Alert
} from 'react-native';
import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../../src/lib/supabase';
import { User } from '@supabase/supabase-js';
import type { Schedule } from '@/src/types/schedule';
import { CalendarView } from '@/src/components/calendar/CalendarView';
import { DaySchedulePanel } from '@/src/components/calendar/DaySchedulePanel';
import { CoupleNotice } from '@/src/components/calendar/CoupleNotice';
import DateTimePicker from '@react-native-community/datetimepicker';
import MenuButton from '@/components/MenuButton';

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
  const [scheduleType, setScheduleType] = useState<'PERSONAL' | 'COUPLE'>('PERSONAL');
  const [userCoupleId, setUserCoupleId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [coupleUserIds, setCoupleUserIds] = useState<string[]>([]);

  useEffect(() => { init(); }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    setUser(user);
    const { data: coupleId, error: coupleErr } = await supabase.rpc('get_my_couple_id');
    if (coupleErr) { console.error('내 커플 ID 조회 실패:', coupleErr); return; }
    setUserCoupleId(coupleId);
    const { data: userIds, error: usersErr } = await supabase.rpc('get_couple_user_ids');
    if (usersErr) { console.error('커플 유저 조회 실패:', usersErr); return; }
    setCoupleUserIds(userIds ?? []);
    const { data: schedules } = await supabase.from('schedules').select('*').order('start_date');
    setSchedules(schedules ?? []);
    setLoading(false);
  };

  const schedulesOfDay = useMemo(() => {
    if (!selectedDate) return [];
    const selected = toDate(selectedDate);
    return schedules.filter((s) => {
      const start = toDate(s.start_date);
      const end = toDate(s.end_date ?? s.start_date);
      return start <= selected && selected <= end;
    });
  }, [schedules, selectedDate]);

  const mySchedules = schedulesOfDay.filter(
    (s) => s.owner_type === 'PERSONAL' && s.owner_user_id === user?.id
  );
  const partnerUserId = coupleUserIds.find((id) => id !== user?.id) ?? null;
  const partnerSchedules = schedulesOfDay.filter(
    (s) => s.owner_type === 'PERSONAL' && s.owner_user_id === partnerUserId
  );
  const coupleSchedules = schedulesOfDay.filter((s) => s.owner_type === 'COUPLE');

  const handleSaveSchedule = async () => {
    if (!user || !startDate || !title.trim()) return;
    if (scheduleType === 'COUPLE' && !userCoupleId) {
      Alert.alert('커플 정보 없음', '커플 연결이 완료되지 않았어요.');
      return;
    }
    const payload = {
      title, memo: memo || null, start_date: startDate,
      end_date: endDate ?? startDate, owner_type: scheduleType,
      owner_user_id: user.id,
      couple_id: scheduleType === 'COUPLE' ? userCoupleId : null,
    };
    if (editingSchedule) {
      const { data, error } = await supabase.from('schedules').update(payload).eq('id', editingSchedule.id).select();
      if (error || !data || data.length === 0) { Alert.alert('권한 없음', '이 일정은 수정할 수 없어요.'); return; }
    } else {
      const { error } = await supabase.from('schedules').insert(payload);
      if (error) { Alert.alert('저장 실패', '일정을 저장할 수 없어요.'); return; }
    }
    await init();
    closeModal();
  };

  const handleDeleteSchedule = () => {
    if (!editingSchedule) return;
    Alert.alert('일정 삭제', '이 일정을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제', style: 'destructive',
        onPress: async () => {
          const { data, error } = await supabase.from('schedules').delete().eq('id', editingSchedule.id).select();
          if (error || !data || data.length === 0) { Alert.alert('권한 없음', '이 일정은 삭제할 수 없어요.'); return; }
          setSchedules(prev => prev.filter(s => s.id !== editingSchedule.id));
          await init();
          setEditingSchedule(null);
          setIsModalOpen(false);
        },
      },
    ]);
  };

  const handleCalendarPress = (date: string) => {
    if (calendarMode === 'VIEW') setSelectedDate(prev => (prev === date ? null : date));
  };

  const closeModal = () => {
    setIsModalOpen(false); setCalendarMode('VIEW');
    setTitle(''); setMemo(''); setScheduleType('PERSONAL');
    setStartDate(null); setEndDate(null); setEditingSchedule(null);
  };

  if (loading || !user) return <Text>로딩중...</Text>;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 40 }}>
      {/* 메뉴 버튼 */}
      <MenuButton />

      <CalendarView schedules={schedules} myUserId={user?.id ?? ''} onSelectDate={handleCalendarPress} />

      <Button
        title="＋ 일정 추가"
        onPress={() => {
          setCalendarMode('ADD');
          setTitle(''); setMemo(''); setScheduleType('PERSONAL');
          setStartDate(null); setEndDate(null);
          setIsModalOpen(true);
        }}
      />

      {!selectedDate && userCoupleId && <CoupleNotice coupleId={userCoupleId} />}

      {calendarMode === 'VIEW' && selectedDate && user && userCoupleId && coupleUserIds.length > 0 && (
        <DaySchedulePanel
          date={selectedDate}
          mySchedules={mySchedules}
          partnerSchedules={partnerSchedules}
          coupleSchedules={coupleSchedules}
          onPressSchedule={(schedule) => {
            setEditingSchedule(schedule); setCalendarMode('ADD'); setIsModalOpen(true);
            setTitle(schedule.title); setMemo(schedule.memo ?? '');
            setScheduleType(schedule.owner_type);
            setStartDate(schedule.start_date); setEndDate(schedule.end_date);
          }}
          onClose={() => setSelectedDate(null)}
        />
      )}

      <Modal visible={isModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>일정 추가</Text>
            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>일정 타입 <Text style={{ color: 'red' }}>*</Text></Text>
            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
              <TouchableOpacity onPress={() => setScheduleType('PERSONAL')} style={[styles.typeButton, scheduleType === 'PERSONAL' && styles.typeButtonPersonal]}>
                <Text style={{ color: scheduleType === 'PERSONAL' ? '#fff' : '#000' }}>개인</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setScheduleType('COUPLE')} style={[styles.typeButton, scheduleType === 'COUPLE' && styles.typeButtonCouple]}>
                <Text style={{ color: scheduleType === 'COUPLE' ? '#fff' : '#000' }}>커플</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontWeight: 'bold' }}>날짜 <Text style={{ color: 'red' }}>*</Text></Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartPicker(true)}>
              <Text>시작 날짜: {startDate ?? '선택'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateButton} onPress={() => { if (!startDate) { alert('시작 날짜를 먼저 선택하세요'); return; } setShowEndPicker(true); }}>
              <Text>종료 날짜: {endDate ?? '선택'}</Text>
            </TouchableOpacity>
            <Text style={{ fontWeight: 'bold' }}>제목 <Text style={{ color: 'red' }}>*</Text></Text>
            <TextInput value={title} onChangeText={setTitle} style={styles.input} />
            <Text style={{ fontWeight: 'bold' }}>메모</Text>
            <TextInput value={memo} onChangeText={setMemo} multiline style={[styles.input, { height: 80 }]} />
            <View style={styles.modalButtons}>
              {editingSchedule && (
                <TouchableOpacity onPress={handleDeleteSchedule} style={{ marginRight: 'auto' }}>
                  <Text style={{ color: 'red', fontWeight: 'bold' }}>삭제</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={closeModal}><Text>취소</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleSaveSchedule}>
                <Text style={{ color: COLORS.MY, fontWeight: 'bold' }}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {showStartPicker && (
          <View style={styles.pickerWrapper}>
            <DateTimePicker
              value={startDate ? new Date(startDate) : new Date()}
              mode="date" display="spinner"
              onChange={(event, date) => {
                if (event.type === 'dismissed') { setShowStartPicker(false); return; }
                setShowStartPicker(false);
                if (date) {
                  const formatted = date.toISOString().slice(0, 10);
                  setStartDate(formatted);
                  if (!endDate || endDate < formatted) setEndDate(formatted);
                }
              }}
            />
          </View>
        )}
        {showEndPicker && (
          <View style={styles.pickerWrapper}>
            <DateTimePicker
              value={endDate ? new Date(endDate) : new Date(startDate ?? new Date())}
              mode="date" display="spinner"
              minimumDate={startDate ? new Date(startDate) : undefined}
              onChange={(event, date) => {
                if (event.type === 'dismissed') { setShowEndPicker(false); return; }
                setShowEndPicker(false);
                if (date) setEndDate(date.toISOString().slice(0, 10));
              }}
            />
          </View>
        )}
      </Modal>
    </View>
  );
}

function toDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: 8, marginBottom: 12 },
  dateButton: { padding: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.4)', borderRadius: 8, marginBottom: 8 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  typeButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#eee', marginRight: 12 },
  typeButtonPersonal: { backgroundColor: COLORS.MY },
  typeButtonCouple: { backgroundColor: COLORS.COUPLE },
  pickerWrapper: { backgroundColor: '#fff', marginTop: 12, borderRadius: 12, overflow: 'hidden' },
});
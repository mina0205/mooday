import MenuButton from '@/components/MenuButton';
import type { Schedule } from '@/src/types/schedule';
import DateTimePicker from '@react-native-community/datetimepicker';
import { User } from '@supabase/supabase-js';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../../src/lib/supabase';

const COLORS = {
  MY: '#6EC6FF',
  PARTNER: '#FF9EAA',
  COUPLE: '#C77DFF',
  BG: '#000000',
  CARD: '#1a1a1a',
  BORDER: '#2a2a2a',
  TEXT: '#FFFFFF',
  SUBTEXT: '#888888',
};

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

function toDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

export default function HomeTab() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [scheduleType, setScheduleType] = useState<'PERSONAL' | 'COUPLE'>('PERSONAL');
  const [userCoupleId, setUserCoupleId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [coupleUserIds, setCoupleUserIds] = useState<string[]>([]);
  const [coupleNotice, setCoupleNotice] = useState<string | null>(null);

  useEffect(() => { init(); }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    setUser(user);

    const { data: coupleId } = await supabase.rpc('get_my_couple_id');
    setUserCoupleId(coupleId);

    const { data: userIds } = await supabase.rpc('get_couple_user_ids');
    setCoupleUserIds(userIds ?? []);

    const { data: schedules } = await supabase.from('schedules').select('*').order('start_date');
    setSchedules(schedules ?? []);

    if (coupleId) {
      const { data: notice } = await supabase
        .from('couple_notices')
        .select('content')
        .eq('couple_id', coupleId)
        .maybeSingle();
      setCoupleNotice(notice?.content ?? null);
    }

    setLoading(false);
  };

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [currentYear, currentMonth]);

  const getSchedulesForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const d = toDate(dateStr);
    return schedules.filter(s => {
      const start = toDate(s.start_date);
      const end = toDate(s.end_date ?? s.start_date);
      return start <= d && d <= end;
    });
  };

  const getDotColors = (day: number) => {
    const daySchedules = getSchedulesForDay(day);
    const colors: string[] = [];
    if (daySchedules.some(s => s.owner_type === 'PERSONAL' && s.owner_user_id === user?.id)) colors.push(COLORS.MY);
    const partnerId = coupleUserIds.find(id => id !== user?.id);
    if (partnerId && daySchedules.some(s => s.owner_type === 'PERSONAL' && s.owner_user_id === partnerId)) colors.push(COLORS.PARTNER);
    if (daySchedules.some(s => s.owner_type === 'COUPLE')) colors.push(COLORS.COUPLE);
    return colors;
  };

  const selectedSchedules = useMemo(() => {
    if (!selectedDate) return [];
    const d = toDate(selectedDate);
    return schedules.filter(s => {
      const start = toDate(s.start_date);
      const end = toDate(s.end_date ?? s.start_date);
      return start <= d && d <= end;
    });
  }, [schedules, selectedDate]);

  const partnerId = coupleUserIds.find(id => id !== user?.id) ?? null;
  const mySchedules = selectedSchedules.filter(s => s.owner_type === 'PERSONAL' && s.owner_user_id === user?.id);
  const partnerSchedules = selectedSchedules.filter(s => s.owner_type === 'PERSONAL' && s.owner_user_id === partnerId);
  const coupleSchedules = selectedSchedules.filter(s => s.owner_type === 'COUPLE');

  const handleSaveSchedule = async () => {
    if (!user || !startDate || !title.trim()) {
      Alert.alert('필수 항목을 입력해주세요', '제목과 날짜는 필수예요.');
      return;
    }
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
      if (error || !data?.length) { Alert.alert('권한 없음', '이 일정은 수정할 수 없어요.'); return; }
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
          if (error || !data?.length) { Alert.alert('권한 없음', '이 일정은 삭제할 수 없어요.'); return; }
          await init();
          closeModal();
        },
      },
    ]);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShowStartPicker(false);
    setShowEndPicker(false);
    setTitle(''); setMemo(''); setScheduleType('PERSONAL');
    setStartDate(null); setEndDate(null); setEditingSchedule(null);
  };

  const openEditModal = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setTitle(schedule.title);
    setMemo(schedule.memo ?? '');
    setScheduleType(schedule.owner_type);
    setStartDate(schedule.start_date);
    setEndDate(schedule.end_date);
    setIsModalOpen(true);
  };

  const today = formatDate(new Date());

  if (loading || !user) return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>불러오는 중...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <MenuButton />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>우리의 캘린더</Text>
          <Text style={styles.headerSub}>{currentYear}년 {MONTHS[currentMonth]}</Text>
        </View>

        {/* 공지사항 */}
        {coupleNotice && (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeIcon}>💌</Text>
            <Text style={styles.noticeText}>{coupleNotice}</Text>
          </View>
        )}

        {/* 범례 */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.MY }]} />
            <Text style={styles.legendText}>나</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.PARTNER }]} />
            <Text style={styles.legendText}>상대</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.COUPLE }]} />
            <Text style={styles.legendText}>커플</Text>
          </View>
        </View>

        {/* 캘린더 카드 */}
        <View style={styles.calendarCard}>
          <View style={styles.monthNav}>
            <TouchableOpacity
              onPress={() => {
                if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
                else setCurrentMonth(m => m - 1);
              }}
              style={styles.navBtn}
            >
              <Text style={styles.navBtnText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{currentYear}년 {MONTHS[currentMonth]}</Text>
            <TouchableOpacity
              onPress={() => {
                if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
                else setCurrentMonth(m => m + 1);
              }}
              style={styles.navBtn}
            >
              <Text style={styles.navBtnText}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weekRow}>
            {WEEK_DAYS.map((d, i) => (
              <Text key={d} style={[styles.weekDay, i === 0 && { color: '#FF6B6B' }, i === 6 && { color: COLORS.MY }]}>{d}</Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {calendarDays.map((day, idx) => {
              if (!day) return <View key={`empty-${idx}`} style={styles.dayCell} />;
              const dateStr = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === today;
              const dots = getDotColors(day);
              const isSun = idx % 7 === 0;
              const isSat = idx % 7 === 6;

              return (
                <TouchableOpacity
                  key={dateStr}
                  style={styles.dayCell}
                  onPress={() => setSelectedDate(dateStr)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.dayInner,
                    isSelected && styles.daySelected,
                    isToday && !isSelected && styles.dayToday,
                  ]}>
                    <Text style={[
                      styles.dayText,
                      isSelected && styles.dayTextSelected,
                      isToday && !isSelected && styles.dayTextToday,
                      isSun && !isSelected && { color: '#FF6B6B' },
                      isSat && !isSelected && { color: COLORS.MY },
                    ]}>
                      {day}
                    </Text>
                    {dots.length > 0 && (
                      <View style={styles.dotsRow}>
                        {dots.map((color, i) => (
                          <View key={i} style={[styles.dot, { backgroundColor: color }]} />
                        ))}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 선택된 날짜 일정 */}
        {selectedDate && (
          <View style={styles.scheduleSection}>
            <Text style={styles.scheduleDateTitle}>
              {selectedDate.replace(/-/g, '.')} 일정
            </Text>

            {mySchedules.length === 0 && partnerSchedules.length === 0 && coupleSchedules.length === 0 ? (
              <View style={styles.emptySchedule}>
                <Text style={styles.emptyScheduleEmoji}>📭</Text>
                <Text style={styles.emptyScheduleText}>이 날은 일정이 없어요</Text>
              </View>
            ) : (
              <>
                {mySchedules.length > 0 && (
                  <View style={styles.scheduleGroup}>
                    <View style={styles.scheduleGroupHeader}>
                      <View style={[styles.scheduleGroupDot, { backgroundColor: COLORS.MY }]} />
                      <Text style={styles.scheduleGroupTitle}>내 일정</Text>
                    </View>
                    {mySchedules.map(s => (
                      <TouchableOpacity key={s.id} style={[styles.scheduleItem, { borderLeftColor: COLORS.MY }]} onPress={() => openEditModal(s)} activeOpacity={0.7}>
                        <Text style={styles.scheduleTitle}>{s.title}</Text>
                        {s.memo ? <Text style={styles.scheduleMemo}>{s.memo}</Text> : null}
                        <Text style={styles.scheduleDates}>{s.start_date}{s.end_date && s.end_date !== s.start_date ? ` ~ ${s.end_date}` : ''}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {partnerSchedules.length > 0 && (
                  <View style={styles.scheduleGroup}>
                    <View style={styles.scheduleGroupHeader}>
                      <View style={[styles.scheduleGroupDot, { backgroundColor: COLORS.PARTNER }]} />
                      <Text style={styles.scheduleGroupTitle}>상대 일정</Text>
                    </View>
                    {partnerSchedules.map(s => (
                      <View key={s.id} style={[styles.scheduleItem, { borderLeftColor: COLORS.PARTNER }]}>
                        <Text style={styles.scheduleTitle}>{s.title}</Text>
                        {s.memo ? <Text style={styles.scheduleMemo}>{s.memo}</Text> : null}
                        <Text style={styles.scheduleDates}>{s.start_date}{s.end_date && s.end_date !== s.start_date ? ` ~ ${s.end_date}` : ''}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {coupleSchedules.length > 0 && (
                  <View style={styles.scheduleGroup}>
                    <View style={styles.scheduleGroupHeader}>
                      <View style={[styles.scheduleGroupDot, { backgroundColor: COLORS.COUPLE }]} />
                      <Text style={styles.scheduleGroupTitle}>커플 일정</Text>
                    </View>
                    {coupleSchedules.map(s => (
                      <TouchableOpacity key={s.id} style={[styles.scheduleItem, { borderLeftColor: COLORS.COUPLE }]} onPress={() => openEditModal(s)} activeOpacity={0.7}>
                        <Text style={styles.scheduleTitle}>{s.title}</Text>
                        {s.memo ? <Text style={styles.scheduleMemo}>{s.memo}</Text> : null}
                        <Text style={styles.scheduleDates}>{s.start_date}{s.end_date && s.end_date !== s.start_date ? ` ~ ${s.end_date}` : ''}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setStartDate(selectedDate);
          setEndDate(selectedDate);
          setIsModalOpen(true);
        }}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      {/* 모달 */}
      <Modal visible={isModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>{editingSchedule ? '일정 수정' : '일정 추가'}</Text>

              {/* 타입 */}
              <Text style={styles.modalLabel}>일정 타입 <Text style={{ color: '#FF6B6B' }}>*</Text></Text>
              <View style={styles.typeRow}>
                <TouchableOpacity
                  onPress={() => setScheduleType('PERSONAL')}
                  style={[styles.typeBtn, scheduleType === 'PERSONAL' && { backgroundColor: COLORS.MY }]}
                >
                  <Text style={[styles.typeBtnText, scheduleType === 'PERSONAL' && { color: '#000' }]}>개인</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setScheduleType('COUPLE')}
                  style={[styles.typeBtn, scheduleType === 'COUPLE' && { backgroundColor: COLORS.COUPLE }]}
                >
                  <Text style={[styles.typeBtnText, scheduleType === 'COUPLE' && { color: '#fff' }]}>커플</Text>
                </TouchableOpacity>
              </View>

              {/* 시작 날짜 */}
              <Text style={styles.modalLabel}>시작 날짜 <Text style={{ color: '#FF6B6B' }}>*</Text></Text>
              <TouchableOpacity
                style={styles.dateBtn}
                onPress={() => { setShowEndPicker(false); setShowStartPicker(v => !v); }}
              >
                <Text style={styles.dateBtnText}>📅 {startDate ?? '날짜 선택'}</Text>
              </TouchableOpacity>
              {showStartPicker && (
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={startDate ? new Date(startDate) : new Date()}
                    mode="date"
                    display="inline"
                    accentColor={COLORS.MY}
                    textColor={COLORS.TEXT}
                    onChange={(event, date) => {
                      if (date) {
                        const formatted = formatDate(date);
                        setStartDate(formatted);
                        if (!endDate || endDate < formatted) setEndDate(formatted);
                      }
                      setShowStartPicker(false);
                    }}
                  />
                </View>
              )}

              {/* 종료 날짜 */}
              <Text style={styles.modalLabel}>종료 날짜</Text>
              <TouchableOpacity
                style={styles.dateBtn}
                onPress={() => {
                  if (!startDate) { Alert.alert('시작 날짜를 먼저 선택해주세요'); return; }
                  setShowStartPicker(false);
                  setShowEndPicker(v => !v);
                }}
              >
                <Text style={styles.dateBtnText}>📅 {endDate ?? '날짜 선택'}</Text>
              </TouchableOpacity>
              {showEndPicker && (
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={endDate ? new Date(endDate) : new Date(startDate ?? new Date())}
                    mode="date"
                    display="inline"
                    accentColor={COLORS.MY}
                    textColor={COLORS.TEXT}
                    minimumDate={startDate ? new Date(startDate) : undefined}
                    onChange={(event, date) => {
                      if (date) setEndDate(formatDate(date));
                      setShowEndPicker(false);
                    }}
                  />
                </View>
              )}

              {/* 제목 */}
              <Text style={styles.modalLabel}>제목 <Text style={{ color: '#FF6B6B' }}>*</Text></Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                style={styles.modalInput}
                placeholder="일정 제목"
                placeholderTextColor="#555"
              />

              {/* 메모 */}
              <Text style={styles.modalLabel}>메모</Text>
              <TextInput
                value={memo}
                onChangeText={setMemo}
                multiline
                style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
                placeholder="메모 (선택)"
                placeholderTextColor="#555"
              />

              {/* 버튼 */}
              <View style={styles.modalBtns}>
                {editingSchedule && (
                  <TouchableOpacity onPress={handleDeleteSchedule} style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>삭제</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={closeModal} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveSchedule} style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>저장</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.BG },
  loadingText: { color: COLORS.SUBTEXT, fontSize: 16 },
  scroll: { flex: 1 },

  header: { paddingHorizontal: 24, paddingTop: 70, paddingBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: COLORS.TEXT, letterSpacing: -1 },
  headerSub: { fontSize: 14, color: COLORS.SUBTEXT, marginTop: 4 },

  noticeCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1a1a1a', borderRadius: 16,
    marginHorizontal: 24, marginTop: 16,
    padding: 16, gap: 10,
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  noticeIcon: { fontSize: 20 },
  noticeText: { flex: 1, fontSize: 14, color: '#ccc', lineHeight: 20 },

  legend: { flexDirection: 'row', paddingHorizontal: 24, marginTop: 16, gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: COLORS.SUBTEXT },

  calendarCard: {
    backgroundColor: COLORS.CARD, borderRadius: 24,
    margin: 24, marginTop: 12, padding: 16,
    borderWidth: 1, borderColor: COLORS.BORDER,
  },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  navBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2a2a2a', justifyContent: 'center', alignItems: 'center' },
  navBtnText: { fontSize: 20, color: COLORS.TEXT, fontWeight: '300' },
  monthTitle: { fontSize: 17, fontWeight: '700', color: COLORS.TEXT },

  weekRow: { flexDirection: 'row', marginBottom: 8 },
  weekDay: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600', color: COLORS.SUBTEXT },

  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', padding: 2 },
  dayInner: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  daySelected: { backgroundColor: COLORS.MY },
  dayToday: { borderWidth: 1.5, borderColor: COLORS.MY },
  dayText: { fontSize: 13, color: COLORS.TEXT, fontWeight: '500' },
  dayTextSelected: { color: '#000', fontWeight: '800' },
  dayTextToday: { color: COLORS.MY, fontWeight: '700' },
  dotsRow: { flexDirection: 'row', gap: 2, marginTop: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },

  scheduleSection: { paddingHorizontal: 24, marginTop: 4 },
  scheduleDateTitle: { fontSize: 16, fontWeight: '700', color: COLORS.TEXT, marginBottom: 12 },
  emptySchedule: { alignItems: 'center', paddingVertical: 32 },
  emptyScheduleEmoji: { fontSize: 40, marginBottom: 8 },
  emptyScheduleText: { fontSize: 14, color: COLORS.SUBTEXT },

  scheduleGroup: { marginBottom: 16 },
  scheduleGroupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  scheduleGroupDot: { width: 8, height: 8, borderRadius: 4 },
  scheduleGroupTitle: { fontSize: 13, fontWeight: '700', color: COLORS.SUBTEXT },
  scheduleItem: {
    backgroundColor: COLORS.CARD, borderRadius: 12, padding: 14,
    marginBottom: 8, borderLeftWidth: 3,
    borderWidth: 1, borderColor: COLORS.BORDER,
  },
  scheduleTitle: { fontSize: 15, fontWeight: '700', color: COLORS.TEXT, marginBottom: 4 },
  scheduleMemo: { fontSize: 13, color: COLORS.SUBTEXT, marginBottom: 4 },
  scheduleDates: { fontSize: 12, color: '#555' },

  fab: {
    position: 'absolute', bottom: 32, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.MY,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: COLORS.MY, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 16, elevation: 8,
  },
  fabText: { fontSize: 28, color: '#000', fontWeight: '300', lineHeight: 32 },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  modalScroll: { flex: 1 },
  modalBox: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, paddingBottom: 60,
    marginTop: 'auto',
    borderWidth: 1, borderColor: COLORS.BORDER,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.TEXT, marginBottom: 20 },
  modalLabel: { fontSize: 13, fontWeight: '700', color: COLORS.SUBTEXT, marginBottom: 8 },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    alignItems: 'center', backgroundColor: '#2a2a2a',
    borderWidth: 1, borderColor: COLORS.BORDER,
  },
  typeBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.SUBTEXT },
  dateBtn: {
    backgroundColor: '#2a2a2a', borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: COLORS.BORDER,
  },
  dateBtnText: { fontSize: 14, color: COLORS.TEXT },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16, overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.BORDER,
  },
  modalInput: {
    backgroundColor: '#2a2a2a', borderRadius: 12, padding: 14,
    fontSize: 15, color: COLORS.TEXT, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.BORDER,
  },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  deleteBtn: {
    paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12,
    backgroundColor: 'rgba(255,107,107,0.15)',
    borderWidth: 1, borderColor: '#FF6B6B',
  },
  deleteBtnText: { fontSize: 14, fontWeight: '700', color: '#FF6B6B' },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    alignItems: 'center', backgroundColor: '#2a2a2a',
    borderWidth: 1, borderColor: COLORS.BORDER,
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.SUBTEXT },
  saveBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    alignItems: 'center', backgroundColor: COLORS.MY,
  },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#000' },
});
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, Modal,
} from 'react-native';
import { useEffect, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '@/src/lib/supabase';
import { AnniversaryList } from '@/src/components/dday/AnniversaryList';
import { HeartProgress } from '@/src/components/dday/HeartProgress';
import { CollectedHeartsPage } from '@/src/components/dday/CollectedHearts';
import { getDaysTogether } from '@/src/components/dday/getDaysTogether';
import MenuButton from '@/components/MenuButton';
import { useAuthCouple } from '@/src/context/AuthCoupleContext';
import { HEART_ROWS } from '@/src/components/dday/heartMap';

export default function DdayPage() {
  const [startDate, setStartDate] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [showAnniversary, setShowAnniversary] = useState(false);

  const [showCollectedHearts, setShowCollectedHearts] = useState(false);
  
  const { myNickname, partnerNickname } = useAuthCouple();

  useEffect(() => { loadDday(); }, []);

  const loadDday = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data: coupleId } = await supabase.rpc('get_my_couple_id');
    if (!coupleId) { setLoading(false); return; }
    const { data, error } = await supabase.from('couples').select('relationship_start_date').eq('id', coupleId).single();
    if (error) { Alert.alert('디데이 정보를 불러올 수 없어요'); setLoading(false); return; }
    setStartDate(data.relationship_start_date);
    setTempDate(new Date(data.relationship_start_date));
    setLoading(false);
  };

  const saveDate = async () => {
    const { data: coupleId } = await supabase.rpc('get_my_couple_id');
    if (!coupleId) return;
    const formatted = tempDate.toISOString().slice(0, 10);
    const { error } = await supabase.from('couples').update({ relationship_start_date: formatted }).eq('id', coupleId);
    if (error) { Alert.alert('수정 실패', '디데이 날짜를 수정할 수 없어요'); return; }
    setStartDate(formatted);
    setEditing(false);
  };

  if (loading) return null;

  if (!startDate) {
    return (
      <View style={styles.container}>
        <MenuButton />
        <Text style={styles.empty}>아직 커플 정보가 없어요</Text>
      </View>
    );
  }

  const dday = Math.max(1, getDaysTogether(startDate));

  const totalCells = HEART_ROWS.flat().filter(Boolean).length;

  const remainder = dday % totalCells;

  const currentHeartDays =
    remainder === 0 ? totalCells : remainder;

  return (
    <View style={styles.container}>
      {/* 메뉴 버튼 */}
      <MenuButton />

      <HeartProgress filledCount={currentHeartDays} />
        <Text style={styles.title}> </Text>
      <Text style={styles.title}>{myNickname} 🩷 {partnerNickname}</Text>
      <Text style={styles.dday}>D + {dday}</Text>

      <TouchableOpacity onPress={() => setEditing(true)}>
        <Text style={styles.edit}><Text style={styles.date}>{startDate}</Text></Text>
      </TouchableOpacity>

      <Modal visible={editing} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>날짜 수정</Text>
            <DateTimePicker
              value={tempDate} mode="date" display="inline"
              locale="ko-KR"
              onChange={(event, date) => { if (date) setTempDate(date); }}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setEditing(false)}><Text>취소</Text></TouchableOpacity>
              <TouchableOpacity onPress={saveDate}>
                <Text style={{ color: '#5DA9FF', fontWeight: 'bold' }}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity onPress={() => setShowAnniversary((p) => !p)}>
        <Text style={{ color: '#5DA9FF', marginTop: 16 }}>
          {showAnniversary ? '기념일 닫기' : '기념일 보기'}
        </Text>
      </TouchableOpacity>
      {showAnniversary && startDate && <AnniversaryList startDate={startDate} />}

      <TouchableOpacity onPress={() => setShowCollectedHearts((p) => !p)}>
        <Text style={{ color: '#FF5D8F', marginTop: 16 }}>
          {showCollectedHearts ? '하트 닫기' : '모은 하트 보기'}
        </Text>
      </TouchableOpacity>
      {showCollectedHearts && startDate && <CollectedHeartsPage startDate={startDate} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  dday: { color: '#5DA9FF', fontSize: 48, fontWeight: 'bold', marginBottom: 12 },
  date: { color: '#aaa', marginBottom: 20 },
  edit: { color: '#5DA9FF', fontWeight: 'bold' },
  empty: { color: '#aaa' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  modal: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
});
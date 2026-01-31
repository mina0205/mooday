import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useEffect, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '@/src/lib/supabase';
import { AnniversaryList } from '@/src/components/dday/AnniversaryList';
import { HeartProgress } from '@/src/components/dday/HeartProgress';
import { CollectedHeartsPage } from '@/src/components/dday/CollectedHearts';


export default function DdayPage() {
  const [startDate, setStartDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [showAnniversary, setShowAnniversary] = useState(false);
  const [showCollectedHearts, setShowCollectedHearts] = useState(false);

  /* ------------------------------
   * 초기 로딩 (디데이 조회)
   * ------------------------------ */
  useEffect(() => {
    loadDday();
  }, []);

  const loadDday = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // 1️⃣ 내 커플 ID
    const { data: coupleId } = await supabase.rpc('get_my_couple_id');
    if (!coupleId) {
      setLoading(false);
      return;
    }

    // 2️⃣ 커플 정보 조회
    const { data, error } = await supabase
      .from('couples')
      .select('relationship_start_date')
      .eq('id', coupleId)
      .single();

    if (error) {
      console.error(error);
      Alert.alert('디데이 정보를 불러올 수 없어요');
      setLoading(false);
      return;
    }

    setStartDate(data.relationship_start_date);
    setTempDate(new Date(data.relationship_start_date));
    setLoading(false);
  };

  /* ------------------------------
   * 디데이 날짜 저장
   * ------------------------------ */
  const saveDate = async () => {
    const { data: coupleId } = await supabase.rpc('get_my_couple_id');
    if (!coupleId) return;

    const formatted = tempDate.toISOString().slice(0, 10);

    const { error } = await supabase
      .from('couples')
      .update({ relationship_start_date: formatted })
      .eq('id', coupleId);

    if (error) {
      console.error(error);
      Alert.alert('수정 실패', '디데이 날짜를 수정할 수 없어요');
      return;
    }

    setStartDate(formatted);
    setEditing(false);
  };

  /* ------------------------------
   * 렌더 분기
   * ------------------------------ */
  if (loading) return null;

  if (!startDate) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>아직 커플 정보가 없어요</Text>
      </View>
    );
  }

  const dday = calculateDDay(startDate);
  const filledCount = Math.min(
  Math.max(dday, 0),
  365
);


  return (
    <View style={styles.container}>

      {/* 채워지는 하트 */}
      <HeartProgress filledCount={filledCount} />

      {/* 공백을 위한  .. 나중에 지우길 ⬇️  */}
      <Text style={styles.title}></Text>
      <Text style={styles.title}>( 우리가 만난지 ..) </Text>
      <Text style={styles.dday}>D + {dday}</Text>

      <TouchableOpacity onPress={() => setEditing(true)}>
        <Text style={styles.edit}>
            <Text style={styles.date}>{startDate}</Text>
        </Text>
      </TouchableOpacity>

      {/* ---------------- 수정 모달 ---------------- */}
    <Modal visible={editing} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
            <View style={styles.modal}>
            <Text style={styles.modalTitle}>날짜 수정</Text>

            {/* ⭐️ iOS inline DatePicker */}
            <DateTimePicker
                value={tempDate}
                mode="date"
                display="inline"  
                locale="ko-KR"
                onChange={(event, date) => {
                if (date) setTempDate(date);
                }}
            />

            <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setEditing(false)}>
                <Text>취소</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={saveDate}>
                <Text style={{ color: '#5DA9FF', fontWeight: 'bold' }}>
                    저장
                </Text>
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

        {showAnniversary && startDate && (
        <AnniversaryList startDate={startDate} />
        )}
       
       <TouchableOpacity onPress={() => setShowCollectedHearts((p) => !p)}>
        <Text style={{ color: '#FF5D8F', marginTop: 16 }}>
            {showCollectedHearts ? '하트 닫기' : '모은 하트 보기'}
        </Text>
        </TouchableOpacity>

        {showCollectedHearts && startDate && (
        <CollectedHeartsPage startDate={startDate} />
        )}

    </View>
  );
}

/* ------------------------------
 * 유틸
 * ------------------------------ */
export function calculateDDay(startDateStr: string): number {
  const today = new Date();
  const start = new Date(startDateStr);

  // 미래 날짜 방어
  if (start > today) return 0;

  // ⏱ 타임존 제거 (자정 기준)
  const todayUTC = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const startUTC = Date.UTC(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );

  const diffDays =
    Math.floor((todayUTC - startUTC) / (1000 * 60 * 60 * 24)) + 1;

  return diffDays;
}


/* ------------------------------
 * 스타일
 * ------------------------------ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dday: {
    color: '#5DA9FF',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  date: {
    color: '#aaa',
    marginBottom: 20,
  },
  edit: {
    color: '#5DA9FF',
    fontWeight: 'bold',
  },
  empty: {
    color: '#aaa',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
});

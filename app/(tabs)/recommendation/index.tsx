import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { WishlistItem } from '@/src/types/wishlist';
import { supabase } from '@/src/lib/supabase';
import GradientHeart from '@/components/GradientHeart';

/* =========================
 * 타입
 * ========================= */
type EmotionCode =
  | 'VERY_GOOD'
  | 'GOOD'
  | 'NORMAL'
  | 'BAD'
  | 'VERY_BAD';

const EMOTIONS = [
  { code: 'VERY_GOOD', label: '설렘', icon: '😍', score: 5 },
  { code: 'GOOD', label: '행복', icon: '😊', score: 4 },
  { code: 'NORMAL', label: '그럭저럭', icon: '😐', score: 3 },
  { code: 'BAD', label: '피곤함', icon: '😵', score: 2 },
  { code: 'VERY_BAD', label: '우울함/화남', icon: '😢', score: 1 },
] as const;

interface DateCourse {
  id: string;
  title: string;
  category: string;
  source: 'wishlist' | 'ai';
  description?: string;
}

export default function RecommendationScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [coupleId, setCoupleId] = useState<string | null>(null);

  const [step, setStep] = useState<'select' | 'waiting' | 'result'>('select');

  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<DateCourse[]>([]);



  /* =========================
   * 초기 유저 / 커플 확인
   * ========================= */
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;

      setUserId(data.user.id);

      const { data: myCouple } = await supabase
        .from('couple_members')
        .select('couple_id')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (myCouple?.couple_id) {
        setCoupleId(myCouple.couple_id);
        await checkTodayEmotionAndInit(myCouple.couple_id);
      }
    };

    init();
  }, []);

  /* =========================
   * 오늘 감정 상태 확인
   * ========================= */
  const checkTodayEmotionAndInit = async (cid: string) => {
    const today = new Date().toISOString().slice(0, 10);

    const { data } = await supabase
      .from('emotion_logs')
      .select('id')
      .eq('couple_id', cid)
      .eq('date', today);

    if (data && data.length >= 2) {
      await loadRecommendations(cid);
      setStep('result');
    } else {
      setStep('select');
    }
  };

  /* =========================
   * 감정 선택 → 저장
   * ========================= */
  const handleEmotionSelect = async (
  emotion: EmotionCode,
  score: number
) => {
  if (!userId || !coupleId) return;

  const today = new Date().toISOString().slice(0, 10);

  try {
    setLoading(true);

    const { error } = await supabase
      .from('emotion_logs')
      .upsert(
        {
          couple_id: coupleId,
          user_id: userId,
          emotion_code: emotion,
          emotion_score: score,
          date: today,
        },
        { onConflict: 'user_id,date' }
      );

    if (error) throw error;

    // 🔥 다시 2명인지 체크
    const { data: logs } = await supabase
      .from('emotion_logs')
      .select('id')
      .eq('couple_id', coupleId)
      .eq('date', today);

    if (logs && logs.length >= 2) {
      await loadRecommendations(coupleId);
      setStep('result');
    } else {
      Alert.alert('상대방을 기다리는 중이에요 💌');
      setStep('waiting'); 
    }

  } catch (e) {
    console.error(e);
    Alert.alert('오류', '감정 저장에 실패했어요.');
  } finally {
    setLoading(false);
  }
};

  /* =========================
   * 추천 로딩 (RPC 기반)
   * ========================= */
  const loadRecommendations = async (cid: string) => {
    const today = new Date().toISOString().slice(0, 10);

    const { data: wishes, error } = await supabase.rpc(
      'get_recommended_wishes',
      {
        p_couple_id: cid,
        p_date: today,
      }
    );

    if (error) {
      console.error(error);
      return;
    }

    if (!wishes || wishes.length === 0) {
      setRecommendations(generateAICoursesByScore(3));
      return;
    }

    const courses: DateCourse[] = wishes.map((item: WishlistItem) => ({
      id: item.id,
      title: item.title,
      category: item.energy,
      source: 'wishlist',
      description: `${item.energy} 에너지 · ${item.mood}`,
    }));

    setRecommendations(courses);
  };

  /* =========================
   * AI 더미 추천
   * ========================= */
  const generateAICoursesByScore = (score: number): DateCourse[] => {
    if (score >= 4) {
      return [
        {
          id: 'ai-1',
          title: '놀이공원 데이트',
          category: '액티비티',
          source: 'ai',
        },
      ];
    }
    if (score >= 3) {
      return [
        {
          id: 'ai-2',
          title: '분위기 좋은 맛집',
          category: '맛집',
          source: 'ai',
        },
      ];
    }
    return [
      {
        id: 'ai-3',
        title: '조용한 카페',
        category: '카페',
        source: 'ai',
      },
    ];
  };

  /* =========================
   * 감정 선택 화면
   * ========================= */
  if (step === 'waiting') {
  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>
          💌 상대가 감정을 선택하는 중이에요
        </Text>
      </View>
    </View>
  );
}

  if (step === 'select') {
    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <GradientHeart size={24} />
            <Text style={styles.modalTitle}>오늘 기분이 어떠세요?</Text>
          </View>

          <View style={styles.emojiRow}>
            {EMOTIONS.map(e => (
              <TouchableOpacity
                key={e.code}
                onPress={() => handleEmotionSelect(e.code, e.score)}
              >
                <Text style={styles.bigEmoji}>{e.icon}</Text>
                <Text>{e.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#6EC6FF" />
          </View>
        )}
      </View>
    );
  }

  /* =========================
   * 추천 결과 화면
   * ========================= */
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <GradientHeart size={24} />
        <Text style={styles.headerTitle}>오늘의 데이트 추천</Text>
      </View>

      <View style={styles.content}>
        {recommendations.map((c, i) => (
          <View key={c.id} style={styles.courseCard}>
            <Text style={styles.courseTitle}>
              {i + 1}. {c.title}
            </Text>
            <Text style={styles.courseCategory}>{c.category}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => setStep('select')}
        >
          <Text style={styles.resetButtonText}>감정 다시 선택하기</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* =========================
 * 스타일
 * ========================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    width: '90%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '700', marginLeft: 8 },
  emojiRow: { flexDirection: 'row', justifyContent: 'space-around' },
  bigEmoji: { fontSize: 48 },
  loadingOverlay: { position: 'absolute', inset: 0, justifyContent: 'center' },
  header: { padding: 24, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '700', marginLeft: 8 },
  content: { padding: 20 },
  courseCard: { backgroundColor: 'white', padding: 16, borderRadius: 12 },
  courseTitle: { fontSize: 16, fontWeight: '700' },
  courseCategory: { color: '#6EC6FF' },
  footer: { padding: 20 },
  resetButton: {
    borderWidth: 2,
    borderColor: '#6EC6FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: { color: '#6EC6FF', fontWeight: '600' },
});

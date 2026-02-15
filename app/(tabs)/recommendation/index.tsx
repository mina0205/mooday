import type { WishlistItem } from '@/src/types/wishlist';
import { supabase } from '@/src/lib/supabase';
import MenuButton from '@/components/MenuButton';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';

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

const [selectedEmotion, setSelectedEmotion] = useState<EmotionCode | null>(null);


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

  setSelectedEmotion(emotion);

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

  const getEmotionEmoji = (code: EmotionCode) => {
  return EMOTIONS.find(e => e.code === code)?.icon ?? '';
};

const getEmotionLabel = (code: EmotionCode) => {
  return EMOTIONS.find(e => e.code === code)?.label ?? '';
};

const handleReset = () => {
  setStep('select');
  setRecommendations([]);
  setSelectedEmotion(null);
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
        <MenuButton />
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeartEmoji}>🩷</Text>
            <Text style={styles.modalTitle}>오늘 기분이 어떠세요?</Text>
          </View>

          <View style={styles.emojiFrame}>
            {/* 윗줄: 3개 */}
            <View style={styles.emojiRow}>
             {EMOTIONS.slice(0, 3).map(({ code, label, icon, score }) => (
              <TouchableOpacity
                key={code}
                onPress={() => handleEmotionSelect(code, score)}
                  activeOpacity={0.7}
                  style={styles.emojiButton}
                >
                  <Text style={styles.bigEmoji}>{icon}</Text>
                  <Text style={styles.emojiLabel}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* 아랫줄: 2개 가운데 정렬 */}
            <View style={[styles.emojiRow, { justifyContent: 'center', gap: 32 }]}>
              {EMOTIONS.slice(3).map(({ code, label, icon, score }) => (
                <TouchableOpacity
                  key={code}
                  onPress={() => handleEmotionSelect(code, score)}
                  activeOpacity={0.7}
                  style={styles.emojiButton}
                >
                  <Text style={styles.bigEmoji}>{icon}</Text>
                  <Text style={styles.emojiLabel}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.emojiCaption}>
              *감정 분석 결과를 기반으로, 현재 상태에 가장 어울리는 데이트 코스를 추천해드립니다.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6EC6FF" />
        <Text style={styles.loadingText}>AI가 추천 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleReset}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          {selectedEmotion && (
            <Text style={styles.emotionEmoji}>{getEmotionEmoji(selectedEmotion)}</Text>
          )}
          <Text style={styles.headerTitle}>
            {selectedEmotion ? getEmotionLabel(selectedEmotion) : ''} 데이트 추천
          </Text>
        </View>
        <Text style={styles.subtitle}>오늘 기분에 맞는 데이트 코스를 골라봤어요</Text>
      </View>

      <View style={styles.content}>
        {recommendations.length > 0 ? (
          recommendations.map((course, index) => (
            <View key={course.id} style={styles.courseCard}>
              <View style={styles.cardGradient} />
              <View style={styles.courseContent}>
                <View style={styles.courseHeader}>
                  <View style={styles.courseNumber}>
                    <Text style={styles.courseNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.courseInfo}>
                    <View style={styles.courseTitleRow}>
                      <Text style={styles.courseTitle}>{course.title}</Text>
                      {course.source === 'wishlist' && (
                        <View style={styles.wishlistBadge}>
                          <Text style={styles.wishlistBadgeText}>💖 위시</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.courseCategory}>{course.category}</Text>
                    </View>
                    {course.description && (
                      <Text style={styles.courseDescription}>{course.description}</Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>💔</Text>
            <Text style={styles.emptyText}>
              추천할 데이트 코스가 없어요{'\n'}위시리스트에 데이트 아이디어를 추가해보세요!
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>다른 감정 선택하기</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 32,
    padding: 32,
    width: '100%',
    shadowColor: '#6EC6FF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 2,
    borderColor: '#2a2a2a',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    gap: 10,
  },
  modalHeartEmoji: { fontSize: 24 },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  emojiFrame: {
    borderWidth: 2,
    borderColor: 'rgba(255,158,170,0.3)',
    borderRadius: 20,
    padding: 24,
    backgroundColor: '#0a0a0a',
    gap: 16,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  emojiButton: {
    alignItems: 'center',
    gap: 6,
  },
  bigEmoji: { fontSize: 44 },
  emojiLabel: {
    fontSize: 12,
    color: '#aaa',
    fontWeight: '600',
  },
  emojiCaption: {
    fontSize: 11,
    color: '#666',
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000',
  },
  loadingText: { marginTop: 16, fontSize: 16, color: '#999' },
  header: {
    backgroundColor: '#1a1a1a',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  backButton: {
    marginBottom: 16,
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(110,198,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { fontSize: 24, color: '#6EC6FF' },
  titleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  emotionEmoji: { fontSize: 32, marginRight: 12 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  subtitle: { fontSize: 15, color: '#aaa', marginLeft: 44 },
  content: { padding: 20, paddingTop: 24 },
  courseCard: {
    position: 'relative',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cardGradient: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 4,
    backgroundColor: '#6EC6FF',
  },
  courseContent: { padding: 20, paddingTop: 16 },
  courseHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  courseNumber: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#6EC6FF',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 16,
  },
  courseNumberText: { fontSize: 18, fontWeight: '800', color: '#000' },
  courseInfo: { flex: 1 },
  courseTitleRow: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 10, flexWrap: 'wrap',
  },
  courseTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginRight: 10 },
  wishlistBadge: {
    backgroundColor: 'rgba(255,107,107,0.2)',
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 12, borderWidth: 1, borderColor: '#FF6B6B',
  },
  wishlistBadgeText: { fontSize: 11, fontWeight: '700', color: '#FF6B6B' },
  categoryBadge: {
    backgroundColor: 'rgba(110,198,255,0.15)',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 10, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: 'rgba(110,198,255,0.3)',
    marginBottom: 8,
  },
  courseCategory: { fontSize: 13, fontWeight: '600', color: '#6EC6FF' },
  courseDescription: { fontSize: 14, color: '#aaa', lineHeight: 20 },
  emptyContainer: { padding: 60, alignItems: 'center' },
  emptyEmoji: { fontSize: 64, marginBottom: 20 },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24 },
  footer: { padding: 24, paddingBottom: 40 },
  resetButton: {
    backgroundColor: 'rgba(110,198,255,0.1)',
    padding: 18, borderRadius: 16, alignItems: 'center',
    borderWidth: 2, borderColor: '#6EC6FF',
  },
  resetButtonText: { fontSize: 17, fontWeight: '700', color: '#6EC6FF' },
});

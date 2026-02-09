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

const EMOTIONS: {
  code: EmotionCode;
  label: string;
  icon: string;
  score: number;
}[] = [
  { code: 'VERY_GOOD', label: '설렘', icon: '😍', score: 5 },
  { code: 'GOOD', label: '행복', icon: '😊', score: 4 },
  { code: 'NORMAL', label: '그럭저럭', icon: '😐', score: 3 },
  { code: 'BAD', label: '피곤함', icon: '😵', score: 2 },
  { code: 'VERY_BAD', label: '우울함/화남', icon: '😢', score: 1 },
];

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

  const [step, setStep] = useState<'select' | 'result'>('select');
  const [loading, setLoading] = useState(false);

  const [recommendations, setRecommendations] = useState<DateCourse[]>([]);

  /* =========================
   * 초기 유저 / 커플 확인
   * ========================= */
  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUserId(user.id);

      const { data: myCouple } = await supabase
        .from('couple_members')
        .select('couple_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (myCouple) {
        setCoupleId(myCouple.couple_id);
      }

      await checkTodayEmotionAndInit(user.id, myCouple.couple_id);
  };

    init();
  }, []);

  /* =========================
   * 오늘 감정 확인 및 초기화
   * ========================= */
  const checkTodayEmotionAndInit = async (
  userId: string,
  coupleId: string
) => {
  const today = new Date().toISOString().slice(0, 10);

  const { data: logs, error } = await supabase
    .from('emotion_logs')
    .select('id')
    .eq('couple_id', coupleId)
    .eq('date', today);

    console.log('📌 step before set:', step);
console.log('📌 recommendations count:', recommendations.length);  
  if (error) {
    console.error('❌ emotion_logs 조회 실패:', error);
    return;
  }

  if (logs && logs.length >= 2) {
    await loadRecommendations(coupleId);
    setStep('result');
  } else {
    setStep('select');
  }
};

  /* =========================
   * 감정 선택 → DB 저장
   * ========================= */
  const handleEmotionSelect = async (
    emotion: EmotionCode,
    score: number
  ) => {
    if (!userId || !coupleId) return;

    const today = new Date().toISOString().slice(0, 10);

    try {
      setLoading(true);

      // 오늘 감정 upsert
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
        {
          onConflict: 'user_id,date', // ⭐ 핵심
        }
      );

    if (error) {
      console.error('❌ emotion_logs upsert error:', error);
      throw error;
    }

      // 추천 로드
      await loadRecommendations(coupleId);
      setStep('result');

    } catch (e) {
      console.error('❌ 감정 저장 실패:', e);
      Alert.alert('오류', '감정 저장에 실패했어요.');
    } finally {
      setLoading(false);
    }
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
          description: '신나게 에너지 발산하기',
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
          description: '편안한 분위기에서 식사',
        },
      ];
    }

    return [
      {
        id: 'ai-3',
        title: '조용한 카페',
        category: '카페',
        source: 'ai',
        description: '차분하게 쉬어가는 시간',
      },
    ];
  };

  /* =========================
   * 추천 로딩
   * ========================= */
  const loadRecommendations = async (targetCoupleId: string) => {
    const today = new Date().toISOString().slice(0, 10);

    const { data: emotionLogs } = await supabase
      .from('emotion_logs')
      .select('emotion_score')
      .eq('couple_id', targetCoupleId)
      .eq('date', today);

      console.log('📌 emotionLogs:', emotionLogs);

    if (!emotionLogs || emotionLogs.length === 0) {
      Alert.alert('안내', '오늘의 감정을 먼저 선택해주세요.');
      setStep('select');
      return;
    }

    if (emotionLogs.length === 1) {
      Alert.alert(
        '조금만 기다려요',
        '상대방이 아직 감정을 선택하지 않았어요.'
      );
      setStep('select');
      return;
    }

    // 2️⃣ 평균 감정 점수
    const avgScore =
      emotionLogs.reduce((sum, e) => sum + e.emotion_score, 0) /
      emotionLogs.length;

    // 3️⃣ 추천 RPC 호출
    const { data: wishes, error } = await supabase.rpc(
    'get_recommended_wishes',
    {
      p_couple_id: targetCoupleId,
      p_date: today,
    }
  );

    if (error) {
      console.error('❌ 추천 RPC 실패:', error);
      return;
    }
    if (!wishes) {
      return; // ❗ undefined면 fallback X
    }

    // 4️⃣ 위시 → 카드 변환
    const wishlistCourses: DateCourse[] = wishes.map(
      (item: WishlistItem) => ({
        id: item.id,
        title: item.title,
        category: item.energy,
        source: 'wishlist',
        description: `${item.energy} 에너지 · ${item.mood}`,
      })
    );

    if (wishlistCourses.length === 0) {
      setRecommendations(generateAICoursesByScore(avgScore));
    } else {
      setRecommendations(wishlistCourses);
    }
  }

  /* =========================
   * 감정 선택 화면
   * ========================= */
  if (step === 'select') {
    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <GradientHeart size={24} />
            <Text style={styles.modalTitle}>오늘 기분이 어떠세요?</Text>
          </View>

          <View style={styles.emojiFrame}>
            <View style={styles.emojiRow}>
             {EMOTIONS.map(({ code, label, icon, score }) => (
              <TouchableOpacity
                key={code}
                onPress={() => handleEmotionSelect(code, score)}
              >
                <Text style={styles.bigEmoji}>{icon}</Text>
                <Text>{label}</Text>
              </TouchableOpacity>
            ))}

            </View>

            <Text style={styles.emojiCaption}>
              * 오늘의 감정을 선택하면 데이트를 추천해드려요
            </Text>
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
        <View style={styles.titleContainer}>
          <GradientHeart size={24} />
          <Text style={styles.headerTitle}>오늘의 데이트 추천</Text>
        </View>
        <Text style={styles.subtitle}>
          오늘 감정에 가장 잘 어울리는 데이트에요
        </Text>
      </View>

      <View style={styles.content}>
        {recommendations.map((course, idx) => (
          <View key={course.id} style={styles.courseCard}>
            <View style={styles.courseNumber}>
              <Text style={styles.courseNumberText}>{idx + 1}</Text>
            </View>
            <View style={styles.courseInfo}>
              <View style={styles.courseTitleRow}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                {course.source === 'wishlist' && (
                  <View style={styles.wishlistBadge}>
                    <Text style={styles.wishlistBadgeText}>위시</Text>
                  </View>
                )}
              </View>
              <Text style={styles.courseCategory}>{course.category}</Text>
              {course.description && (
                <Text style={styles.courseDescription}>
                  {course.description}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => setStep('select')}
        >
          <Text style={styles.resetButtonText}>
            감정 다시 선택하기
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* =========================
 * 스타일
 * ========================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 12,
  },
  emojiFrame: {
    borderWidth: 3,
    borderColor: '#FF9EAA',
    borderRadius: 16,
    padding: 32,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  bigEmoji: {
    fontSize: 56,
  },
  emojiCaption: {
    fontSize: 11,
    color: '#666',
  },
  loadingOverlay: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'white',
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 12,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    marginLeft: 36,
  },
  content: {
    padding: 20,
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  courseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6EC6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  courseNumberText: {
    color: 'white',
    fontWeight: '700',
  },
  courseInfo: {
    flex: 1,
  },
  courseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  wishlistBadge: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  wishlistBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  courseCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6EC6FF',
  },
  courseDescription: {
    fontSize: 13,
    color: '#666',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  resetButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#6EC6FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#6EC6FF',
    fontWeight: '600',
  },
});


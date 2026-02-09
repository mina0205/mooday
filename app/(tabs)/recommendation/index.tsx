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

  // 감정별 에너지 레벨 매핑
  const getEnergyForEmotion = (emotion: Emotion): string[] => {
    const energyMap: Record<Emotion, string[]> = {
      '설렘': ['중간', '높음'],
      '행복': ['높음', '중간'],
      '피곤함': ['낮음'],
      '우울함': ['낮음', '중간'],
      '화남': ['높음'],
    };
    return energyMap[emotion];
  };

  // 감정 선택 - 개선된 버전
  const handleEmotionSelect = async (emotion: Emotion) => {
    setSelectedEmotion(emotion);
    setLoading(true);
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
      // 위시리스트 불러오기
      const wishlists = await fetchWishlists(userId!, coupleId);
      const preferredEnergies = getEnergyForEmotion(emotion);
      
      // 점수 기반 매칭
      const scoredWishlists = wishlists.map(item => {
        let score = 0;
        
        // mood 매칭 (가장 중요) - 감정이 포함되어 있으면 높은 점수
        if (item.mood && item.mood.includes(emotion)) {
          score += 10;
        }
        
        // energy 매칭 - 감정에 맞는 에너지 레벨이면 추가 점수
        if (item.energy && preferredEnergies.includes(item.energy)) {
          score += 5;
        }
        
        return { ...item, score };
      })
      .filter(item => item.score > 0) // 점수가 있는 것만
      .sort((a, b) => b.score - a.score); // 점수 높은 순

      console.log('📊 매칭된 위시리스트:', scoredWishlists);

      // 상위 3개를 추천 코스로 변환
      const wishlistCourses: DateCourse[] = scoredWishlists
        .slice(0, 3)
        .map(item => ({
          id: item.id,
          title: item.title,
          category: getCategoryByEnergy(item.energy),
          source: 'wishlist',
          description: `${item.energy} 에너지 · ${item.mood}`,
        }));

      // AI 더미 추천 (부족한 만큼만 추가)
      const aiCount = Math.max(0, 4 - wishlistCourses.length);
      const aiCourses = generateAICourses(emotion).slice(0, aiCount);
      
      // 최종 추천 리스트
      const allCourses = [...wishlistCourses, ...aiCourses];
      setRecommendations(allCourses);
      
    } catch (error) {
      console.error('추천 생성 실패:', error);
      // 에러 발생시 더미 데이터만 보여주기
      setRecommendations(generateAICourses(emotion).slice(0, 4));
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
        {recommendations.length > 0 ? (
          recommendations.map((course, index) => (
            <View key={course.id} style={styles.courseCard}>
              <View style={styles.courseHeader}>
                <View style={styles.courseNumber}>
                  <Text style={styles.courseNumberText}>{index + 1}</Text>
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
                    <Text style={styles.courseDescription}>{course.description}</Text>
                  )}
                </View>
              </View>
              <Text style={styles.courseCategory}>{course.category}</Text>
              {course.description && (
                <Text style={styles.courseDescription}>
                  {course.description}
                </Text>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              😢 추천할 데이트 코스가 없어요.{'\n'}
              위시리스트에 데이트 아이디어를 추가해보세요!
            </Text>
          </View>
        )}
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
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
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


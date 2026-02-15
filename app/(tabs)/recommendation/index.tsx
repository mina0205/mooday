import { fetchWishlists } from '@/services/wishlist';
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
} from 'react-native';

type Emotion = 'VERY_GOOD' | 'GOOD' | 'NORMAL' | 'BAD' | 'VERY_BAD';

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
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [recommendations, setRecommendations] = useState<DateCourse[]>([]);
  const [loading, setLoading] = useState(false);

  const emotions: { emotion: Emotion; label: string; icon: string }[] = [
    { emotion: 'VERY_GOOD', label: '설렘', icon: '😍' },
    { emotion: 'GOOD', label: '행복', icon: '😊' },
    { emotion: 'NORMAL', label: '그럭저럭', icon: '😐' },
    { emotion: 'BAD', label: '피곤함', icon: '😵' },
    { emotion: 'VERY_BAD', label: '우울함', icon: '😢' },
  ];

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: coupleIdData } = await supabase.rpc('get_my_couple_id');
      if (!coupleIdData) { setCoupleId(null); return; }
      setCoupleId(coupleIdData);
    }
    init();
  }, []);

  const getEnergyForEmotion = (emotion: Emotion): string[] => {
    const energyMap: Record<Emotion, string[]> = {
      'VERY_GOOD': ['중간', '높음'],
      'GOOD': ['높음', '중간'],
      'NORMAL': ['중간'],
      'BAD': ['낮음'],
      'VERY_BAD': ['낮음', '중간'],
    };
    return energyMap[emotion];
  };

  const handleEmotionSelect = async (emotion: Emotion) => {
    setSelectedEmotion(emotion);
    setLoading(true);
    setStep('result');
    try {
      const wishlists = await fetchWishlists(userId!, null, coupleId);
      const preferredEnergies = getEnergyForEmotion(emotion);
      const scoredWishlists = wishlists.map(item => {
        let score = 0;
        if (item.mood && item.mood.includes(emotion)) score += 10;
        if (item.energy && preferredEnergies.includes(item.energy)) score += 5;
        return { ...item, score };
      }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);

      const wishlistCourses: DateCourse[] = scoredWishlists.slice(0, 3).map(item => ({
        id: item.id,
        title: item.title,
        category: getCategoryByEnergy(item.energy),
        source: 'wishlist',
        description: `${item.energy} 에너지 · ${item.mood}`,
      }));

      const aiCount = Math.max(0, 4 - wishlistCourses.length);
      const aiCourses = generateAICourses(emotion).slice(0, aiCount);
      setRecommendations([...wishlistCourses, ...aiCourses]);
    } catch (error) {
      setRecommendations(generateAICourses(emotion).slice(0, 4));
    } finally {
      setLoading(false);
    }
  };

  const getCategoryByEnergy = (energy: string): string => {
    if (energy === '높음') return '액티비티';
    if (energy === '낮음') return '카페';
    return '맛집';
  };

  const generateAICourses = (emotion: Emotion): DateCourse[] => {
    const coursesByEmotion: Record<Emotion, DateCourse[]> = {
      'VERY_GOOD': [
        { id: 'ai-1', title: '성수 감성 카페', category: '카페', source: 'ai', description: '예쁜 카페에서 달달한 디저트' },
        { id: 'ai-2', title: '북촌 한옥마을 산책', category: '액티비티', source: 'ai', description: '고즈넉한 골목길 데이트' },
        { id: 'ai-3', title: '이태원 루프탑 바', category: '맛집', source: 'ai', description: '야경 보며 로맨틱한 분위기' },
      ],
      'GOOD': [
        { id: 'ai-4', title: '홍대 맛집 투어', category: '맛집', source: 'ai', description: '분위기 좋은 레스토랑에서 즐거운 식사' },
        { id: 'ai-5', title: '롯데월드 타워 전망대', category: '액티비티', source: 'ai', description: '서울의 야경을 함께 감상' },
        { id: 'ai-6', title: '망원 한강공원 피크닉', category: '액티비티', source: 'ai', description: '돗자리 펴고 간식 먹으며 수다' },
      ],
      'NORMAL': [
        { id: 'ai-7', title: '동네 산책', category: '액티비티', source: 'ai', description: '가볍게 동네 한 바퀴' },
        { id: 'ai-8', title: '편한 카페', category: '카페', source: 'ai', description: '편하게 차 마시며 수다' },
        { id: 'ai-9', title: '근처 맛집', category: '맛집', source: 'ai', description: '가까운 곳에서 식사' },
      ],
      'BAD': [
        { id: 'ai-10', title: '조용한 카페에서 휴식', category: '카페', source: 'ai', description: '편안한 소파에서 차 한잔' },
        { id: 'ai-11', title: '집에서 영화 보기', category: '집데이트', source: 'ai', description: '소파에 누워 편하게 영화 감상' },
        { id: 'ai-12', title: '마사지 스파', category: '액티비티', source: 'ai', description: '커플 마사지로 피로 풀기' },
      ],
      'VERY_BAD': [
        { id: 'ai-13', title: '한강 노을 산책', category: '액티비티', source: 'ai', description: '노을 보며 마음 달래기' },
        { id: 'ai-14', title: '북카페에서 독서', category: '카페', source: 'ai', description: '책 읽으며 여유로운 시간' },
        { id: 'ai-15', title: '클라이밍 체험', category: '액티비티', source: 'ai', description: '땀 흘리며 스트레스 해소' },
      ],
    };
    return coursesByEmotion[emotion].slice(0, 2);
  };

  const handleReset = () => {
    setStep('select');
    setSelectedEmotion(null);
    setRecommendations([]);
  };

  const getEmotionLabel = (emotion: Emotion) => ({
    'VERY_GOOD': '설렘', 'GOOD': '행복', 'NORMAL': '그럭저럭',
    'BAD': '피곤함', 'VERY_BAD': '우울함/화남',
  }[emotion]);

  const getEmotionEmoji = (emotion: Emotion) => ({
    'VERY_GOOD': '😍', 'GOOD': '😊', 'NORMAL': '😐',
    'BAD': '😵', 'VERY_BAD': '😢',
  }[emotion]);

  // 감정 선택 화면
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
              {emotions.slice(0, 3).map(({ emotion, label, icon }) => (
                <TouchableOpacity
                  key={emotion}
                  onPress={() => handleEmotionSelect(emotion)}
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
              {emotions.slice(3).map(({ emotion, label, icon }) => (
                <TouchableOpacity
                  key={emotion}
                  onPress={() => handleEmotionSelect(emotion)}
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
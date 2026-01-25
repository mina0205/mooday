import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { WishlistItem } from '@/src/types/wishlist';
import { fetchWishlists } from '@/services/wishlist';
import { supabase } from '@/src/lib/supabase';
import GradientHeart from '@/components/GradientHeart';

// 감정 타입
type Emotion = '설렘' | '행복' | '피곤함' | '우울함' | '화남';

// 추천 데이트 코스
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

  // 감정 목록
  const emotions: { emotion: Emotion; icon: string; color: string }[] = [
    { emotion: '설렘', icon: '😍', color: '#FF9EAA' },
    { emotion: '행복', icon: '😊', color: '#FFD93D' },
    { emotion: '피곤함', icon: '😵', color: '#A8D8B9' },
    { emotion: '우울함', icon: '😢', color: '#81B7D2' },
    { emotion: '화남', icon: '😠', color: '#C85C5C' },
  ];

  // 사용자 정보 가져오기
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        const { data: myCouple } = await supabase
          .from('couple_members')
          .select('couple_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (myCouple) {
          setCoupleId(myCouple.couple_id);
        }
      }
    }
    init();
  }, []);

  // 감정 선택
  const handleEmotionSelect = async (emotion: Emotion) => {
    setSelectedEmotion(emotion);
    setLoading(true);
    setStep('result');

    try {
      // 위시리스트 불러오기
      const wishlists = await fetchWishlists(userId!, coupleId);
      
      // 해당 감정에 맞는 위시리스트 필터링
      const matchedWishlists = wishlists.filter(item => 
        item.mood && item.mood.includes(emotion)
      );

      const wishlistCourses: DateCourse[] = matchedWishlists.slice(0, 2).map(item => ({
        id: item.id,
        title: item.title,
        category: getCategoryByEnergy(item.energy),
        source: 'wishlist',
        description: `${item.energy} 에너지 · ${item.mood}`,
      }));

      // AI 추천 생성
      const aiCourses = generateAICourses(emotion);
      
      // 합치기
      const allCourses = [...wishlistCourses, ...aiCourses].slice(0, 4);
      setRecommendations(allCourses);
    } catch (error) {
      console.error('추천 생성 실패:', error);
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
      '설렘': [
        { id: 'ai-1', title: '성수 감성 카페', category: '카페', source: 'ai', description: '예쁜 카페에서 달달한 디저트' },
        { id: 'ai-2', title: '북촌 한옥마을 산책', category: '액티비티', source: 'ai', description: '고즈넉한 골목길 데이트' },
        { id: 'ai-3', title: '이태원 루프탑 바', category: '맛집', source: 'ai', description: '야경 보며 로맨틱한 분위기' },
      ],
      '행복': [
        { id: 'ai-4', title: '홍대 맛집 투어', category: '맛집', source: 'ai', description: '분위기 좋은 레스토랑에서 즐거운 식사' },
        { id: 'ai-5', title: '롯데월드 타워 전망대', category: '액티비티', source: 'ai', description: '서울의 야경을 함께 감상' },
        { id: 'ai-6', title: '망원 한강공원 피크닉', category: '액티비티', source: 'ai', description: '돗자리 펴고 간식 먹으며 수다' },
      ],
      '피곤함': [
        { id: 'ai-7', title: '조용한 카페에서 휴식', category: '카페', source: 'ai', description: '편안한 소파에서 차 한잔' },
        { id: 'ai-8', title: '집에서 영화 보기', category: '집데이트', source: 'ai', description: '소파에 누워 편하게 영화 감상' },
        { id: 'ai-9', title: '마사지 스파', category: '액티비티', source: 'ai', description: '커플 마사지로 피로 풀기' },
      ],
      '우울함': [
        { id: 'ai-10', title: '국립중앙박물관', category: '액티비티', source: 'ai', description: '조용히 문화생활 즐기기' },
        { id: 'ai-11', title: '한강 노을 산책', category: '액티비티', source: 'ai', description: '노을 보며 마음 달래기' },
        { id: 'ai-12', title: '북카페에서 독서', category: '카페', source: 'ai', description: '책 읽으며 여유로운 시간' },
      ],
      '화남': [
        { id: 'ai-13', title: '클라이밍 체험', category: '액티비티', source: 'ai', description: '땀 흘리며 스트레스 해소' },
        { id: 'ai-14', title: '방탈출 카페', category: '액티비티', source: 'ai', description: '집중하며 화 풀기' },
        { id: 'ai-15', title: '노래방', category: '액티비티', source: 'ai', description: '큰 소리로 노래하며 스트레스 해소' },
      ],
    };

    return coursesByEmotion[emotion].slice(0, 2);
  };

  const handleReset = () => {
    setStep('select');
    setSelectedEmotion(null);
    setRecommendations([]);
  };

  const getEmotionEmoji = (emotion: Emotion) => {
    const emojiMap: Record<Emotion, string> = {
      '설렘': '😍',
      '행복': '😊',
      '피곤함': '😵',
      '우울함': '😢',
      '화남': '😠',
    };
    return emojiMap[emotion];
  };

  // 감정 선택 화면 (모달 팝업)
  if (step === 'select') {
    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* 헤더 */}
          <View style={styles.modalHeader}>
            <GradientHeart size={24} />
            <Text style={styles.modalTitle}>오늘 기분이 어떠세요?</Text>
          </View>

          {/* 이모지 프레임 */}
          <View style={styles.emojiFrame}>
            <View style={styles.emojiRow}>
              {emotions.map(({ emotion, icon }) => (
                <TouchableOpacity
                  key={emotion}
                  onPress={() => handleEmotionSelect(emotion)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.bigEmoji}>{icon}</Text>
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

  // 추천 결과 화면
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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleReset}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          {selectedEmotion && (
            <Text style={styles.emotionEmoji}>{getEmotionEmoji(selectedEmotion)}</Text>
          )}
          <Text style={styles.headerTitle}>{selectedEmotion} 데이트 추천</Text>
        </View>
        <Text style={styles.subtitle}>
          오늘 기분에 맞는 데이트 코스를 골라봤어요
        </Text>
      </View>

      <View style={styles.content}>
        {recommendations.map((course, index) => (
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
          </View>
        ))}
      </View>

      {/* 다시 선택하기 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={handleReset}
        >
          <Text style={styles.resetButtonText}>다른 감정 선택하기</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // 모달 오버레이 (반투명 배경)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  // 모달 컨테이너 (흰색 박스)
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    width: '90%',
    maxWidth: 600,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  
  // 모달 헤더
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginLeft: 12,
  },
  
  // 이모지 프레임
  emojiFrame: {
    borderWidth: 3,
    borderColor: '#FF9EAA',
    borderRadius: 16,
    padding: 32,
    backgroundColor: 'white',
  },
  
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  bigEmoji: {
    fontSize: 56,
  },
  
  emojiCaption: {
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
    textAlign: 'left',
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    marginBottom: 12,
  },
  backIcon: {
    fontSize: 24,
    color: '#333',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emotionEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 40,
  },
  
  // 추천 결과 화면
  content: {
    padding: 20,
  },
  courseCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseHeader: {
    flexDirection: 'row',
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
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
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
    color: '#333',
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
    marginBottom: 4,
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
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6EC6FF',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6EC6FF',
  },
});
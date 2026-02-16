import { AnalyzedWishlist } from '@/src/types/wishlistAnalyzer';
import { supabase } from '@/src/lib/supabase';

/* =========================
 * Rule 기반 분석
 * ========================= */
function analyzeWishlistByRule(text: string): AnalyzedWishlist | null {
  const t = text.toLowerCase();

  // 🔥 높은 에너지
  if (['놀이공원', '클럽', '운동', '스포츠', '등산'].some(k => t.includes(k))) {
    return {
      title: text,
      energy: '높음',
      energy_score: 5,
      energy_source: 'rule',
      mood: '활동적',
      originalText: text,
    };
  }

  // 🔥 낮은 에너지 (잠자기 포함)
  if (
    [
      '카페', '영화', '산책', '힐링', '휴식',
      '차분', '조용', '독서',
      '잠', '잠자', '잠자기', '수면', '눕', '쉬기',
    ].some(k => t.includes(k))
  ) {
    return {
      title: text,
      energy: '낮음',
      energy_score: 1,
      energy_source: 'rule',
      mood: '차분함',
      originalText: text,
    };
  }

  return null;
}

/* =========================
 * ✅ 최종 분석 함수 (rule → AI -> fallback)
 * ========================= */
export async function analyzeWishlist(text: string): Promise<AnalyzedWishlist> {

  // 1️⃣ rule 우선
  const ruleResult = analyzeWishlistByRule(text);
  if (ruleResult) return ruleResult;

  // 2️⃣ AI fallback
  const { data, error } = await supabase.functions.invoke(
    'analyze-wishlist',
    {
      body: { text },
    }
  );

  console.log("🧪 invoke result:", {
  data,
  error,
  status: error?.context?.status
});

  // 3️⃣ AI 실패 → rule fallback 재시도
  if (error || !data) {
    console.warn('⚠️ AI 실패 → rule fallback 재시도');

    const fallbackRule = analyzeWishlistByRule(text);
    if (fallbackRule) {
      return {
        ...fallbackRule,
        energy_source: 'rule',
      };
    }
    // rule도 없으면 최종 안전 기본값
    return {
      title: text,
      energy: '중간',
      energy_score: 3,
      energy_source: 'rule',
      mood: '일반',
      originalText: text,
    };
  }

    // 4️⃣ AI 성공
  return {
    title: text,
    energy: data.energy,
    energy_score: data.energy_score,
    energy_source: 'ai',
    mood: '일반',
    originalText: text,
  };
}

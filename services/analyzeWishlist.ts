import { AnalyzedWishlist } from '@/src/types/wishlistAnalyzer';

/* =========================
 * 키워드 사전
 * ========================= */
const HIGH_ENERGY_KEYWORDS = [
  '놀이공원', '롯데월드', '에버랜드', '클럽', '페스티벌',
  '액티비티', '등산', '운동', '스포츠', '번지', '서핑',
  '신나', '활동적', '파티', '댄스', '드라이브', '여행',
  '바다', '수영', '볼링', '당구', '노래방', '게임',
];

const LOW_ENERGY_KEYWORDS = [
  '카페', '영화', '산책', '조용', '집', '독서', '힐링',
  '휴식', '차분', '평화', '편안', '수다', '브런치',
  '전시회', '미술관', '박물관', '도서관', '공원',
  '야경', '감상', '피크닉',
];

/* =========================
 * Rule 기반 에너지 분석
 * ========================= */
function analyzeEnergyByRule(
  text: string
): Pick<AnalyzedWishlist, 'energy' | 'energy_score'> | null {
  const t = text.toLowerCase();

  if (HIGH_ENERGY_KEYWORDS.some(k => t.includes(k))) {
    return { energy: '높음', energy_score: 5 };
  }

  if (LOW_ENERGY_KEYWORDS.some(k => t.includes(k))) {
    return { energy: '낮음', energy_score: 1 };
  }

  // 판단 불가 → fallback
  return null;
}

/* =========================
 * 무드 분석 (기존 로직 유지)
 * ========================= */
function analyzeMood(text: string): string {
  const t = text.toLowerCase();
  const moods: string[] = [];

  if (/행복|즐거|재미|웃|좋|기쁨|유쾌/.test(t)) moods.push('행복');
  if (/설레|두근|기대|특별/.test(t)) moods.push('설렘');
  if (/차분|힐링|휴식|편안|조용/.test(t)) moods.push('차분함');
  if (/로맨틱|낭만|분위기|데이트|야경/.test(t)) moods.push('로맨틱');
  if (/활동|운동|스포츠|액티/.test(t)) moods.push('활동적');

  return moods.length > 0 ? moods.join(', ') : '일반';
}

/* =========================
 * 제목 생성
 * ========================= */
function generateTitle(text: string): string {
  let title = text
    .replace(/하고 싶어|가고 싶어|보고 싶어|먹고 싶어/g, '')
    .trim();

  if (title.length > 20) {
    title = title.slice(0, 20) + '...';
  }

  return title || text.slice(0, 20);
}

/* =========================
 * 메인 분석 함수
 * ========================= */
export function analyzeWishlist(text: string): AnalyzedWishlist {
  const ruleResult = analyzeEnergyByRule(text);

  // 1) Rule로 판단 가능
  if (ruleResult) {
    return {
      title: generateTitle(text),
      energy: ruleResult.energy,
      energy_score: ruleResult.energy_score,
      energy_source: 'rule',
      mood: analyzeMood(text),
      originalText: text,
    };
  }

  // 2) AI fallback 슬롯 (아직은 기본값)
  return {
    title: generateTitle(text),
    energy: '중간',
    energy_score: 3,
    energy_source: 'ai', // ⭐️ energy_source === 'ai' 인 경우만 LLM 호출 -> 실패시 그냥 3점 
    mood: analyzeMood(text),
    originalText: text,
  };
}

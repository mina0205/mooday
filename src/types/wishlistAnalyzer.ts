export type EnergySource = 'rule' | 'ai';

// UI + 추천 공통 결과
export interface AnalyzedWishlist {
  title: string;

  // UI 표시용
  energy: '낮음' | '중간' | '높음';

  // 추천 핵심 값
  energy_score: 1 | 3 | 5;

  // 점수 산출 방식
  energy_source: EnergySource;

  // 감정 태그
  mood: string;

  // 원문
  originalText: string;
}

import type { EnergySource } from './wishlistAnalyzer';

export type OwnerType = 'PERSONAL' | 'COUPLE';

export interface WishlistItem {
  id: string;

  title: string;

  // UI 표시
  energy: '낮음' | '중간' | '높음';

  // 추천 핵심
  energy_score: 1 | 3 | 5;

  // 점수 산출 출처
  energy_source: EnergySource;

  mood: string;

  owner_type: OwnerType;

  owner_user_id: string | null;
  couple_id: string | null;

  created_at: string;

  original_text?: string;
}

export type OwnerType = 'PERSONAL' | 'COUPLE';

// 위시리스트 타입 정의
export interface WishlistItem {
  id: string;
  title: string;
  energy: string;        // UI 표시용
  energy_score: number;  // 실제 점수
  mood: string;
  owner_type: OwnerType;
  owner_user_id: string;
  couple_id: string;
  created_at: string;
  original_text?: string; // 사용자가 입력한 원본 텍스트 (선택적)
}
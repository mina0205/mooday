export type OwnerType = 'PERSONAL' | 'COUPLE';

//스케줄 타입 정의
export interface Schedule {
  id: string;
  title: string;
  memo: string | null; 
  start_date: string;
  end_date: string;          
  owner_type: OwnerType;
  owner_user_id: string;
  couple_id: string | null;
}

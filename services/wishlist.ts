
import { supabase } from '@/src/lib/supabase';
import { WishlistItem, OwnerType } from '@/src/types/wishlist';

/* =========================
 * 위시리스트 조회
 * ========================= */
export async function fetchWishlists(
  userId: string,
  partnerId: string | null,
  coupleId: string | null
) {

  console.log('🚨 fetchWishlists called');
  console.log('👤 userId:', userId);
  console.log('👫 coupleId:', coupleId);
  // 1️⃣ 내 개인 위시
  const { data: personal, error: personalError } = await supabase
    .from('wishlist_items')
    .select('*')
    .eq('owner_type', 'PERSONAL')
    .eq('owner_user_id', userId);

  if (personalError) {
    console.error('❌ personal wishlist error:', personalError);
    throw personalError;
  }

// 2️⃣ 상대방 개인 위시
  let partnerPersonal: any[] = [];

if (partnerId) {
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*')
    .eq('owner_type', 'PERSONAL')
    .eq('owner_user_id', partnerId); 

  if (error) {
    console.error('❌ partner personal wishlist error:', error);
    throw error;
  }

  partnerPersonal = data ?? [];
}

  // 2️⃣ 커플 위시
  let couple: any[] = [];

  if (coupleId) {
    const { data: coupleData, error: coupleError } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('owner_type', 'COUPLE')
      .eq('couple_id', coupleId);

    if (coupleError) {
      console.error('❌ couple wishlist error:', coupleError);
      throw coupleError;
    }

    couple = coupleData ?? [];
  }

   // 4️⃣ 합치고 최신순 정렬
  const merged = [
    ...(personal ?? []),
    ...(partnerPersonal ?? []),
    ...couple,
  ].sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  );

  // 🔍 디버깅 로그
  console.log('📊 personal:', personal?.length ?? 0);
  console.log('📊 partner personal:', partnerPersonal?.length ?? 0);
  console.log('📊 couple:', couple.length);
  console.log('📊 merged:', merged.length);

  return merged;
  }

/* =========================
 * 위시리스트 추가
 * ========================= */
export async function addWishlist(
  userId: string,
  coupleId: string | null,
  title: string,
  energy: string,
  mood: string,
  ownerType: OwnerType
): Promise<WishlistItem> {
  let resolvedCoupleId = coupleId;

  // 🔥 핵심: COUPLE인데 coupleId 없으면 서버에서 직접 조회
  if (ownerType === 'COUPLE' && !resolvedCoupleId) {
    console.log('🔍 coupleId 없음 → get_my_couple_id 호출');

    const { data, error } = await supabase.rpc('get_my_couple_id');

    if (error || !data) {
      console.error('❌ get_my_couple_id 실패:', error);
      throw new Error('커플이 연결되지 않았습니다.');
    }

    resolvedCoupleId = data;
  }

  const payload = {
    title,
    energy,
    mood,
    owner_type: ownerType,
    owner_user_id: userId,
    couple_id: ownerType === 'COUPLE' ? resolvedCoupleId : null,
  };

  console.log('📦 insert payload (resolved):', payload);

  const { data, error } = await supabase
    .from('wishlist_items')
    .insert(payload)
    .select()
    .single(); // ⭐ RLS 체크 + 즉시 결과 반환

  if (error) {
    console.error('❌ addWishlist error:', error);
    throw error;
  }

  return data;
}

/* =========================
 * 위시리스트 삭제
 * ========================= */
export async function deleteWishlist(id: string) {
  const { data, error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('id', id)
    .select('id'); 

  if (error) {
    console.error('❌ deleteWishlist error:', error);
    throw error;
  }

  // 실제로 삭제된 row가 없으면 실패로 처리(상대일정 삭제 방지)
  if (!data || data.length === 0) {
    throw new Error('DELETE_NOT_ALLOWED');
  }
}
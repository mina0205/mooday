
import { supabase } from '@/src/lib/supabase';
import { WishlistItem, OwnerType } from '@/src/types/wishlist';

/* =========================
 * 위시리스트 조회
 * ========================= */
export async function fetchWishlists(
  userId: string,
  coupleId: string | null
): Promise<WishlistItem[]> {
  let query = supabase
    .from('wishlist_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (coupleId) {
    // 개인 + 커플 위시
    query = query.or(
      `and(owner_user_id.eq.${userId},owner_type.eq.PERSONAL),and(couple_id.eq.${coupleId},owner_type.eq.COUPLE)`
    );
  } else {
    // 커플 미연결 → 개인 위시만
    query = query
      .eq('owner_user_id', userId)
      .eq('owner_type', 'PERSONAL');
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ fetchWishlists error:', error);
    throw error;
  }

  return data ?? [];
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
  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('❌ deleteWishlist error:', error);
    throw error;
  }
}

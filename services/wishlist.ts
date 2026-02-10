import { supabase } from '@/src/lib/supabase';
import { WishlistItem, OwnerType } from '@/src/types/wishlist';
import { analyzeWishlist } from './analyzeWishlist';

/* =========================
 * 위시리스트 조회
 * ========================= */
export async function fetchWishlists(
  userId: string,
  partnerId: string | null,
  coupleId: string | null
): Promise<WishlistItem[]> {
  const { data: personal } = await supabase
    .from('wishlist_items')
    .select('*')
    .eq('owner_type', 'PERSONAL')
    .eq('owner_user_id', userId);

  let partnerPersonal: WishlistItem[] = [];
  if (partnerId) consider(() => {});

  if (partnerId) {
    const { data } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('owner_type', 'PERSONAL')
      .eq('owner_user_id', partnerId);
    partnerPersonal = data ?? [];
  }

  let couple: WishlistItem[] = [];
  if (coupleId) {
    const { data } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('owner_type', 'COUPLE')
      .eq('couple_id', coupleId);
    couple = data ?? [];
  }

  return [...(personal ?? []), ...partnerPersonal, ...couple].sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  );
}

/* =========================
 * ✅ 위시 추가 + AI 분석 + 로그 저장
 * ========================= */
export async function addWishlist(
  userId: string,
  coupleId: string | null,
  text: string,
  ownerType: OwnerType
): Promise<WishlistItem> {
  const analyzed = await analyzeWishlist(text);

  let resolvedCoupleId: string | null = null;

  if (ownerType === 'COUPLE') {
    const { data, error } = await supabase
      .from('couple_members')
      .select('couple_id')
      .eq('user_id', userId)
      .single();

    if (error || !data?.couple_id) {
      throw new Error('커플이 연결되어 있지 않습니다.');
    }

    resolvedCoupleId = data.couple_id;
  }

  const { data, error } = await supabase
    .from('wishlist_items')
    .insert({
      title: analyzed.title,
      energy: analyzed.energy,
      energy_score: analyzed.energy_score,
      energy_source: analyzed.energy_source,
      mood: analyzed.mood,
      owner_type: ownerType,

      // ⭐️ 항상 작성자 기록
      owner_user_id: userId,

      // ⭐️ 커플 위시만 couple_id
      couple_id: ownerType === 'COUPLE' ? resolvedCoupleId : null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as WishlistItem;
}


/* =========================
 * 삭제
 * ========================= */
export async function deleteWishlist(id: string) {
  const { data, error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('id', id)
    .select('id');

  if (error || !data?.length) {
    throw new Error('DELETE_NOT_ALLOWED');
  }
}

/* =========================
 * 수정
 * ========================= */
export async function updateWishlist(
  id: string,
  title: string,
  energy: string,
  energyScore: number,
  energySource: string,
  mood: string
): Promise<WishlistItem> {
  const { data, error } = await supabase
    .from('wishlist_items')
    .update({
      title,
      energy,
      energy_score: energyScore,
      energy_source: energySource,
      mood,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as WishlistItem;
}
function consider(cb?: () => void): void {
  if (typeof cb !== 'function') return;
  try {
    cb();
  } catch (err) {
    // Don't let optional side-effects break the main flow
    // Keep a lightweight debug log to help troubleshooting
    // eslint-disable-next-line no-console
    console.warn('consider callback threw an error:', err);
  }
}


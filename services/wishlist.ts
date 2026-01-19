import { supabase } from '@/src/lib/supabase';
import { WishlistItem, OwnerType } from '@/src/types/wishlist';

export async function fetchWishlists(
  userId: string,
  coupleId: string | null
): Promise<WishlistItem[]> {
  let query = supabase
    .from('wishlist_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (coupleId) {
    query = query.or(
      `and(owner_user_id.eq.${userId},owner_type.eq.PERSONAL),and(couple_id.eq.${coupleId},owner_type.eq.COUPLE)`
    );
  } else {
    query = query
      .eq('owner_user_id', userId)
      .eq('owner_type', 'PERSONAL');
  }

  const { data, error } = await query;

  if (error) {
    console.error('fetchWishlists error:', error);
    throw error;
  }

  return data ?? [];
}

export async function addWishlist(
  userId: string,
  coupleId: string | null,
  title: string,
  energy: string,
  mood: string,
  ownerType: OwnerType
): Promise<WishlistItem> {
  const payload = {
    title,
    energy,
    mood,
    owner_type: ownerType,
    owner_user_id: userId,
    couple_id: ownerType === 'COUPLE' ? coupleId : null,
  };

  console.log('📦 insert payload:', payload);

  const { data, error } = await supabase
    .from('wishlist_items')
    .insert(payload)
    .select()
    .single();   // ⭐⭐⭐ 이게 핵심

  if (error) {
    console.error('addWishlist error:', error);
    throw error;
  }

  return data;
}

export async function deleteWishlist(id: string) {
  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

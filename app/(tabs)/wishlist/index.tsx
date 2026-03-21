import AddWishlistModal from '@/components/AddWishlistModal';
import GradientHeart from '@/components/GradientHeart';
import WishlistCard from '@/components/WishlistCard';
import MenuButton from '@/components/MenuButton';
import { addWishlist, deleteWishlist, fetchWishlists, updateWishlist } from '@/services/wishlist';
import { supabase } from '@/src/lib/supabase';
import { OwnerType, WishlistItem } from '@/src/types/wishlist';
import { useAuthCouple } from '@/src/context/AuthCoupleContext';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';

const COLORS = {
  MY: '#6EC6FF',
  PARTNER: '#FF9EAA',
  COUPLE: '#C77DFF',
  BG: '#000000',
  CARD: '#1a1a1a',
  BORDER: '#2a2a2a',
  TEXT: '#FFFFFF',
  SUBTEXT: '#888888',
};

export default function WishlistScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [coupleId, setCoupleId] = useState<string | null>(null);

  const [myWishlists, setMyWishlists] = useState<WishlistItem[]>([]);
  const [partnerWishlists, setPartnerWishlists] = useState<WishlistItem[]>([]);
  const [coupleWishlists, setCoupleWishlists] = useState<WishlistItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalOwnerType, setModalOwnerType] = useState<OwnerType>('PERSONAL');

  const [editingWishlist, setEditingWishlist] = useState<WishlistItem | null>(null);

  const { myNickname, partnerNickname } = useAuthCouple();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data: coupleId } = await supabase.rpc('get_my_couple_id');
      setCoupleId(coupleId ?? null);
    };

    init();
  }, []);

  useEffect(() => {
    if (userId) {
      loadWishlists();
    }
  }, [userId, coupleId]);

  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        loadWishlists();
      }
    }, [userId, coupleId])
  );

  const loadWishlists = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const data = await fetchWishlists(userId, coupleId);

      const mine = data.filter(
        item =>
          item.owner_type === 'PERSONAL' &&
          item.owner_user_id === userId
      );

      const partner = data.filter(
        item =>
          item.owner_type === 'PERSONAL' &&
          item.owner_user_id !== userId
      );

      const couple = data.filter(
        item => item.owner_type === 'COUPLE'
      );

      setMyWishlists(mine);
      setPartnerWishlists(partner);
      setCoupleWishlists(couple);
    } catch (e) {
      console.error('❌ 위시리스트 로딩 실패:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWishlist = async (title: string, energy: string, energyScore: number, energySource: string, mood: string, ownerType: OwnerType) => {
    if (!userId) { Alert.alert('알림', '로그인이 필요합니다.'); return; }
    try {
      const newWishlist = await addWishlist(
        userId,
        ownerType === 'COUPLE' ? coupleId : null,
        title,
        ownerType
      );

      if (ownerType === 'PERSONAL') {
        setMyWishlists([newWishlist, ...myWishlists]);
      } else {
        setCoupleWishlists([newWishlist, ...coupleWishlists]);
      }

      setModalVisible(false);
      Alert.alert('성공', '위시리스트가 추가되었습니다!');
    } catch (error: any) {
      Alert.alert('오류', '위시리스트 추가에 실패했습니다.');
    }
  };

  const handleDeleteWishlist = async (id: string) => {
    try {
      await deleteWishlist(id);
      setMyWishlists(prev => prev.filter(item => item.id !== id));
      setPartnerWishlists(prev => prev.filter(item => item.id !== id));
      setCoupleWishlists(prev => prev.filter(item => item.id !== id));
      Alert.alert('성공', '위시리스트가 삭제되었습니다.');
    } catch (error) {
      Alert.alert('오류', '위시리스트 삭제에 실패했습니다.');
    }
  };

  const handleEditWishlist = (item: WishlistItem) => {
    if (
      item.owner_type === 'PERSONAL' &&
      item.owner_user_id !== userId
    ) {
      Alert.alert('권한 없음', '상대방의 위시는 수정할 수 없어요.');
      return;
    }

    if (
      item.owner_type === 'COUPLE' &&
      item.couple_id !== coupleId
    ) {
      Alert.alert('권한 없음', '커플 위시만 수정할 수 있어요.');
      return;
    }

    setEditingWishlist(item);
    setModalOwnerType(item.owner_type);
    setModalVisible(true);
  };

  const handleUpdateWishlist = async (
    id: string,
    title: string,
    energy: string,
    energyScore: number,
    energySource: string,
    mood: string
  ) => {
    try {
      const updated = await updateWishlist(id, title, energy, energyScore, energySource, mood);
      await loadWishlists();

      setModalVisible(false);
      setEditingWishlist(null);

      Alert.alert('성공', '위시리스트가 수정되었습니다!');
    } catch (e) {
      console.error('❌ 수정 실패:', e);
      Alert.alert('오류', '수정에 실패했습니다.');
    }
  };

  const openAddModal = (ownerType: OwnerType) => {
    setEditingWishlist(null);
    setModalOwnerType(ownerType);
    setModalVisible(true);
  };

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.MY} />
    </View>
  );

  if (!userId) return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>로그인이 필요합니다</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <MenuButton />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* 헤더 - 캘린더와 동일한 스타일 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>위시리스트</Text>
          <Text style={styles.headerSub}>
            {coupleId ? '함께 하고 싶은 데이트를 추가해보세요' : '하고 싶은 데이트를 추가해보세요'}
          </Text>
        </View>

        {/* 범례 - 캘린더와 동일 */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.MY }]} />
            <Text style={styles.legendText}>나</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.PARTNER }]} />
            <Text style={styles.legendText}>상대</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.COUPLE }]} />
            <Text style={styles.legendText}>커플</Text>
          </View>
        </View>

        {/* 내 위시 섹션 */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionDot, { backgroundColor: COLORS.MY }]} />
              <Text style={styles.sectionTitle}>{myNickname}의 위시</Text>
            </View>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => openAddModal('PERSONAL')}
              activeOpacity={0.7}
            >
              <Text style={styles.addBtnText}>＋</Text>
            </TouchableOpacity>
          </View>

          {myWishlists.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>아직 위시리스트가 없어요</Text>
            </View>
          ) : (
            <View style={styles.wishlistItems}>
              {myWishlists.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.wishItem, { borderLeftColor: COLORS.MY }]}
                  onPress={() => handleEditWishlist(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.wishItemContent}>
                    <Text style={styles.wishItemTitle}>{item.title}</Text>
                    <View style={styles.wishItemBadgeRow}>
                      <View style={[styles.wishItemBadge, { backgroundColor: 'rgba(110,198,255,0.15)' }]}>
                        <Text style={[styles.wishItemBadgeText, { color: COLORS.MY }]}>개인</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteWishlist(item.id)}
                    style={styles.deleteIconBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.deleteIcon}>✕</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 상대 위시 섹션 */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionDot, { backgroundColor: COLORS.PARTNER }]} />
              <Text style={styles.sectionTitle}>{partnerNickname}의 위시</Text>
            </View>
          </View>

          {partnerWishlists.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>💌</Text>
              <Text style={styles.emptyText}>아직 위시리스트가 없어요</Text>
            </View>
          ) : (
            <View style={styles.wishlistItems}>
              {partnerWishlists.map(item => (
                <View
                  key={item.id}
                  style={[styles.wishItem, { borderLeftColor: COLORS.PARTNER }]}
                >
                  <View style={styles.wishItemContent}>
                    <Text style={styles.wishItemTitle}>{item.title}</Text>
                    <View style={styles.wishItemBadgeRow}>
                      <View style={[styles.wishItemBadge, { backgroundColor: 'rgba(255,158,170,0.15)' }]}>
                        <Text style={[styles.wishItemBadgeText, { color: COLORS.PARTNER }]}>개인</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 커플 위시 섹션 */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionDot, { backgroundColor: COLORS.COUPLE }]} />
              <Text style={styles.sectionTitle}>우리의 위시리스트</Text>
            </View>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => openAddModal('COUPLE')}
              activeOpacity={0.7}
            >
              <Text style={styles.addBtnText}>＋</Text>
            </TouchableOpacity>
          </View>

          {coupleWishlists.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>💜</Text>
              <Text style={styles.emptyText}>아직 위시리스트가 없어요</Text>
            </View>
          ) : (
            <View style={styles.wishlistItems}>
              {coupleWishlists.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.wishItem, { borderLeftColor: COLORS.COUPLE }]}
                  onPress={() => handleEditWishlist(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.wishItemContent}>
                    <Text style={styles.wishItemTitle}>{item.title}</Text>
                    <View style={styles.wishItemBadgeRow}>
                      <View style={[styles.wishItemBadge, { backgroundColor: 'rgba(199,125,255,0.15)' }]}>
                        <Text style={[styles.wishItemBadgeText, { color: COLORS.COUPLE }]}>커플</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteWishlist(item.id)}
                    style={styles.deleteIconBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.deleteIcon}>✕</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FAB - 캘린더와 동일 */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => openAddModal('PERSONAL')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      <AddWishlistModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setEditingWishlist(null); }}
        onAdd={handleAddWishlist}
        onUpdate={handleUpdateWishlist}
        initialItem={editingWishlist}
        mode={editingWishlist ? 'edit' : 'create'}
        isCouple={modalOwnerType === 'COUPLE'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BG,
  },
  loadingText: {
    color: COLORS.SUBTEXT,
    fontSize: 16,
  },
  scroll: {
    flex: 1,
  },

  // 헤더 - 캘린더와 동일
  header: {
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.TEXT,
    letterSpacing: -1,
  },
  headerSub: {
    fontSize: 14,
    color: COLORS.SUBTEXT,
    marginTop: 4,
  },

  // 범례 - 캘린더와 동일
  legend: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.SUBTEXT,
  },

  // 섹션 카드 - 캘린더의 calendarCard 스타일 기반
  sectionCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 24,
    marginHorizontal: 24,
    marginTop: 16,
    padding: 0,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.TEXT,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    fontSize: 20,
    color: COLORS.TEXT,
    fontWeight: '300',
    lineHeight: 24,
  },

  // 빈 상태
  emptyState: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingBottom: 32,
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.SUBTEXT,
  },

  // 위시 아이템 리스트
  wishlistItems: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  wishItem: {
    backgroundColor: COLORS.BORDER,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wishItemContent: {
    flex: 1,
  },
  wishItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: 6,
  },
  wishItemBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  wishItemBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  wishItemBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  deleteIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteIcon: {
    fontSize: 14,
    color: '#555',
    fontWeight: '400',
  },

  // FAB - 캘린더와 동일
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.MY,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.MY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  fabText: {
    fontSize: 28,
    color: '#000',
    fontWeight: '300',
    lineHeight: 32,
  },
});

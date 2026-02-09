import AddWishlistModal from '@/components/AddWishlistModal';
import GradientHeart from '@/components/GradientHeart';
import WishlistCard from '@/components/WishlistCard';
import { addWishlist, deleteWishlist, fetchWishlists, updateWishlist } from '@/services/wishlist';
import { supabase } from '@/src/lib/supabase';
import { OwnerType, WishlistItem } from '@/src/types/wishlist';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function WishlistScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [coupleId, setCoupleId] = useState<string | null>(null);
  
  const [myWishlists, setMyWishlists] = useState<WishlistItem[]>([]);
  const [partnerWishlists, setPartnerWishlists] = useState<WishlistItem[]>([]);
  const [coupleWishlists, setCoupleWishlists] = useState<WishlistItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalOwnerType, setModalOwnerType] = useState<OwnerType>('PERSONAL');

  const [editingWishlist, setEditingWishlist] = useState<WishlistItem | null>(null);


  // 현재 사용자 확인 및 커플 정보 가져오기 (RPC)
useEffect(() => {
  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUserId(user.id);

    // 1️⃣ 커플 ID
    const { data: coupleId, error: coupleErr } =
      await supabase.rpc('get_my_couple_id');

    if (coupleErr || !coupleId) {
      console.log('ℹ️ 커플 없음');
      setCoupleId(null);
      setPartnerId(null);
      return;
    }

    setCoupleId(coupleId);

    // 2️⃣ 커플 유저들 
    const { data: userIds, error: usersErr } =
      await supabase.rpc('get_couple_user_ids');

    if (usersErr) {
      console.error('❌ get_couple_user_ids error:', usersErr);
      return;
    }

    if (userIds?.length === 2) {
      const partner = userIds.find(id => id !== user.id);
      setPartnerId(partner ?? null);
    }
  }

  init();
}, []);

  // userId가 설정되면 위시리스트 불러오기 
  useEffect(() => {
    if (userId) {
      loadWishlists();
    }
  }, [userId, partnerId, coupleId]);

  // 탭 포커스 시 자동 새로고침
  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        console.log('🔄 탭 포커스 - 위시리스트 새로고침');
        loadWishlists();
      }
    }, [userId, partnerId, coupleId])
  );

  const loadWishlists = async () => {
    if (!userId) return;

     if (coupleId && !partnerId) {
    console.log('⏳ partnerId 아직 없음, fetch 대기');
    return;
  }
   console.log('📥 위시리스트 불러오기 시작...');
   console.log('👤 userId:', userId);
   console.log('💑 partnerId:', partnerId);
   console.log('👫 coupleId:', coupleId);
    setLoading(true);
    try {
      const data = await fetchWishlists(userId, partnerId, coupleId);
      console.log('✅ 전체 위시리스트:', data.length, '개');
      
      // 내 위시리스트 (개인)
      const mine = data.filter(
        item => item.owner_user_id === userId && item.owner_type === 'PERSONAL'
      );
      
      // 상대방 위시리스트 (개인) - partnerId 있을 때만
      const partner = data.filter(
        item => item.owner_type === 'PERSONAL' && item.owner_user_id !== userId
      );
      
      // 우리의 위시리스트 (커플 공유)
      const couple = data.filter(
        item => item.owner_type === 'COUPLE'
      );
      
      setMyWishlists(mine);
      setPartnerWishlists(partner);
      setCoupleWishlists(couple);
      
      console.log('📊 내 것:', mine.length, '개');
      console.log('📊 상대방:', partner.length, '개');
      console.log('📊 커플:', couple.length, '개');
      
    } catch (error) {
      console.error('❌ 위시리스트 불러오기 실패:', error);
      Alert.alert('오류', '위시리스트를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 위시 추가 
  const handleAddWishlist = async (
    title: string,
    energy: string,
    energyScore: number,
    energySource: string,
    mood: string,
    ownerType: OwnerType
  ) => {

    console.log('🧩 WishlistScreen coupleId:', coupleId);
    console.log('🧩 ownerType:', ownerType);
    if (!userId) {
      Alert.alert('알림', '로그인이 필요합니다.');
      return;
    }

    console.log('🎯 위시리스트 추가:', { title, energy, mood, ownerType });

    try {
      const newWishlist = await addWishlist(
        userId,
        coupleId,
        title,
        energy,
        energyScore,
        energySource,
        mood,
        ownerType
      );
      
      console.log('🎯 위시리스트 추가:', { title, energy, energyScore, mood, ownerType });

      if (ownerType === 'PERSONAL') {
        setMyWishlists([newWishlist, ...myWishlists]);
      } else {
        setCoupleWishlists([newWishlist, ...coupleWishlists]);
      }
      
      setModalVisible(false);
      Alert.alert('성공', '위시리스트가 추가되었습니다!');
    } catch (error: any) {
      console.error('🚨 저장 실패:', error);
      Alert.alert('오류', '위시리스트 추가에 실패했습니다.');
    }
  };

  // 위시 삭제 
  const handleDeleteWishlist = async (id: string) => {
    console.log('🗑️ 삭제:', id);
    try {
      await deleteWishlist(id);
      
      // 모든 리스트에서 제거
      setMyWishlists(prev => prev.filter(item => item.id !== id));
      setPartnerWishlists(prev => prev.filter(item => item.id !== id));
      setCoupleWishlists(prev => prev.filter(item => item.id !== id));
      
      Alert.alert('성공', '위시리스트가 삭제되었습니다.');
    } catch (error) {
      console.error('❌ 삭제 실패:', error);
      Alert.alert('오류', '위시리스트 삭제에 실패했습니다.');
    }
  };

// 위시 수정 모달 열기
  const handleEditWishlist = (item: WishlistItem) => {
  // 권한 체크 (UI 1차 방어)
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

// 위시 수정
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

    setMyWishlists(prev =>
      prev.map(item => item.id === id ? updated : item)
    );
    setPartnerWishlists(prev =>
      prev.map(item => item.id === id ? updated : item)
    );
    setCoupleWishlists(prev =>
      prev.map(item => item.id === id ? updated : item)
    );

    setModalVisible(false);
    setEditingWishlist(null);

    Alert.alert('성공', '위시리스트가 수정되었습니다!');
  } catch (e) {
    console.error('❌ 수정 실패:', e);
    Alert.alert('오류', '수정에 실패했습니다.');
  }
};

  const openAddModal = (ownerType: OwnerType) => {
    setModalOwnerType(ownerType);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6EC6FF" />
      </View>
    );
  }

  if (!userId) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>로그인이 필요합니다</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <GradientHeart size={28} />
          <Text style={styles.headerTitle}>
            {coupleId ? '우리만의 위시리스트' : '나만의 위시리스트'}
          </Text>
        </View>
        <Text style={styles.subtitle}>
          {coupleId ? '함께 하고 싶은 데이트를 추가해보세요' : '하고 싶은 데이트를 추가해보세요'}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* 내가 하고싶은 데이트 */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, styles.mySection]}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.redHeartIcon}>♥</Text>
              <Text style={styles.sectionTitle}>내가 하고싶은 데이트</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => openAddModal('PERSONAL')}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.sectionContent}>
            {myWishlists.length === 0 ? (
              <Text style={styles.emptyText}>아직 위시리스트가 없어요</Text>
            ) : (
              myWishlists.map(item => (
                <WishlistCard 
                  key={item.id} 
                  item={item} 
                  onDelete={handleDeleteWishlist}
                  onPress={handleEditWishlist} 
                  currentUserId={userId || undefined}
                />
              ))
            )}
          </View>
        </View>

        {/* 상대방이 하고싶은 데이트 */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, styles.partnerSection]}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.blueHeartIcon}>♥</Text>
              <Text style={styles.sectionTitle}>상대방이 하고싶은 데이트</Text>
            </View>
          </View>
          
          <View style={styles.sectionContent}>
            {partnerWishlists.length === 0 ? (
              <Text style={styles.emptyText}>아직 위시리스트가 없어요</Text>
            ) : (
              partnerWishlists.map(item => (
                <WishlistCard 
                  key={item.id} 
                  item={item} 
                  onDelete={handleDeleteWishlist}
                  onPress={handleEditWishlist}
                  currentUserId={userId || undefined}
                />
              ))
            )}
          </View>
        </View>

        {/* 우리의 위시리스트 */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, styles.coupleSection]}>
            <View style={styles.sectionTitleRow}>
              <GradientHeart size={24} />
              <Text style={styles.sectionTitle}>우리의 위시리스트</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => openAddModal('COUPLE')}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.sectionContent}>
            {coupleWishlists.length === 0 ? (
              <Text style={styles.emptyText}>아직 위시리스트가 없어요</Text>
            ) : (
              coupleWishlists.map(item => (
                <WishlistCard 
                  key={item.id} 
                  item={item} 
                  onDelete={handleDeleteWishlist}
                  onPress={handleEditWishlist}
                  currentUserId={userId || undefined}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <AddWishlistModal
        visible={modalVisible}
        onClose={() => {
        setModalVisible(false);
        setEditingWishlist(null);
      }}
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
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 40,
  },
  content: {
    flex: 1,
  },
  
  // 섹션 스타일
  section: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 2,
  },
  mySection: {
    borderBottomColor: '#FFB088',
    backgroundColor: '#FFF5F0',
  },
  partnerSection: {
    borderBottomColor: '#6EC6FF',
    backgroundColor: '#F0F8FF',
  },
  coupleSection: {
    borderBottomColor: '#E8B4FF',
    backgroundColor: '#FFF5FB',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  redHeartIcon: {
    fontSize: 20,
    marginRight: 8,
    color: '#F58A7A',
  },
  blueHeartIcon: {
    fontSize: 20,
    marginRight: 8,
    color: '#6EC6FF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    fontWeight: '300',
    color: '#333',
  },
  sectionContent: {
    padding: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
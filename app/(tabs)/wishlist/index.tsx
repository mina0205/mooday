import AddWishlistModal from '@/components/AddWishlistModal';
import GradientHeart from '@/components/GradientHeart';
import WishlistCard from '@/components/WishlistCard';
import { OwnerType, WishlistItem } from '@/src/types/wishlist';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function WishlistScreen() {
  // 테스트용: 로컬 상태만 사용 (Supabase 없이)
  const userId = '84db1fe7-b978-43c1-b00c-28e67b282ea';
  const coupleId = null;
  
  const [wishlists, setWishlists] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddWishlist = async (
    title: string,
    energy: string,
    mood: string,
    ownerType: OwnerType
  ) => {
    try {
      // 로컬에만 추가 (Supabase 사용 안 함)
      const newWishlist: WishlistItem = {
        id: Date.now().toString(),
        couple_id: coupleId || '',
        owner_user_id: userId,
        owner_type: ownerType,
        title,
        energy,
        mood,
        created_at: new Date().toISOString(),
      };
      
      setWishlists([newWishlist, ...wishlists]);
      setModalVisible(false);
    } catch (error) {
      console.error('Error adding wishlist:', error);
    }
  };

  const handleDeleteWishlist = (id: string) => {
    try {
      // 로컬에서 즉시 삭제
      setWishlists(prevWishlists => prevWishlists.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting wishlist:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6EC6FF" />
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

      <FlatList
        data={wishlists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <WishlistCard item={item} onDelete={handleDeleteWishlist} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>아직 위시리스트가 없어요</Text>
            <Text style={styles.emptySubtext}>+ 버튼을 눌러 추가해보세요!</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <AddWishlistModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={handleAddWishlist}
        isCouple={coupleId !== null}
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
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6EC6FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: 'white',
    fontWeight: '300',
  },
});
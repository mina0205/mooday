import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WishlistItem } from '@/src/types/wishlist';
import GradientHeart from '@/components/GradientHeart';

interface WishlistCardProps {
  item: WishlistItem;
  onDelete: (id: string) => void;
  currentUserId?: string; // 현재 사용자 ID (선택적)
}

export default function WishlistCard({ item, onDelete, currentUserId }: WishlistCardProps) {
  const handleDelete = () => {
    onDelete(item.id);
  };

  // 하트 색깔 결정
  const renderHeart = () => {
    if (item.owner_type === 'COUPLE') {
      // 커플 공유 = 그라데이션 하트
      return <GradientHeart size={20} />;
    } else if (item.owner_user_id === currentUserId) {
      // 내가 추가한 것 = 붉은색 하트
      return (
        <View style={styles.heartContainer}>
          <Text style={styles.redHeart}>♥</Text>
        </View>
      );
    } else {
      // 상대방이 추가한 것 = 하늘색 하트
      return (
        <View style={styles.heartContainer}>
          <Text style={styles.blueHeart}>♥</Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          {renderHeart()}
          <Text style={styles.title}>{item.title}</Text>
        </View>
        
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Text style={styles.deleteIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {item.owner_type === 'COUPLE' ? '💑 커플 공유' : '👤 개인'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  heartContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  redHeart: {
    fontSize: 20,
    color: '#F58A7A',
  },
  blueHeart: {
    fontSize: 20,
    color: '#6EC6FF',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteIcon: {
    fontSize: 24,
    color: '#999',
  },
  footer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerText: {
    fontSize: 13,
    color: '#666',
  },
});
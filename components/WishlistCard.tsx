import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WishlistItem } from '@/src/types/wishlist';
import GradientHeart from '@/components/GradientHeart';

interface WishlistCardProps {
  item: WishlistItem;
  onDelete: (id: string) => void;
}

export default function WishlistCard({ item, onDelete }: WishlistCardProps) {
  const handleDelete = () => {
    // 바로 삭제
    onDelete(item.id);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <GradientHeart size={20} />
          <Text style={styles.title}>{item.title}</Text>
        </View>
        
        {/* X 버튼으로 삭제 */}
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Text style={styles.deleteIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* 세부 내역 제거 - 간단하게만 표시 */}
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
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { WishlistItem } from '@/src/types/wishlist';
import GradientHeart from '@/components/GradientHeart';

export interface WishlistCardProps {
  item: WishlistItem;
  onDelete: (id: string) => void;
  onPress?: (item: WishlistItem) => void; // ✅ 수정용
  currentUserId?: string;
}

export default function WishlistCard({
  item,
  onDelete,
  onPress,
  currentUserId,
}: WishlistCardProps) {
  const handleDelete = () => {
    onDelete(item.id);
  };

  // 삭제 가능 여부 
  const canDelete =
    item.owner_type === 'COUPLE' ||
    item.owner_user_id === currentUserId;

  // 하트 색깔
  const renderHeart = () => {
    if (item.owner_type === 'COUPLE') {
      return <GradientHeart size={20} />;
    }

    if (item.owner_user_id === currentUserId) {
      return <Text style={styles.redHeart}>♥</Text>;
    }

    return <Text style={styles.blueHeart}>♥</Text>;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress?.(item)} // ✅ 카드 클릭 → 수정
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            {renderHeart()}
            <Text style={styles.title}>{item.title}</Text>
          </View>

          {canDelete && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {item.owner_type === 'COUPLE' ? '💑 커플' : '👤 개인'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
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

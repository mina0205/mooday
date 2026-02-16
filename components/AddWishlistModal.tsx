import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { OwnerType, WishlistItem } from '@/src/types/wishlist';
import { analyzeWishlist } from '@/services/analyzeWishlist';

interface Props {
  visible: boolean;
  onClose: () => void;

  /** ⭐ 핵심: 부모에서 내려주는 콜백 */
  onAdd?: (
    title: string,
    energy: string,
    energyScore: number,
    energySource: string,
    mood: string,
    ownerType: OwnerType
  ) => void;

  onUpdate?: (
    id: string,
    title: string,
    energy: string,
    energyScore: number,
    energySource: string,
    mood: string
  ) => void;

  isCouple: boolean;
  mode: 'create' | 'edit';
  initialItem?: WishlistItem;
}

export default function AddWishlistModal({
  visible,
  onClose,
  onAdd,
  onUpdate,
  isCouple,
  mode,
  initialItem,
}: Props) {
  const [wishText, setWishText] = useState('');

  /* =========================
   * edit 모드 초기값
   * ========================= */
  useEffect(() => {
    if (mode === 'edit' && initialItem) {
      setWishText(initialItem.title);
    } else {
      setWishText('');
    }
  }, [mode, initialItem]);

  /* =========================
   * submit
   * ========================= */
  const handleSubmit = async () => {
    const trimmed = wishText.trim();
    if (!trimmed) {
      Alert.alert('알림', '데이트 위시를 입력해주세요.');
      return;
    }

    try {
      const analyzed = await analyzeWishlist(trimmed);

      if (mode === 'create') {
        onAdd?.(
          analyzed.title,
          analyzed.energy,
          analyzed.energy_score,
          analyzed.energy_source,
          analyzed.mood,
          isCouple ? 'COUPLE' : 'PERSONAL'
        );
      }

      if (mode === 'edit' && initialItem) {
        onUpdate?.(
          initialItem.id,          // ⭐ 기존 ID 유지
          analyzed.title,
          analyzed.energy,
          analyzed.energy_score,
          analyzed.energy_source,
          analyzed.mood
        );
      }

      setWishText('');
      onClose();
    } catch (e) {
      console.error('❌ 위시 분석 실패:', e);
      Alert.alert('오류', '위시 처리에 실패했어요.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {mode === 'edit'
                ? '위시 수정하기'
                : isCouple
                ? '우리의 위시 추가'
                : '내 위시 추가'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            <TextInput
              style={styles.textArea}
              placeholder="데이트 위시를 입력해주세요"
              value={wishText}
              onChangeText={setWishText}
              multiline
              autoFocus
            />
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.addText}>
                {mode === 'edit' ? '수정' : '추가'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* =========================
 * styles
 * ========================= */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '70%',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    fontSize: 28,
    color: '#999',
  },
  content: {
    padding: 20,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
  },
  footer: {
    padding: 20,
  },
  button: {
    backgroundColor: '#6EC6FF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addText: {
    fontWeight: '600',
    color: 'white',
  },
});

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

interface AddWishlistModalProps {
  visible: boolean;
  onClose: () => void;

  // create
  onAdd?: (
    title: string,
    energy: string,
    energyScore: number,
    energySource: string,
    mood: string,
    ownerType: OwnerType
  ) => void;

  // edit
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
}: AddWishlistModalProps) {
  const [wishText, setWishText] = useState('');

  useEffect(() => {
    if (mode === 'edit' && initialItem) {
      setWishText(initialItem.title);
    }
  }, [mode, initialItem]);

  const handleSubmit = () => {
    const trimmed = wishText.trim();
    if (!trimmed) {
      Alert.alert('알림', '데이트 위시를 입력해주세요.');
      return;
    }

    const analyzed = analyzeWishlist(trimmed);

    if (mode === 'create') {
      if (!onAdd) return;
      const ownerType: OwnerType = isCouple ? 'COUPLE' : 'PERSONAL';

      onAdd(
        analyzed.title,
        analyzed.energy,
        analyzed.energy_score,
        analyzed.energy_source,
        analyzed.mood,
        ownerType
      );
    } else {
      if (!onUpdate || !initialItem) return;

      onUpdate(
        initialItem.id,
        analyzed.title,
        analyzed.energy,
        analyzed.energy_score,
        analyzed.energy_source,
        analyzed.mood
      );
    }

    setWishText('');
  };

  const handleClose = () => {
    setWishText('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {mode === 'edit'
                ? '위시 수정하기'
                : isCouple
                ? '우리의 위시 추가'
                : '내 위시 추가'}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

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

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.addButton]}
              onPress={handleSubmit}
            >
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
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#eee',
  },
  cancelText: {
    fontWeight: '600',
    color: '#666',
  },
  addButton: {
    backgroundColor: '#6EC6FF',
  },
  addText: {
    fontWeight: '600',
    color: 'white',
  },
});

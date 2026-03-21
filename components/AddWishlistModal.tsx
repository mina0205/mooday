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

interface Props {
  visible: boolean;
  onClose: () => void;
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
  initialItem?: WishlistItem | null;
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

  useEffect(() => {
    if (mode === 'edit' && initialItem) {
      setWishText(initialItem.title);
    } else {
      setWishText('');
    }
  }, [mode, initialItem]);

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
          initialItem.id,
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

  const handleClose = () => {
    setWishText('');
    onClose();
  };

  const accentColor = isCouple ? COLORS.COUPLE : COLORS.MY;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalBackdrop}>
        <ScrollView
          style={styles.modalScroll}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.modalScrollContent}
        >
          <View style={styles.modalBox}>

            {/* 타이틀 */}
            <Text style={styles.modalTitle}>
              {mode === 'edit'
                ? '위시 수정'
                : isCouple
                ? '커플 위시 추가'
                : '내 위시 추가'}
            </Text>

            {/* 타입 표시 */}
            <Text style={styles.modalLabel}>위시 타입</Text>
            <View style={styles.typeRow}>
              <View
                style={[
                  styles.typeBtn,
                  !isCouple && { backgroundColor: COLORS.MY },
                ]}
              >
                <Text
                  style={[
                    styles.typeBtnText,
                    !isCouple && { color: '#000' },
                  ]}
                >
                  개인
                </Text>
              </View>
              <View
                style={[
                  styles.typeBtn,
                  isCouple && { backgroundColor: COLORS.COUPLE },
                ]}
              >
                <Text
                  style={[
                    styles.typeBtnText,
                    isCouple && { color: '#fff' },
                  ]}
                >
                  커플
                </Text>
              </View>
            </View>

            {/* 위시 입력 */}
            <Text style={styles.modalLabel}>
              데이트 위시 <Text style={{ color: '#FF6B6B' }}>*</Text>
            </Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="하고 싶은 데이트를 입력해주세요"
              placeholderTextColor="#555"
              value={wishText}
              onChangeText={setWishText}
              multiline
              autoFocus
              textAlignVertical="top"
            />

            {/* 버튼 */}
            <View style={styles.modalBtns}>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.cancelBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                style={[styles.saveBtn, { backgroundColor: accentColor }]}
                activeOpacity={0.85}
              >
                <Text style={styles.saveBtnText}>
                  {mode === 'edit' ? '수정' : '추가'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: COLORS.CARD,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 60,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderBottomWidth: 0,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.TEXT,
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.SUBTEXT,
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.BORDER,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  typeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.SUBTEXT,
  },
  modalInput: {
    backgroundColor: COLORS.BORDER,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: COLORS.TEXT,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.BORDER,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.SUBTEXT,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
});

import React, { useState, useEffect } from 'react';
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
import { OwnerType } from '@/src/types/wishlist';
import { analyzeWishlist } from '@/services/wishlistAnalyzer';

interface AddWishlistModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string, energy: string, mood: string, ownerType: OwnerType) => void;
  isCouple: boolean;
}

export default function AddWishlistModal({ visible, onClose, onAdd, isCouple }: AddWishlistModalProps) {
  const [wishText, setWishText] = useState('');
  const [ownerType, setOwnerType] = useState<OwnerType>('PERSONAL');
  
  // AI 분석 결과 (실시간)
  const [analyzedData, setAnalyzedData] = useState({
    title: '',
    energy: '중간',
    mood: '행복',
    originalText: '',
  });

  // 텍스트 입력 시 실시간으로 AI 분석
  useEffect(() => {
    if (wishText.trim()) {
      const result = analyzeWishlist(wishText);
      setAnalyzedData(result);
    } else {
      setAnalyzedData({
        title: '',
        energy: '중간',
        mood: '행복',
        originalText: '',
      });
    }
  }, [wishText]);

  const handleSubmit = () => {
    if (!wishText.trim()) {
      Alert.alert('알림', '데이트 위시를 입력해주세요.');
      return;
    }

    // AI 분석된 결과로 추가
    onAdd(
      analyzedData.title,
      analyzedData.energy,
      analyzedData.mood,
      ownerType
    );
    
    // 초기화
    setWishText('');
    setOwnerType('PERSONAL');
  };

  const handleClose = () => {
    setWishText('');
    setOwnerType('PERSONAL');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>새 위시리스트 추가</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.label}>어떤 데이트를 하고 싶으세요?</Text>
            <TextInput
              style={styles.textArea}
              placeholder="예: 롯데월드 가고 싶어!&#10;조용한 카페에서 수다 떨고 싶다&#10;한강에서 피크닉"
              placeholderTextColor="#aaa"
              value={wishText}
              onChangeText={setWishText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />



            {isCouple && (
              <>
                <Text style={styles.label}>유형</Text>
                <View style={styles.ownerTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.ownerTypeButton,
                      ownerType === 'PERSONAL' && styles.ownerTypeButtonActive,
                    ]}
                    onPress={() => setOwnerType('PERSONAL')}
                  >
                    <Text
                      style={[
                        styles.ownerTypeText,
                        ownerType === 'PERSONAL' && styles.ownerTypeTextActive,
                      ]}
                    >
                      개인
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.ownerTypeButton,
                      ownerType === 'COUPLE' && styles.ownerTypeButtonActive,
                    ]}
                    onPress={() => setOwnerType('COUPLE')}
                  >
                    <Text
                      style={[
                        styles.ownerTypeText,
                        ownerType === 'COUPLE' && styles.ownerTypeTextActive,
                      ]}
                    >
                      커플 공유
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.addButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.addButtonText}>추가</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    fontSize: 28,
    color: '#999',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    minHeight: 120,
    maxHeight: 200,
  },
  
  ownerTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  ownerTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  ownerTypeButtonActive: {
    borderColor: '#6EC6FF',
    backgroundColor: '#E6F5FF',
  },
  ownerTypeText: {
    fontSize: 16,
    color: '#666',
  },
  ownerTypeTextActive: {
    color: '#6EC6FF',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  addButton: {
    backgroundColor: '#6EC6FF',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
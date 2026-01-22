import React, { useState } from 'react';
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
  isCouple: boolean; // true면 COUPLE, false면 PERSONAL
}

export default function AddWishlistModal({ visible, onClose, onAdd, isCouple }: AddWishlistModalProps) {
  const [wishText, setWishText] = useState('');

  const handleSubmit = () => {
    console.log('🔵 handleSubmit 호출됨!');
    console.log('📝 입력된 텍스트:', wishText);
    
    // 입력값 체크
    const trimmedText = wishText.trim();
    
    if (!trimmedText) {
      console.log('❌ 빈 값입니다');
      Alert.alert('알림', '데이트 위시를 입력해주세요.');
      return;
    }

    console.log('✅ 텍스트 있음, AI 분석 시작...');

    try {
      // AI 분석
      const analyzed = analyzeWishlist(trimmedText);
      console.log('📊 AI 분석 완료:', analyzed);
      
      // isCouple에 따라 자동으로 owner_type 결정
      const ownerType: OwnerType = isCouple ? 'COUPLE' : 'PERSONAL';
      
      console.log('🚀 onAdd 함수 호출 시작...');
      console.log('전달할 데이터:', {
        title: analyzed.title,
        energy: analyzed.energy,
        mood: analyzed.mood,
        ownerType: ownerType
      });
      
      // 분석 결과로 추가
      onAdd(
        analyzed.title,
        analyzed.energy,
        analyzed.mood,
        ownerType
      );
      
      console.log('✅ onAdd 함수 호출 완료');
      
      // 초기화
      setWishText('');
      
    } catch (error) {
      console.error('🚨 에러 발생:', error);
      Alert.alert('오류', '분석 중 오류가 발생했습니다: ' + error);
    }
  };

  const handleClose = () => {
    console.log('❌ 모달 닫기');
    setWishText('');
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
            <Text style={styles.headerTitle}>
              {isCouple ? '우리의 위시 추가' : '내 위시 추가'}
            </Text>
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
              onChangeText={(text) => {
                console.log('⌨️ 텍스트 입력:', text);
                setWishText(text);
              }}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              autoFocus
            />
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
              onPress={() => {
                console.log('🔘 추가 버튼 클릭됨!');
                handleSubmit();
              }}
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
    maxHeight: '70%',
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
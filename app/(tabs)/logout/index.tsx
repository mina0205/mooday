import { View, Text, TouchableOpacity, Alert, StyleSheet, TextInput, Modal, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/src/lib/supabase';
import MenuButton from '@/components/MenuButton';
import { useAuthCouple } from '@/src/context/AuthCoupleContext';

export default function SettingsPage() {
  const router = useRouter();

  const [nickname, setNickname] = useState('');
  const [newNickname, setNewNickname] = useState('');

  const { refreshAll } = useAuthCouple();

  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nicknameLoading, setNicknameLoading] = useState(false);

  useEffect(() => {
    async function fetchNickname() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('user_profiles')
        .select('nickname')
        .eq('id', user.id)
        .single();
      if (data) setNickname(data.nickname);
    }
    fetchNickname();
  }, []);

  const handleLogout = async () => {
    Alert.alert('로그아웃', '정말 로그아웃 할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        onPress: async () => {
          const { error } = await supabase.auth.signOut();
          if (error) { Alert.alert('로그아웃 실패', error.message); return; }
          router.replace('/login');
        },
      },
    ]);
  };

  const handleNicknameChange = async () => {
    if (!newNickname.trim()) {
      Alert.alert('별명을 입력해주세요!');
      return;
    }
    setNicknameLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_profiles')
      .update({ nickname: newNickname.trim() })
      .eq('id', user.id);

    if (error) {
      Alert.alert('변경 실패', error.message);
    } else {
      await refreshAll();
      setNickname(newNickname.trim());
      setNewNickname('');
      setShowNicknameModal(false);
      Alert.alert('별명이 변경되었어요 🎉');
    }
    setNicknameLoading(false);
  };

  const handleWithdraw = () => {
    Alert.alert(
      '회원 탈퇴',
      '탈퇴하면 커플 관계가 해제되고\n모든 데이터가 삭제됩니다.\n\n이 작업은 되돌릴 수 없어요.',
      [
        { text: '취소', style: 'cancel' },
        { text: '탈퇴', style: 'destructive', onPress: confirmWithdraw },
      ]
    );
  };

  const confirmWithdraw = async () => {
    try {
      const { error: rpcError } = await supabase.rpc('withdraw_user');
      if (rpcError) { Alert.alert('탈퇴 실패', '탈퇴 처리 중 오류가 발생했어요.'); return; }
      await supabase.auth.signOut();
      Alert.alert('탈퇴 완료', '계정이 정상적으로 탈퇴되었습니다.', [
        { text: '확인', onPress: () => router.replace('/login') },
      ]);
    } catch (e) {
      Alert.alert('오류', '예기치 못한 문제가 발생했어요.');
    }
  };

  return (
    <View style={styles.container}>
      <MenuButton />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>⚙️</Text>
          <Text style={styles.headerTitle}>설정</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarEmoji}>🩷</Text>
          </View>
          <View>
            <Text style={styles.profileName}>{nickname || '...'}</Text>
            <Text style={styles.profileSub}>내 별명</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>계정</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => { setNewNickname(''); setShowNicknameModal(true); }}
            activeOpacity={0.7}
          >
            <Text style={styles.menuEmoji}>✏️</Text>
            <Text style={styles.menuText}>별명 변경</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout} activeOpacity={0.7}>
            <Text style={styles.menuEmoji}>🚪</Text>
            <Text style={styles.menuText}>로그아웃</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={handleWithdraw} activeOpacity={0.7}>
            <Text style={styles.menuEmoji}>💔</Text>
            <Text style={[styles.menuText, { color: '#F58A7A' }]}>회원 탈퇴</Text>
            <Text style={[styles.menuArrow, { color: '#F58A7A' }]}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showNicknameModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>별명 변경</Text>
            <Text style={styles.modalSub}>현재: {nickname}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="새 별명 입력"
              placeholderTextColor="#888"
              value={newNickname}
              onChangeText={setNewNickname}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowNicknameModal(false)}
              >
                <Text style={styles.modalCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, nicknameLoading && { opacity: 0.7 }]}
                onPress={handleNicknameChange}
                disabled={nicknameLoading}
              >
                <Text style={styles.modalConfirmText}>
                  {nicknameLoading ? '변경 중...' : '변경'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scroll: { flex: 1 },
  inner: { paddingHorizontal: 24, paddingTop: 70, paddingBottom: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 28,
  },
  headerEmoji: { fontSize: 28 },
  headerTitle: {
    fontSize: 28, fontWeight: '900',
    color: '#FFFFFF', letterSpacing: -0.5,
  },
  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1a1a1a', borderRadius: 20,
    padding: 20, marginBottom: 28, gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 4,
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  profileAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#3a3a3a',
  },
  profileAvatarEmoji: { fontSize: 28 },
  profileName: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  profileSub: { fontSize: 13, color: '#888', marginTop: 2 },
  sectionLabel: {
    fontSize: 13, fontWeight: '700',
    color: '#666', marginBottom: 10,
    marginLeft: 4, letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: '#1a1a1a', borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1, borderColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 3,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 18, gap: 14,
  },
  menuEmoji: { fontSize: 20 },
  menuText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  menuArrow: { fontSize: 20, color: '#555', fontWeight: '300' },
  menuDivider: { height: 1, backgroundColor: '#2a2a2a', marginHorizontal: 20 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center', padding: 32,
  },
  modalBox: {
    backgroundColor: '#1a1a1a', borderRadius: 24,
    padding: 28, width: '100%',
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 6 },
  modalSub: { fontSize: 14, color: '#888', marginBottom: 20 },
  modalInput: {
    backgroundColor: '#2a2a2a', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: '#FFFFFF',
    borderWidth: 1.5, borderColor: '#3a3a3a', marginBottom: 20,
  },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#3a3a3a',
  },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: '#888' },
  modalConfirmBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    alignItems: 'center', backgroundColor: '#F58A7A',
  },
  modalConfirmText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
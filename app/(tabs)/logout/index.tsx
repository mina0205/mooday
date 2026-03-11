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

 /* 로그아웃 처리 */
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

  /* 별명 변경 처리 */
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
      await refreshAll(); //별명 ui 바로 적용 
      setNickname(newNickname.trim());
      setNewNickname('');
      setShowNicknameModal(false);
      Alert.alert('별명이 변경되었어요 🎉');
    }
    setNicknameLoading(false);
  };

  /* 회원 탈퇴 처리 */
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
      {/* 배경 장식 */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      {/* 메뉴 버튼 */}
      <MenuButton />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.inner}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>⚙️</Text>
          <Text style={styles.headerTitle}>설정</Text>
        </View>

        {/* 프로필 카드 */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarEmoji}>🩷</Text>
          </View>
          <View>
            <Text style={styles.profileName}>{nickname || '...'}</Text>
            <Text style={styles.profileSub}>내 별명</Text>
          </View>
        </View>

        {/* 계정 섹션 */}
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

      {/* 별명 변경 모달 */}
      <Modal visible={showNicknameModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>별명 변경</Text>
            <Text style={styles.modalSub}>현재: {nickname}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="새 별명 입력"
              placeholderTextColor="#bbb"
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
  container: { flex: 1, backgroundColor: '#FFF8FA' },
  bgCircle1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: '#6EC6FF', opacity: 0.08, top: -80, right: -80,
  },
  bgCircle2: {
    position: 'absolute', width: 250, height: 250, borderRadius: 125,
    backgroundColor: '#F58A7A', opacity: 0.08, bottom: -60, left: -60,
  },
  scroll: { flex: 1 },
  inner: { paddingHorizontal: 24, paddingTop: 70, paddingBottom: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 28,
  },
  headerEmoji: { fontSize: 28 },
  headerTitle: {
    fontSize: 28, fontWeight: '900',
    color: '#333', letterSpacing: -0.5,
  },
  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 20,
    padding: 20, marginBottom: 28, gap: 16,
    shadowColor: '#F58A7A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  profileAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#FFF0F3',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FFD6E0',
  },
  profileAvatarEmoji: { fontSize: 28 },
  profileName: { fontSize: 20, fontWeight: '800', color: '#333' },
  profileSub: { fontSize: 13, color: '#aaa', marginTop: 2 },
  sectionLabel: {
    fontSize: 13, fontWeight: '700',
    color: '#aaa', marginBottom: 10,
    marginLeft: 4, letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: '#fff', borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#F58A7A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 18, gap: 14,
  },
  menuEmoji: { fontSize: 20 },
  menuText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#333' },
  menuArrow: { fontSize: 20, color: '#ccc', fontWeight: '300' },
  menuDivider: { height: 1, backgroundColor: '#F5F5F5', marginHorizontal: 20 },
  // 모달
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center', padding: 32,
  },
  modalBox: {
    backgroundColor: '#fff', borderRadius: 24,
    padding: 28, width: '100%',
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#333', marginBottom: 6 },
  modalSub: { fontSize: 14, color: '#aaa', marginBottom: 20 },
  modalInput: {
    backgroundColor: '#FFF3F5', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: '#333',
    borderWidth: 1.5, borderColor: '#FFD6E0', marginBottom: 20,
  },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#ddd',
  },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: '#aaa' },
  modalConfirmBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    alignItems: 'center', backgroundColor: '#F58A7A',
  },
  modalConfirmText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
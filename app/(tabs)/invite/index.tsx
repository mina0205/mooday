import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useState,useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

export default function InvitePage() {
  const [user, setUser] = useState<any>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasCouple, setHasCouple] = useState(false);


  useEffect(() => {
  const loadUserAndCouple = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setLoading(false);
      return;
    }

    setUser(session.user);

    const { data } = await supabase
      .from('couple_members')
      .select('couple_id')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (data?.couple_id) {
      setHasCouple(true);
    }

    setLoading(false);
  };

  loadUserAndCouple();
}, []);


  const handleCopyInviteCode = async () => {
      if (!inviteCode) return;

      await Clipboard.setStringAsync(inviteCode);
      Alert.alert('초대 코드가 복사됐어요!');
    };

  const handleCreateInviteCode = async () => {

    if (loading) return;
    setLoading(true);

    try {
      /* 1️⃣ 로그인 유저 확인 */
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      console.log('🔥 USER:', user);
      console.log('🔥 USER ID:', user?.id);

      if (userError || !user) {
        Alert.alert('로그인이 필요합니다');
        return;
      }

      /* 3️⃣ 초대 코드 생성  -> 📍중복 가능성있어서 추후 개선 필요 */
      const newInviteCode = Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase();

      /* 4️⃣ 커플 및 멤버 생성(insert) - RPC 함수 사용 */ 
      const { data, error } = await supabase.rpc(
        'create_couple_with_owner',
        {
          p_invite_code: newInviteCode,
          p_start_date: new Date().toISOString().slice(0, 10),
        }
      );

      if (error) {
        console.error(error);

        // DB unique 제약 위반 = 이미 커플
         if (error.code === '23505') {
          Alert.alert('이미 커플이 연결되어 있어요');
        } else {
          Alert.alert('커플 생성에 실패했어요');
        }

      } 
    }finally {
        setLoading(false);
      }
    };

   /* 세션 로딩 중 */
  if (loading) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>커플 초대</Text>

      {/* 초대 코드 표시 영역 */}
    <TouchableOpacity onPress={handleCopyInviteCode} activeOpacity={0.7}>
      <View style={styles.codeBox}>
        <Text style={styles.codeText}>
          {inviteCode ?? '아직 초대 코드가 없어요'}
        </Text>
      </View>
    </TouchableOpacity>

      {/* 초대 코드 생성 */}
      <TouchableOpacity
        style={[
          styles.primaryButton,
          (loading || hasCouple) && { opacity: 0.5 },
        ]}
        onPress={handleCreateInviteCode}
        disabled={loading || hasCouple}
      >
        <Text style={styles.primaryText}>
          {hasCouple
            ? '이미 커플이 연결되어 있어요'
            : loading
            ? '생성 중...'
            : '초대 코드 생성하기'}
        </Text>
      </TouchableOpacity>

       {/* 구분선 */}
      <View style={styles.divider} />

      {/* 초대 코드 입력 페이지로 이동 */}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push('/invite/input')}
      >
        <Text style={styles.secondaryText}>
         초대 코드 입력하기 →
        </Text>
      </TouchableOpacity>

    </View>
  );
}

/* ---------------- styles ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  },
  codeBox: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingVertical: 20,
    marginBottom: 24,
  },
  codeText: {
    color: '#5DA9FF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
  },
  primaryButton: {
    backgroundColor: '#5DA9FF',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  primaryText: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#222',
    marginVertical: 24,
  },
  secondaryText: {
    color: '#aaa',
    textAlign: 'center',
  },
});

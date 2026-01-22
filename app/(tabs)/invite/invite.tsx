import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { router } from 'expo-router';

export default function InvitePage() {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateInviteCode = async () => {
    if (loading) return;
    setLoading(true);

    try {
      /* 1️⃣ 로그인 유저 확인 */
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert('로그인이 필요합니다');
        return;
      }

      /* 2️⃣ 이미 커플인지 체크 */
      const { data: existingMember } = await supabase
        .from('couple_members')
        .select('couple_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingMember) {
        Alert.alert('이미 커플이 연결되어 있어요');
        return;
      }

      /* 3️⃣ 초대 코드 생성 */
      const newInviteCode = Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase();

      /* 4️⃣ couples 생성 */
      const { data: couple, error: coupleError } = await supabase
        .from('couples')
        .insert({
          invite_code: newInviteCode,
          relationship_start_date: new Date()
            .toISOString()
            .slice(0, 10),
        })
        .select()
        .single();

      if (coupleError || !couple) {
        console.error(coupleError);
        Alert.alert('커플 생성에 실패했어요');
        return;
      }

      /* 5️⃣ couple_members에 나 자신 추가 */
      const { error: memberError } = await supabase
        .from('couple_members')
        .insert({
          couple_id: couple.id,
          user_id: user.id,
        });

      if (memberError) {
        console.error(memberError);
        Alert.alert('커플 연결에 실패했어요');
        return;
      }

      setInviteCode(newInviteCode);
      Alert.alert('초대 코드가 생성됐어요!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>커플 초대</Text>

      {/* 초대 코드 표시 영역 */}
      <View style={styles.codeBox}>
        <Text style={styles.codeText}>
          {inviteCode ?? '아직 초대 코드가 없어요'}
        </Text>
      </View>

      {/* 초대 코드 생성 */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleCreateInviteCode}
        disabled={loading}
      >
        <Text style={styles.primaryText}>
          {loading ? '생성 중...' : '초대 코드 생성하기'}
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
  secondaryText: {
    color: '#aaa',
    textAlign: 'center',
  },
});

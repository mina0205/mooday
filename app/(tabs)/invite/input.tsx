import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { router } from 'expo-router';

export default function InviteInputPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!code.trim() || loading) return;

    setLoading(true);

    // 1️⃣ 로그인 유저 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert('로그인이 필요합니다');
      setLoading(false);
      return;
    }

    // 2️⃣ RPC 호출 (초대 코드로 커플 합류)
    const { error } = await supabase.rpc(
      'join_couple_by_invite_code',
      {
        p_invite_code: code.toUpperCase(),
      }
    );

    if (error) {
      console.error(error);

      //  RPC에서 던진 에러 메시지 기준 분기
      if (error.message.includes('already in couple')) {
        Alert.alert('이미 커플에 속해 있어요');
      } else if (error.message.includes('invalid invite code')) {
        Alert.alert('유효하지 않은 초대 코드입니다');
      } else {
        Alert.alert('커플 연결에 실패했어요');
      }

      setLoading(false);
      return;
    }

    // 3️⃣ 성공
    Alert.alert('커플 연결 완료 ❤️');
    router.replace('/calendar');

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>초대 코드 입력</Text>

      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="초대 코드를 입력하세요"
        placeholderTextColor="#666"
        autoCapitalize="characters"
        style={styles.input}
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
        onPress={submit}
        disabled={loading}
      >
        <Text style={styles.primaryText}>
          {loading ? '연결 중...' : '연결하기'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#333',
    color: '#fff',
    paddingVertical: 8,
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 2,
  },
  primaryBtn: {
    backgroundColor: '#5DA9FF',
    paddingVertical: 14,
    borderRadius: 8,
  },
  primaryText: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

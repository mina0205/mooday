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
    if (!code.trim()) return;

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // 1️⃣ 이미 커플인지 확인
    const { data: member } = await supabase
      .from('couple_members')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (member) {
      Alert.alert('이미 커플에 속해 있습니다');
      setLoading(false);
      return;
    }

    // 2️⃣ 초대 코드로 커플 찾기
    const { data: couple, error } = await supabase
      .from('couples')
      .select('id')
      .eq('invite_code', code.toUpperCase())
      .single();

    if (error || !couple) {
      Alert.alert('유효하지 않은 초대 코드입니다');
      setLoading(false);
      return;
    }

    // 3️⃣ 커플 합류
    await supabase.from('couple_members').insert({
      couple_id: couple.id,
      user_id: user.id,
    });

    Alert.alert('커플 연결 완료 🎉');
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
      />

      <TouchableOpacity style={styles.primaryBtn} onPress={submit}>
        <Text style={styles.primaryText}>
          {loading ? '연결 중...' : '연결하기'}
        </Text>
      </TouchableOpacity>

      {/* 구분선 */}
      <View style={styles.divider} />

      {/* 초대 코드 생성으로 이동 */}
      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => router.push('/invite/invite')}
      >
        <Text style={styles.secondaryText}>
         초대 코드 생성하기 →
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
  divider: {
    height: 1,
    backgroundColor: '#222',
    marginVertical: 24,
  },
  secondaryBtn: {
    paddingVertical: 10,
  },
  secondaryText: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
  },
});

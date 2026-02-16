import { View, Text, TextInput, TouchableOpacity, 
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function SignupScreen() {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const signUp = async () => {
    if (!nickname.trim()) {
      alert('별명을 입력해주세요!');
      return;
    }
    if (!email.trim()) {
      alert('이메일을 입력해주세요!');
      return;
    }
    if (password.length < 6) {
      alert('비밀번호는 6자 이상이어야 해요!');
      return;
    }
    if (password !== passwordConfirm) {
      alert('비밀번호가 일치하지 않아요 🥲');
      return;
    }

    setLoading(true);

    // 1. 회원가입
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    // 2. user_profiles에 닉네임 저장
    const userId = data.user?.id;
    if (userId) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({ id: userId, nickname: nickname.trim() });

      if (profileError) {
        alert('프로필 저장 실패: ' + profileError.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    alert('회원가입이 완료되었습니다 🎉');
    router.replace('/(tabs)/calendar');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 배경 장식 원 */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">

        {/* 헤더 */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← 뒤로</Text>
        </TouchableOpacity>

        {/* 로고 */}
        <View style={styles.logoArea}>
          <Text style={styles.logoEmoji}>🩷</Text>
          <Text style={styles.logoTitle}>MOODAY</Text>
          <Text style={styles.logoSub}>함께할 준비가 됐나요? 🩷</Text>
        </View>

        {/* 카드 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>회원가입</Text>

          <Text style={styles.label}>별명</Text>
          <TextInput
            placeholder="나만의 별명을 입력해주세요"
            placeholderTextColor="#bbb"
            value={nickname}
            onChangeText={setNickname}
            style={styles.input}
          />

          <Text style={styles.label}>이메일</Text>
          <TextInput
            placeholder="이메일을 입력해주세요"
            placeholderTextColor="#bbb"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />

          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            placeholder="6자 이상 입력해주세요"
            placeholderTextColor="#bbb"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          <Text style={styles.label}>비밀번호 재확인</Text>
          <TextInput
            placeholder="비밀번호를 한 번 더 입력해주세요"
            placeholderTextColor="#bbb"
            secureTextEntry
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            style={[
              styles.input,
              passwordConfirm.length > 0 && {
                borderColor: password === passwordConfirm ? '#6EC6FF' : '#F58A7A',
              },
            ]}
          />
          {passwordConfirm.length > 0 && (
            <Text style={{
              fontSize: 12,
              color: password === passwordConfirm ? '#6EC6FF' : '#F58A7A',
              marginTop: -8,
              marginBottom: 12,
              marginLeft: 4,
            }}>
              {password === passwordConfirm ? '✓ 비밀번호가 일치해요!' : '✗ 비밀번호가 일치하지 않아요'}
            </Text>
          )}

          {/* 완료 버튼 */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={signUp}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.submitBtnText}>
              {loading ? '가입 중...' : '완료'}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8FA',
  },
  bgCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#6EC6FF',
    opacity: 0.12,
    top: -80,
    right: -80,
  },
  bgCircle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#F58A7A',
    opacity: 0.12,
    bottom: -60,
    left: -60,
  },
  inner: {
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backBtn: {
    marginBottom: 16,
  },
  backBtnText: {
    color: '#6EC6FF',
    fontSize: 15,
    fontWeight: '600',
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 28,
    gap: 8,
  },
  logoEmoji: {
    fontSize: 52,
  },
  logoTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#F58A7A',
    letterSpacing: 6,
    marginTop: 6,
  },
  logoSub: {
    fontSize: 14,
    color: '#aaa',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#F58A7A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    backgroundColor: '#FFF3F5',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#333',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#FFD6E0',
  },
  submitBtn: {
    backgroundColor: '#F58A7A',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#F58A7A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
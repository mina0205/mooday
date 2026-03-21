import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

const COLORS = {
  MY: '#FF9EAA',
  PARTNER: '#FF9EAA',
  COUPLE: '#C77DFF',
  BG: '#000000',
  CARD: '#1a1a1a',
  BORDER: '#2a2a2a',
  TEXT: '#FFFFFF',
  SUBTEXT: '#888888',
};

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
      alert('비밀번호가 일치하지 않아요');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

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
    alert('회원가입이 완료되었습니다!');
    router.replace('/(tabs)/calendar');
  };

  const passwordMatch = password === passwordConfirm;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 배경 글로우 */}
      <View style={styles.bgGlow1} />
      <View style={styles.bgGlow2} />

      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 뒤로가기 */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>‹ 뒤로</Text>
        </TouchableOpacity>

        {/* 로고 */}
        <View style={styles.logoArea}>
          <Text style={styles.logoTitle}>MOODAY</Text>
          <Text style={styles.logoSub}>회원가입을 해주세요</Text>
        </View>

        {/* 카드 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>회원가입</Text>

          <Text style={styles.label}>
            별명 <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            placeholder="나만의 별명을 입력해주세요"
            placeholderTextColor="#555"
            value={nickname}
            onChangeText={setNickname}
            style={styles.input}
          />

          <Text style={styles.label}>
            이메일 <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            placeholder="이메일을 입력해주세요"
            placeholderTextColor="#555"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />

          <Text style={styles.label}>
            비밀번호 <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            placeholder="6자 이상 입력해주세요"
            placeholderTextColor="#555"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          <Text style={styles.label}>
            비밀번호 재확인 <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            placeholder="비밀번호를 한 번 더 입력해주세요"
            placeholderTextColor="#555"
            secureTextEntry
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            style={[
              styles.input,
              passwordConfirm.length > 0 && {
                borderColor: passwordMatch ? COLORS.MY : COLORS.PARTNER,
              },
            ]}
          />
          {passwordConfirm.length > 0 && (
            <Text
              style={[
                styles.matchText,
                { color: passwordMatch ? COLORS.MY : COLORS.PARTNER },
              ]}
            >
              {passwordMatch
                ? '✓ 비밀번호가 일치해요!'
                : '✗ 비밀번호가 일치하지 않아요'}
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
    backgroundColor: COLORS.BG,
  },
  bgGlow1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.COUPLE,
    opacity: 0.06,
    top: -80,
    right: -80,
  },
  bgGlow2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: COLORS.MY,
    opacity: 0.06,
    bottom: -60,
    left: -60,
  },
  inner: {
    paddingHorizontal: 28,
    paddingTop: 70,
    paddingBottom: 40,
  },
  backBtn: {
    marginBottom: 16,
  },
  backBtnText: {
    color: COLORS.MY,
    fontSize: 16,
    fontWeight: '600',
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 28,
    gap: 8,
  },
  logoTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.MY,
    letterSpacing: 6,
    marginTop: 6,
  },
  logoSub: {
    fontSize: 14,
    color: COLORS.SUBTEXT,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: COLORS.CARD,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.TEXT,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.SUBTEXT,
    marginBottom: 8,
    marginLeft: 2,
  },
  required: {
    color: '#FF6B6B',
  },
  input: {
    backgroundColor: COLORS.BORDER,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.TEXT,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  matchText: {
    fontSize: 12,
    marginTop: -10,
    marginBottom: 16,
    marginLeft: 4,
  },
  submitBtn: {
    backgroundColor: COLORS.MY,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.MY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  submitBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

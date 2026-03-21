import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

const COLORS = {
  MY: '#6EC6FF',
  PARTNER: '#FF9EAA',
  COUPLE: '#C77DFF',
  BG: '#000000',
  CARD: '#1a1a1a',
  BORDER: '#2a2a2a',
  TEXT: '#FFFFFF',
  SUBTEXT: '#888888',
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const signIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 배경 장식 - 다크 테마용 미묘한 글로우 */}
      <View style={styles.bgGlow1} />
      <View style={styles.bgGlow2} />

      <View style={styles.inner}>

        {/* 로고 영역 */}
        <View style={styles.logoArea}>
          <Text style={styles.logoTitle}>MOODAY</Text>
          <Text style={styles.logoSub}>우리의 공유 캘린더</Text>
        </View>

        {/* 카드 */}
        <View style={styles.card}>
          <TextInput
            placeholder="이메일"
            placeholderTextColor="#555"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            placeholder="비밀번호"
            placeholderTextColor="#555"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.7 }]}
            onPress={signIn}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>
              {loading ? '로그인 중...' : '로그인'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>또는</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.signupBtn, loading && { opacity: 0.7 }]}
            onPress={() => router.push('/signup')}
            activeOpacity={0.85}
          >
            <Text style={styles.signupBtnText}>처음이에요, 회원가입</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    backgroundColor: COLORS.MY,
    opacity: 0.06,
    top: -80,
    right: -80,
  },
  bgGlow2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: COLORS.PARTNER,
    opacity: 0.06,
    bottom: -60,
    left: -60,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 36,
    gap: 10,
  },
  logoTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.MY,
    letterSpacing: 6,
    marginTop: 8,
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
  input: {
    backgroundColor: COLORS.BORDER,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.TEXT,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  loginBtn: {
    backgroundColor: COLORS.MY,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: COLORS.MY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  loginBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.BORDER,
  },
  dividerText: {
    color: '#555',
    fontSize: 13,
    marginHorizontal: 12,
  },
  signupBtn: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.MY,
  },
  signupBtnText: {
    color: COLORS.MY,
    fontSize: 15,
    fontWeight: '600',
  },
});

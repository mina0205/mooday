import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

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
      {/* 배경 장식 원 */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <View style={styles.inner}>

        {/* 로고 영역 */}
        <View style={styles.logoArea}>
          <Text style={styles.logoEmoji}>🩷</Text>

          <Text style={styles.logoTitle}>MOODAY</Text>

          <Text style={styles.logoSub}>우리만의 특별한 하루</Text>
        </View>

        {/* 카드 */}
        <View style={styles.card}>
          <TextInput
            placeholder="이메일"
            placeholderTextColor="#bbb"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            placeholder="비밀번호"
            placeholderTextColor="#bbb"
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

        <Text style={styles.footer}>함께하는 매일이 특별해져요 💙</Text>
      </View>
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
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 36,
    gap: 10,
  },
  logoEmoji: {
    fontSize: 64,
  },
  logoTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#F58A7A',
    letterSpacing: 6,
    marginTop: 8,
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
  input: {
    backgroundColor: '#FFF3F5',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#333',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#FFD6E0',
  },
  loginBtn: {
    backgroundColor: '#F58A7A',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#F58A7A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  loginBtnText: {
    color: '#fff',
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
    backgroundColor: '#F0D6DD',
  },
  dividerText: {
    color: '#ccc',
    fontSize: 13,
    marginHorizontal: 12,
  },
  signupBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#6EC6FF',
  },
  signupBtnText: {
    color: '#6EC6FF',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    color: '#ccc',
    fontSize: 13,
    marginTop: 28,
  },
});
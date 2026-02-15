import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nicknameChecked, setNicknameChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 🔥 닉네임 체크 함수
  const checkNickname = async () => {
    if (!session?.user) return;

    const { data } = await supabase
      .from('user_profiles')
      .select('nickname')
      .eq('id', session.user.id)
      .maybeSingle();

    const inOnboarding = segments[0] === 'onboarding';
    const inAuthGroup = segments[0] === 'login';

    // 닉네임 없음 → 온보딩으로 강제 이동
    if (!data || !data.nickname) {
      if (!inOnboarding) {
        router.replace('/onboarding/nickname');
      }
    } else {
      // 닉네임 있음 → 온보딩에 있으면 메인으로 이동
      if (inOnboarding || inAuthGroup) {
        router.replace('/calendar');
      }
    }

    setNicknameChecked(true);
  };

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'login';

    // 로그인 안된 경우
    if (!session && !inAuthGroup) {
      router.replace('/login');
      return;
    }

    // 로그인 된 경우 → 닉네임 체크
    if (session) {
      checkNickname();
    }
  }, [session, loading, segments]);

  if (loading || (session && !nicknameChecked)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

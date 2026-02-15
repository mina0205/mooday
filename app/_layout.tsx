import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 세션 초기 확인 + 구독
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 🔥 라우팅 가드
  useEffect(() => {
    if (loading) return;

    const isPublicPage =
      segments[0] === 'login' || segments[0] === 'signup';

    // 로그인 안 된 상태
    if (!session) {
      if (!isPublicPage) {
        router.replace('/login');
      }
      return;
    }

    // 로그인 된 상태
    if (session && isPublicPage) {
      router.replace('/(tabs)/calendar');
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
